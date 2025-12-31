import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { summarizeContent } from "@/lib/summarizeContent";

// Add this interface at the top of the file
interface GetContentParams {
  owner: string;
  repo: string;
  path: string;
  ref?: string;
}

export async function POST(request: NextRequest) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

  async function fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    branch: string | null
  ) {
    const options: GetContentParams = { owner, repo, path };
    if (branch) options.ref = branch;

    const res = await octokit.repos.getContent({ ...options });
    if (!("content" in res.data)) throw new Error("No content found");

    const fileContent = Buffer.from(res.data.content, "base64").toString(
      "utf8"
    );
    return fileContent;
  }

  let path = "";

  try {
    const body = await request.json();
    const { owner, repo, branch } = body;
    path = body.path;

    if (!owner || !repo || !path) {
      return NextResponse.json(
        { error: "Missing required params" },
        { status: 400 }
      );
    }

    const content = await fetchFileContent(owner, repo, path, branch);
    const summaryText = await summarizeContent(content, branch); // ✅ Direct function call

    return NextResponse.json({ summary: summaryText });
  } catch (e: unknown) {
    console.error(`Error fetching/summarizing ${path}:`, e);
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
