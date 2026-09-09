import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, GitHubIcon } from './icons';

const Header = () => {
    return (
        <header className="py-12 z-10 relative">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="container mx-auto px-4 flex flex-col justify-center items-center gap-6"
            >
                <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700/50 shadow-lg">
                    <GitHubIcon className="w-8 h-8 text-slate-200" />
                    <SparklesIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text tracking-tight">
                        AI README Generator
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light">
                        Instantly create stunning, highly accurate documentation for any codebase using the power of AI.
                    </p>
                </div>
            </motion.div>
        </header>
    );
};

export default Header;
