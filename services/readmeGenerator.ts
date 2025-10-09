import { GoogleGenAI } from "@google/genai";
import type { RepoData } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const createPrompt = (data: RepoData): string => {
    const { repoDetails, rootFiles, packageJsonContent, fileContents, analysisMetadata } = data;

    const fileList = rootFiles.map(file => `${file.name}${file.type === 'dir' ? '/' : ''}`).join(', ');

    // Create a summary of analyzed files
    const analyzedFilesSummary = fileContents.length > 0 
        ? fileContents.map(file => `${file.name} (${file.type}, ${file.size} bytes)`).join(', ')
        : 'No detailed file analysis available';

    // Create code snippets from important files (first 200 chars of each)
    const codeSnippets = fileContents
        .filter(file => ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c'].includes(file.type))
        .slice(0, 5) // Limit to 5 files to avoid overwhelming the prompt
        .map(file => `**${file.name}** (${file.type}):\n\`\`\`${file.type}\n${file.content.substring(0, 200)}${file.content.length > 200 ? '...' : ''}\n\`\`\``)
        .join('\n\n');

    let prompt = `
You are an expert technical writer specializing in creating high-quality README.md files for software projects.
Your task is to generate a comprehensive and well-structured README.md file in Markdown format based on the provided GitHub repository information and detailed file analysis.

**Repository Information:**
- **Name:** ${repoDetails.name}
- **Description:** ${repoDetails.description || 'No description provided.'}
- **Main Language:** ${repoDetails.language || 'Not specified.'}
- **Root Directory Files:** ${fileList}

**Detailed Analysis Results:**
- **Total Files Analyzed:** ${analysisMetadata.totalFiles}
- **Languages Detected:** ${analysisMetadata.languages.join(', ') || 'None detected'}
- **Frameworks/Libraries:** ${analysisMetadata.frameworks.join(', ') || 'None detected'}
- **Key Dependencies:** ${analysisMetadata.dependencies.slice(0, 10).join(', ') || 'None found'}
- **Analyzed Files:** ${analyzedFilesSummary}

${packageJsonContent ? `**package.json contents:** \n\`\`\`json\n${packageJsonContent}\n\`\`\`\n` : ''}

${codeSnippets ? `**Code Analysis (Sample snippets):**\n${codeSnippets}\n` : ''}

**Instructions:**
Generate a complete README.md file with the following sections. Use the detailed file analysis and code snippets to create accurate, specific content rather than generic descriptions.

1.  **Project Title:** Use the repository name as the main H1 title.
2.  **Badges:** Add relevant badges (e.g., from shields.io). Include a license badge and a top language badge. Add framework-specific badges based on detected technologies.
3.  **Description:** Create an engaging summary based on the repository analysis, detected technologies, and file structure. Be specific about what the project does based on the code analysis.
4.  **Features:** Create a bulleted list of specific features based on the analyzed code structure and file contents, not generic ones.
5.  **Tech Stack:** List the exact technologies, languages, and frameworks detected from the analysis. Include version information from package.json if available.
6.  **Installation:** Provide precise, step-by-step instructions based on the detected project type. If it's a Node.js project with package.json, include npm/yarn commands. For Python projects, include pip requirements. Customize based on detected technology stack.
7.  **Usage:** Explain how to run or use the project based on the analyzed files and scripts in package.json. Provide specific commands and examples based on the project structure.
8.  **API Documentation:** If API endpoints or configuration files are detected in the analysis, provide relevant documentation sections.
9.  **Project Structure:** Based on the file analysis, provide a clear overview of the project organization and key files.
10. **Contributing:** Include a standard section inviting contributions and outlining the basic process (fork, create branch, pull request).
11. **License:** State the license of the project. It is licensed under the ${repoDetails.license?.name || 'MIT License'}.

**Output Rules:**
- The entire output MUST be in valid Markdown format.
- Do not include any text, explanations, or code block specifiers like \`\`\`markdown before or after the main Markdown content.
- Start directly with the H1 project title (e.g., '# Project Name').
- Make the README visually appealing and easy to read.
- Be specific and accurate based on the actual code analysis rather than making generic assumptions.
- Include relevant code examples or configuration snippets when appropriate.
`;

    return prompt.trim();
};

export const generateReadme = async (repoData: RepoData): Promise<string> => {
    const prompt = createPrompt(repoData);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.4,
                topP: 0.95,
                topK: 64,
            },
        });
        // Extract the generated text from the Gemini API response
        // For @google/genai v1.x, the text is in response.candidates[0].content.parts[0].text
        const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("No README content generated by Gemini.");
        return text;
    } catch (error) {
        console.error("Error generating README with Gemini:", error);
        throw new Error("Failed to generate README. The AI model could not process the request.");
    }
};
