import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

// Define TypeScript interfaces for our data structures
interface RepoItem {
    type: 'dir' | 'file';
    path: string;
    name: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string | null;
    children?: RepoItem[];
}

interface GetContentOptions {
    owner: string;
    repo: string;
    path: string;
    ref?: string;
}

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const branch = searchParams.get('branch');
    const depth = parseInt(searchParams.get('depth') || '4'); // Control recursion depth

    if (!owner || !repo) {
        return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
    }

    // Use GitHub token from environment variables if available
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN || undefined
    })

    try {
        // Fetch the repo contents recursively
        const repoContents = await fetchRepoContentsRecursively(octokit, owner, repo, branch, '', depth);
        
        // Only fetch readme at the root level
        let readmeText = '';
        try {
            const readmeOptions = { owner, repo };
            if (branch) {
                Object.assign(readmeOptions, { ref: branch });
            }
            const readme = await octokit.repos.getReadme(readmeOptions);
            readmeText = Buffer.from(readme.data.content, 'base64').toString('utf-8');
        } catch (error) {
            console.error('Error fetching README:', error);
        }
        
        return NextResponse.json({
            readme: readmeText,
            files: repoContents,
            branch: branch || 'default'
        });
    }
    catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// Update the function signature with proper return type
async function fetchRepoContentsRecursively(
    octokit: Octokit,
    owner: string,
    repo: string,
    branch: string | null,
    path: string = '',
    depth: number = 5,
    currentDepth: number = 0
): Promise<RepoItem[]> {
    if (currentDepth >= depth) {
        return [];
    }
    
    const options: GetContentOptions = { owner, repo, path };
    if (branch) {
        options.ref = branch;
    }
    
    try {
        const { data } = await octokit.repos.getContent({ ...options });
        const contents = Array.isArray(data) ? data : [data];
        
        for (let i = 0; i < contents.length; i++) {
            const item = contents[i] as RepoItem;
            if (item.type === 'dir') {
                const subDirContents = await fetchRepoContentsRecursively(
                    octokit,
                    owner,
                    repo,
                    branch,
                    item.path,
                    depth,
                    currentDepth + 1
                );
                item.children = subDirContents;
            }
        }        
        return contents as RepoItem[];
    } catch (error) {
        console.error(`Error fetching contents at path ${path}:`, error);
        return [];
    }
}