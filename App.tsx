
import React, { useState } from 'react';
import Header from './components/Header';
import ReadmeDisplay from './components/ReadmeDisplay';
import { fetchRepoData } from './services/github';
import { generateReadme } from './services/readmeGenerator';
import type { RepoData } from './types';
import { GitHubIcon, SparklesIcon } from './components/icons';

const App: React.FC = () => {
    const [githubUrl, setGithubUrl] = useState<string>('');
    const [readmeContent, setReadmeContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!githubUrl) {
            setError('Please enter a GitHub repository URL.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setReadmeContent('');

        try {
            const repoData: RepoData = await fetchRepoData(githubUrl);
            const generatedMarkdown: string = await generateReadme(repoData);
            setReadmeContent(generatedMarkdown);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <label htmlFor="github-url" className="block text-lg font-medium text-gray-300 mb-2">
                        GitHub Repository URL
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-grow">
                            <GitHubIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="github-url"
                                type="text"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                placeholder="https://github.com/facebook/react"
                                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !githubUrl}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 disabled:bg-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    Generate README
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <ReadmeDisplay
                    content={readmeContent}
                    isLoading={isLoading}
                    error={error}
                />
            </main>
            <footer className="text-center py-6 text-gray-500 text-sm">
                <p>Powered by Google Gemini and React. Crafted with passion.</p>
            </footer>
        </div>
    );
};

export default App;
