import { AIAnalysisResult, FileSystemNode, NodeType } from "@/types/mapmyrepo";

const getApiKey = () => {
  // In Next.js, client-side env vars must be prefixed with NEXT_PUBLIC_
  const apiKey =
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is missing.");
    return null;
  }
  return apiKey;
};

const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "Error: API Key is missing. Please check .env.local";

  // Use gemini-2.5-flash as primary model (best balance of speed/capability)
  const models = ["gemini-2.5-flash"];
  let lastError = "";

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Model ${model} failed (${response.status}):`, errText);

        // User-friendly error messages
        if (response.status === 429) {
          lastError =
            "AI is taking a short break. Please try again in a moment.";
        } else if (response.status === 401 || response.status === 403) {
          lastError = "AI service is temporarily unavailable.";
        } else {
          lastError = "Could not analyze this content right now.";
        }
        continue; // Try next model
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = "AI couldn't generate a response. Try again.";
        continue;
      }

      return text;
    } catch (error: any) {
      console.error(`Model ${model} network error:`, error);
      lastError = "Connection issue. Please check your network.";
    }
  }

  return lastError || "Analysis unavailable at the moment.";
};

// Helper to create a string representation of the tree for the AI
export const generateTreeString = (
  node: FileSystemNode,
  depth: number = 0,
  maxDepth: number = 2,
  maxItems: number = 50,
  currentCount: { val: number } = { val: 0 }
): string => {
  if (currentCount.val >= maxItems) return "";

  const indent = "  ".repeat(depth);
  let result = `${indent}- ${node.name} (${node.type})\n`;
  currentCount.val++;

  if (node.children) {
    if (depth < maxDepth && currentCount.val < maxItems) {
      for (const child of node.children) {
        if (currentCount.val >= maxItems) {
          result += `${indent}  ... (truncated)\n`;
          break;
        }
        result += generateTreeString(
          child,
          depth + 1,
          maxDepth,
          maxItems,
          currentCount
        );
      }
    } else if (node.children.length > 0) {
      result += `${indent}  ... (${node.children.length} items)\n`;
    }
  }
  return result;
};

export const analyzeCode = async (
  fileName: string,
  fileContent: string
): Promise<AIAnalysisResult | null> => {
  const truncatedContent = fileContent.slice(0, 40000);

  const prompt = `
    Analyze "${fileName}".
    1. Summary: 2 sentences on its architectural role.
    2. Exports: List main functions/classes/components (max 10 words desc).
    Output JSON format ONLY.
    
    CODE:
    ${truncatedContent}
  `;

  const text = await callGemini(prompt);

  // Check if it's a known error message or doesn't look like JSON
  if (
    !text.trim().startsWith("{") ||
    text.includes("AI is taking a short break") ||
    text.includes("AI service is temporarily unavailable") ||
    text.includes("Could not analyze") ||
    text.includes("AI couldn't generate") ||
    text.includes("Connection issue") ||
    text.includes("Analysis unavailable")
  ) {
    console.warn("Analysis skipped (AI returned message):", text);
    return null;
  }

  try {
    // Clean up markdown code blocks if present
    const jsonStr = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(jsonStr) as AIAnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini JSON:", error);
    return null;
  }
};

export const analyzeFolder = async (
  node: FileSystemNode
): Promise<string | null> => {
  const treeMap = generateTreeString(node);
  const prompt = `
        Analyze folder: ${node.name}
        Structure:
        ${treeMap}
        
        Summarize responsibility in 2 sentences.
    `;

  const text = await callGemini(prompt);
  return text;
};

export const askQuestion = async (
  node: FileSystemNode,
  rootNode: FileSystemNode | null,
  question: string
): Promise<string> => {
  let context = "";
  if (node.type === NodeType.FOLDER) {
    context = `Folder Structure Map (Recursive):\n${generateTreeString(node)}`;
  } else {
    context = node.content
      ? `Code Content:\n${node.content.slice(0, 30000)}`
      : `File: ${node.name} (Content unavailable)`;
  }

  // Add global context if available
  let globalContext = "";
  if (rootNode) {
    // We use a shallower depth for the global tree to save tokens, but enough to show structure
    globalContext = `Repository Structure (Root): \n${generateTreeString(
      rootNode,
      0
    )}`;
  }

  const prompt = `
        You are an expert senior software engineer analyzing a codebase.
        
        Target File/Folder: "${node.path}" (${node.type})
        
        Global Repository Context:
        ${globalContext}
        
        Specific Context (The user is looking at this right now):
        ${context}
        
        User Question: "${question}"
        
        Instructions:
        1. Answer directly and authoritatively. Avoid hedging words like "likely", "possibly", "might".
        2. Use the Global Repository Context to understand where this file fits in the bigger picture.
        3. If the answer depends on code not visible in the Specific Context, state clearly what you would expect to find based on standard patterns, but don't guess wildly.
        4. Keep the answer under 150 words. Use Markdown for formatting.
    `;

  return await callGemini(prompt);
};

export const askUniverseQuestion = async (
  node: any,
  allRepos: any[],
  question: string
): Promise<string> => {
  let context = "";

  if (node.type === "USER") {
    const totalStars = allRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const languages = [
      ...new Set(allRepos.map((r: any) => r.language).filter(Boolean)),
    ];
    const topRepos = [...allRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5);

    context = `
      User Context:
      - Total Repositories: ${allRepos.length}
      - Total Stars: ${totalStars}
      - Languages: ${languages.join(", ")}
      - Top Repositories: ${topRepos
        .map((r) => `${r.name} (${r.stargazers_count} stars)`)
        .join(", ")}
    `;
  } else if (node.type === "LANGUAGE") {
    const languageRepos = allRepos.filter((r: any) => r.language === node.name);
    const totalStars = languageRepos.reduce(
      (sum, r) => sum + r.stargazers_count,
      0
    );

    context = `
      Language Context (${node.name}):
      - Total Repositories: ${languageRepos.length}
      - Total Stars: ${totalStars}
      - Repositories: ${languageRepos.map((r) => r.name).join(", ")}
    `;
  } else if (node.type === "REPO") {
    const repo = node.data;
    if (repo) {
      context = `
        Repository Context (${repo.name}):
        - Description: ${repo.description || "N/A"}
        - Language: ${repo.language}
        - Stars: ${repo.stargazers_count}
        - Forks: ${repo.forks_count}
        - Open Issues: ${repo.open_issues_count}
        - Created: ${repo.created_at}
        - Last Updated: ${repo.updated_at}
      `;
    }
  }

  const prompt = `
    You are an expert software engineer analyzing a GitHub user's profile and repositories.
    
    Target Node: "${node.name}" (${node.type})
    
    Context:
    ${context}
    
    User Question: "${question}"
    
    Instructions:
    1. Answer directly and helpfully.
    2. Use the provided context to give specific details.
    3. Keep the answer under 150 words. Use Markdown.
  `;

  return await callGemini(prompt);
};

export const findRelevantFile = async (
  query: string,
  allFilePaths: string[]
): Promise<string | null> => {
  const pathList = allFilePaths.slice(0, 1000).join("\n");
  const prompt = `
        I have a list of file paths from a software repository.
        The user is asking: "${query}"
        
        Based on the file names, folder structure, and common software conventions, identify the SINGLE file path that is MOST LIKELY to contain the logic or definition the user is looking for.
        
        Return ONLY the full path string. 
        If nothing is relevant, return "null".
        
        File Paths:
        ${pathList}
    `;

  const text = await callGemini(prompt);
  if (!text || text.startsWith("Error") || text.trim() === "null") return null;

  return text.replace(/`/g, "").replace(/'/g, "").replace(/"/g, "").trim();
};
