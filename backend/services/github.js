
const GITHUB_API_BASE = 'https://api.github.com';

// File types we want to analyze for better README generation
const IMPORTANT_FILE_TYPES = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs',
    '.html', '.css', '.scss', '.sass', '.vue', '.svelte', '.md', '.txt', '.yml', '.yaml', '.json',
    '.xml', '.sql', '.sh', '.bat', '.dockerfile', '.gitignore', '.env.example'
];

// Maximum file size to analyze (100KB)
const MAX_FILE_SIZE = 100 * 1024;

// Maximum number of files to analyze to avoid API limits
const MAX_FILES_TO_ANALYZE = 150;

const parseRepoUrl = (url) => {
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

const shouldAnalyzeFile = (file) => {
    if (file.type !== 'blob' && file.type !== 'file') return false;
    
    // Ignore node_modules, build, dist, vendor, etc.
    if (file.path.includes('node_modules/') || 
        file.path.includes('.git/') || 
        file.path.includes('dist/') || 
        file.path.includes('build/') ||
        file.path.includes('.next/') ||
        file.path.includes('vendor/')) {
        return false;
    }
    
    const extension = '.' + (file.name || file.path.split('/').pop() || '').split('.').pop()?.toLowerCase();
    return IMPORTANT_FILE_TYPES.includes(extension) || 
           ['README.md', 'package.json', 'requirements.txt', 'Dockerfile', 'docker-compose.yml'].includes(file.name || file.path.split('/').pop() || '');
};

const fetchFileContent = async (file, headers) => {
    if (!file.download_url || !shouldAnalyzeFile(file)) return null;
    
    try {
        const response = await fetch(file.download_url, { headers });
        if (!response.ok) return null;
        
        const content = await response.text();
        
        // Skip if file is too large
        if (content.length > MAX_FILE_SIZE) return null;
        
        const fileName = file.name || file.path.split('/').pop() || 'unknown';
        return {
            name: fileName,
            content: content,
            type: fileName.split('.').pop()?.toLowerCase() || 'unknown',
            size: content.length
        };
    } catch (error) {
        console.error(`Error fetching content for ${file.path}:`, error);
        return null;
    }
};

const analyzeRepository = (fileContents, packageJsonContent) => {
    const languages = new Set();
    const frameworks = new Set();
    const dependencies = new Set();
    
    // Analyze file extensions for languages
    fileContents.forEach(file => {
        const ext = file.type.toLowerCase();
        switch (ext) {
            case 'js':
            case 'jsx':
                languages.add('JavaScript');
                break;
            case 'ts':
            case 'tsx':
                languages.add('TypeScript');
                break;
            case 'py':
                languages.add('Python');
                break;
            case 'java':
                languages.add('Java');
                break;
            case 'cpp':
            case 'c':
                languages.add('C/C++');
                break;
            case 'cs':
                languages.add('C#');
                break;
            case 'php':
                languages.add('PHP');
                break;
            case 'rb':
                languages.add('Ruby');
                break;
            case 'go':
                languages.add('Go');
                break;
            case 'rs':
                languages.add('Rust');
                break;
            case 'html':
                languages.add('HTML');
                break;
            case 'css':
            case 'scss':
            case 'sass':
                languages.add('CSS');
                break;
        }
    });
    
    // Analyze package.json for frameworks and dependencies
    if (packageJsonContent) {
        try {
            const packageData = JSON.parse(packageJsonContent);
            const allDeps = { 
                ...packageData.dependencies, 
                ...packageData.devDependencies 
            };
            
            Object.keys(allDeps || {}).forEach(dep => {
                dependencies.add(dep);
                
                // Identify popular frameworks
                if (dep.includes('react')) frameworks.add('React');
                if (dep.includes('vue')) frameworks.add('Vue.js');
                if (dep.includes('angular')) frameworks.add('Angular');
                if (dep.includes('express')) frameworks.add('Express.js');
                if (dep.includes('next')) frameworks.add('Next.js');
                if (dep.includes('nuxt')) frameworks.add('Nuxt.js');
                if (dep.includes('svelte')) frameworks.add('Svelte');
                if (dep.includes('vite')) frameworks.add('Vite');
                if (dep.includes('webpack')) frameworks.add('Webpack');
                if (dep.includes('tailwind')) frameworks.add('Tailwind CSS');
                if (dep.includes('bootstrap')) frameworks.add('Bootstrap');
            });
        } catch (error) {
            console.error('Error parsing package.json:', error);
        }
    }
    
    // Analyze file contents for additional framework detection
    fileContents.forEach(file => {
        const content = file.content.toLowerCase();
        if (content.includes('import react') || content.includes('from "react"')) {
            frameworks.add('React');
        }
        if (content.includes('import vue') || content.includes('from "vue"')) {
            frameworks.add('Vue.js');
        }
        if (content.includes('django') || content.includes('from django')) {
            frameworks.add('Django');
        }
        if (content.includes('flask') || content.includes('from flask')) {
            frameworks.add('Flask');
        }
        if (content.includes('spring') || content.includes('@springbootapplication')) {
            frameworks.add('Spring Boot');
        }
    });
    
    return {
        totalFiles: fileContents.length,
        languages: Array.from(languages),
        frameworks: Array.from(frameworks),
        dependencies: Array.from(dependencies).slice(0, 20) // Limit to first 20 dependencies
    };
};

export const fetchRepoData = async (repoUrl, githubToken) => {
    const repoParts = parseRepoUrl(repoUrl);
    if (!repoParts) {
        throw new Error('Invalid GitHub repository URL. Please use a format like https://github.com/owner/repo.');
    }

    const { owner, repo } = repoParts;

    const headers = {};
    if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
    }

    try {
        const repoDetailsRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers });
        if (repoDetailsRes.status === 404) {
            throw new Error(`Repository not found. Please check the URL.`);
        }
        if (!repoDetailsRes.ok) {
            const errText = await repoDetailsRes.text();
            throw new Error(`Failed to fetch repository details: ${repoDetailsRes.statusText}. ${errText}`);
        }

        const repoDetails = await repoDetailsRes.json();
        const defaultBranch = repoDetails.default_branch || 'main';

        const treeRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
        if (!treeRes.ok) {
            const errText = await treeRes.text();
            throw new Error(`Failed to fetch repository tree: ${treeRes.statusText}. ${errText}`);
        }

        const treeData = await treeRes.json();
        const allFiles = treeData.tree || [];

        // Map to GitHubFile format
        const rootFiles = allFiles.map(file => {
            return {
                name: file.path.split('/').pop() || file.path,
                path: file.path,
                type: file.type === 'blob' ? 'file' : 'dir',
                download_url: file.type === 'blob' ? `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}` : null
            };
        });

        // Find package.json in root (path exactly 'package.json')
        const packageJsonFile = rootFiles.find(file => file.path === 'package.json');
        let packageJsonContent = null;

        if (packageJsonFile && packageJsonFile.download_url) {
            const packageJsonRes = await fetch(packageJsonFile.download_url);
            if (packageJsonRes.ok) {
                packageJsonContent = await packageJsonRes.text();
            }
        }

        // Prioritize important source files
        const sortedFiles = [...rootFiles].sort((a, b) => {
            const getPriority = (f) => {
                if (f.path === 'package.json') return 0;
                if (f.path === 'README.md') return 1;
                if (f.path.startsWith('src/')) return 2;
                if (f.path.startsWith('lib/')) return 3;
                if (f.path.startsWith('app/')) return 4;
                return 5;
            };
            return getPriority(a) - getPriority(b);
        });

        const filesToAnalyze = sortedFiles
            .filter(shouldAnalyzeFile)
            .slice(0, MAX_FILES_TO_ANALYZE);

        console.log(`Analyzing ${filesToAnalyze.length} files for better README generation...`);

        // Fetch file contents in parallel
        const fileContentPromises = filesToAnalyze.map(file => fetchFileContent(file, headers));
        const fileContentResults = await Promise.all(fileContentPromises);
        
        // Filter out null results
        const fileContents = fileContentResults.filter(content => content !== null);

        const analysisMetadata = analyzeRepository(fileContents, packageJsonContent);

        return {
            repoDetails,
            rootFiles,
            packageJsonContent,
            fileContents,
            analysisMetadata
        };
    } catch (error) {
        if (error?.message?.includes('rate limit')) {
            throw new Error('GitHub API rate limit exceeded. Add GITHUB_TOKEN to your backend environment.');
        }
        throw new Error(`Failed to fetch repository data: ${error?.message || error}`);
    }
};
