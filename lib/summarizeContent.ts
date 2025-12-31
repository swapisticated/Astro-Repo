const geminiApiUrl =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const geminiApiKey = process.env.GEMINI_API_KEY;

export async function summarizeContent(content: string, branch: string | null) {
  if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `You are an expert senior software engineer. Summarize this code file clearly and briefly, like you are explaining it to a junior developer who is new to the project and the codebase is large and complex and they are not familiar with the code.

Keep the tone of your response friendly and subtle, like you are helping a friend. 

1. What is the purpose of this file?
2. What are the main functions/classes/components?
3. What modules/libraries does it depend on?
4. Mention any tricky logic or patterns used.
5. The file is from the branch: ${branch || "default"}.
Here is the code:\n\n${content}`,
          },
        ],
      },
    ],
  };

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorBody = await response.text();
          console.warn(
            `Gemini API rate limit hit (Attempt ${
              attempt + 1
            }/${MAX_RETRIES}). Retrying...`
          );

          // Extract retry delay from error message if possible, or default to exponential backoff
          let delay = 2000 * Math.pow(2, attempt);
          try {
            // Simple regex to find "retry in X s"
            const match = errorBody.match(/retry in (\d+(\.\d+)?)s/);
            if (match && match[1]) {
              delay = Math.ceil(parseFloat(match[1]) * 1000) + 1000; // Add 1s buffer
            }
          } catch (e) {
            // ignore parsing error
          }

          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          attempt++;
          continue;
        }

        const errorBody = await response.text();
        console.error("Gemini API Error Details:", errorBody);
        throw new Error(
          `Gemini API error: ${response.statusText} - ${errorBody}`
        );
      }

      const data = await response.json();

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error("Unexpected Gemini response format");
    } catch (error: any) {
      // If it's the last attempt or not a retry-able error (already handled above for 429 response, this catch is for network errors etc if we wanted to retry them, but mainly we want to re-throw if we ran out of retries)
      if (
        attempt === MAX_RETRIES - 1 ||
        !error.message.includes("Gemini API error")
      ) {
        throw error;
      }
      // If we want to retry on network errors, we could do it here, but let's stick to 429 for now as that's the main issue.
      // Actually, the 429 is handled inside the 'if (!response.ok)' block which continues the loop.
      // So if we are here, it's a different error.
      throw error;
    }
  }

  throw new Error("Max retries exceeded for Gemini API");
}
