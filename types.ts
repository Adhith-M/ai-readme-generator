
export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  license: {
    name: string;
  } | null;
}

export interface GitHubFile {
  name: string;
  type: 'file' | 'dir';
  download_url: string | null;
}

export interface RepoData {
    repoDetails: GitHubRepo;
    rootFiles: GitHubFile[];
    packageJsonContent?: string | null;
}
