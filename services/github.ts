
import type { GitHubRepo, GitHubFile, RepoData } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname !== 'github.com') {
            return null;
        }
        const pathParts = urlObj.pathname.split('/').filter(part => part);
        if (pathParts.length < 2) {
            return null;
        }
        const [owner, repo] = pathParts;
        return { owner, repo: repo.replace('.git', '') };
    } catch (error) {
        console.error("URL parsing error:", error);
        return null;
    }
};

export const fetchRepoData = async (repoUrl: string): Promise<RepoData> => {
    const repoParts = parseRepoUrl(repoUrl);
    if (!repoParts) {
        throw new Error('Invalid GitHub repository URL. Please use a format like https://github.com/owner/repo.');
    }

    const { owner, repo } = repoParts;

    // Support GitHub token authentication via environment variable (VITE_GITHUB_TOKEN)
    const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
    const headers: Record<string, string> = {};
    if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
    }

    try {
        const [repoDetailsRes, rootFilesRes] = await Promise.all([
            fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers }),
            fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents`, { headers })
        ]);

        if (repoDetailsRes.status === 404 || rootFilesRes.status === 404) {
            throw new Error(`Repository not found. Please check the URL.`);
        }

        if (!repoDetailsRes.ok) {
            const errText = await repoDetailsRes.text();
            throw new Error(`Failed to fetch repository details: ${repoDetailsRes.statusText}. ${errText}`);
        }
        if (!rootFilesRes.ok) {
            const errText = await rootFilesRes.text();
            throw new Error(`Failed to fetch repository contents: ${rootFilesRes.statusText}. ${errText}`);
        }

        const repoDetails: GitHubRepo = await repoDetailsRes.json();
        const rootFiles: GitHubFile[] = await rootFilesRes.json();

        const packageJsonFile = rootFiles.find(file => file.name === 'package.json' && file.type === 'file');
        let packageJsonContent: string | null = null;

        if (packageJsonFile && packageJsonFile.download_url) {
            const packageJsonRes = await fetch(packageJsonFile.download_url);
            if (packageJsonRes.ok) {
                packageJsonContent = await packageJsonRes.text();
            }
        }

        return {
            repoDetails,
            rootFiles,
            packageJsonContent
        };
    } catch (error: any) {
        // Show a more helpful error message
        if (error?.message?.includes('rate limit')) {
            throw new Error('GitHub API rate limit exceeded. Please add a personal access token to your .env.local as VITE_GITHUB_TOKEN.');
        }
        throw new Error(`Failed to fetch repository data: ${error?.message || error}`);
    }
};
