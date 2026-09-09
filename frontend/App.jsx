import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import ReadmeDisplay from "./components/ReadmeDisplay";
import { generateReadme } from "./services/api";
import { GitHubIcon, SparklesIcon } from "./components/icons";

const App = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [readmeContent, setReadmeContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!githubUrl) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReadmeContent("");

    try {
      const generatedMarkdown = await generateReadme(githubUrl);
      setReadmeContent(generatedMarkdown);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <Header />

      <main className="container mx-auto px-4 py-12 max-w-5xl flex-grow z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-slate-700/50">
            <label
              htmlFor="github-url"
              className="block text-xl font-medium text-slate-200 mb-6 tracking-wide"
            >
              Analyze any public GitHub Repository
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <GitHubIcon className="w-6 h-6 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  id="github-url"
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="https://github.com/facebook/react"
                  className="w-full pl-14 pr-4 py-4 bg-slate-900/60 border border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-lg outline-none transition-all placeholder:text-slate-500 shadow-inner"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isLoading || !githubUrl}
                className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {(isLoading || error || readmeContent) && (
            <motion.div
              key="content-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <ReadmeDisplay
                content={readmeContent}
                isLoading={isLoading}
                error={error}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="z-10 text-center py-6 text-slate-500 text-sm mt-auto border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-md">
        <p>Powered by Groq &bull; Crafted with precision.</p>
      </footer>
    </div>
  );
};

export default App;
