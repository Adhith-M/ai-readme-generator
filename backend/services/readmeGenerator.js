import Groq from 'groq-sdk';

const createPrompt = (data) => {
    const { repoDetails, rootFiles, packageJsonContent, fileContents, analysisMetadata } = data;

    const fileList = rootFiles.map(file => `${file.name}${file.type === 'dir' ? '/' : ''}`).join(', ');

    // Create a summary of analyzed files
    const analyzedFilesSummary = fileContents.length > 0 
        ? fileContents.map(file => `${file.name} (${file.type}, ${file.size} bytes)`).join(', ')
        : 'No detailed file analysis available';

    // Create code snippets from all important files
    const codeSnippets = fileContents
        .filter(file => ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php'].includes(file.type))
        .map(file => `**${file.name}** (${file.type}):\n\`\`\`${file.type}\n${file.content.length > 10000 ? file.content.substring(0, 10000) + '\n// (Truncated for brevity)' : file.content}\n\`\`\``)
        .join('\n\n');

    let prompt = `
You are an expert technical writer and principal software engineer specializing in creating exceptional, highly detailed README.md files.
Your task is to generate a comprehensive, visually appealing, and structurally perfect README.md file in Markdown format based on the provided GitHub repository information, file structure, and deep code analysis.

**Repository Information:**
- **Name:** ${repoDetails.name}
- **Description:** ${repoDetails.description || 'No description provided.'}
- **Main Language:** ${repoDetails.language || 'Not specified.'}
- **Root Directory Files:** ${fileList}

**Detailed Analysis Results:**
- **Total Files Analyzed:** ${analysisMetadata.totalFiles}
- **Languages Detected:** ${analysisMetadata.languages.join(', ') || 'None detected'}
- **Frameworks/Libraries:** ${analysisMetadata.frameworks.join(', ') || 'None detected'}
- **Key Dependencies:** ${analysisMetadata.dependencies.slice(0, 15).join(', ') || 'None found'}
- **Analyzed Files:** ${analyzedFilesSummary}

${packageJsonContent ? `**package.json contents:** \n\`\`\`json\n${packageJsonContent}\n\`\`\`\n` : ''}

${codeSnippets ? `**Code Analysis (Sample snippets from core files):**\n${codeSnippets}\n` : ''}

**Instructions:**
Generate a complete README.md file with the following sections. Use the detailed file analysis and code snippets to create accurate, specific content rather than generic descriptions. Really analyze the code snippets to understand the actual logic, architecture, and purpose of the project.

1.  **Project Title:** Use the repository name as the main H1 title. Make it stand out.
2.  **Badges:** Add relevant modern badges (e.g., from shields.io). Include a top language badge, and framework-specific badges based on detected technologies. DO NOT include a license badge.
3.  **Description:** Create a powerful, engaging summary based on the repository analysis, detected technologies, and file structure. Be highly specific about what the project does and its core value proposition based on the deep code analysis.
4.  **Features:** Create a compelling bulleted list of specific features derived from the actual code logic and architecture. Do not use generic features.
5.  **Tech Stack:** List the exact technologies, languages, and frameworks detected. Group them logically (e.g., Frontend, Backend, Tools).
6.  **Installation:** Provide precise, step-by-step instructions. If it's a Node project with package.json, include npm/yarn/pnpm commands. Customize accurately based on the detected technology stack.
7.  **Usage:** Explain how to run or use the project based on the analyzed files and scripts. Provide specific commands and realistic examples based on the actual codebase.
8.  **Architecture / Project Structure:** Provide a clear, visual tree-like overview of the project organization and explain the purpose of key directories and files based on your analysis.
9.  **Contributing:** Include a standard section inviting contributions.

**Output Rules:**
- The entire output MUST be in valid Markdown format.
- DO NOT wrap the output in \`\`\`markdown ... \`\`\` code blocks. Output raw markdown directly.
- Start directly with the H1 project title (e.g., '# Project Name').
- Make the README visually striking, well-spaced, and highly professional.
- Be extremely specific and accurate based on the actual code analysis.
- Include relevant code examples or configuration snippets when appropriate to illustrate usage.
`;

    return prompt.trim();
};

export const generateReadme = async (repoData) => {
    const prompt = createPrompt(repoData);
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured on the backend.');
    }

    const groq = new Groq({ apiKey });

    try {
        const response = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert technical writer and principal software engineer.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.4,
            top_p: 0.95,
            max_tokens: 12000
        });
        const text = response?.choices?.[0]?.message?.content;
        if (!text) throw new Error('No README content generated by Groq.');
        return text;
    } catch (error) {
        console.error('Error generating README with Groq:', error);
        throw new Error(`Failed to generate README with Groq: ${error?.message || 'The AI model could not process the request.'}`);
    }
};
