import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

interface RepoItem {
  type: "dir" | "file";
  path: string;
  name: string;
  size: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const branch = searchParams.get("branch");
  const path = searchParams.get("path") || "";

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing owner or repo" },
      { status: 400 }
    );
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
  });

  try {
    const options: { owner: string; repo: string; path: string; ref?: string } =
      { owner, repo, path };
    if (branch) options.ref = branch;

    const { data } = await octokit.repos.getContent(options);

    // getContent returns array for directories
    const contents = Array.isArray(data) ? data : [data];

    // Map to our simpler format
    const children: RepoItem[] = contents.map((item) => ({
      type: item.type as "dir" | "file",
      path: item.path,
      name: item.name,
      size: item.size || 0,
    }));

    return NextResponse.json({ children });
  } catch (error: unknown) {
    console.error("Error fetching children:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch";
    const status = (error as { status?: number })?.status || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
