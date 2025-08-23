
import React from 'react';
import { SparklesIcon, GitHubIcon } from './icons';

const Header: React.FC = () => {
    return (
        <header className="py-6 border-b border-gray-700/50">
            <div className="container mx-auto px-4 flex justify-center items-center gap-4">
                <GitHubIcon className="w-10 h-10 text-blue-400" />
                <SparklesIcon className="w-8 h-8 text-purple-400" />
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    AI README Generator
                </h1>
            </div>
            <p className="text-center text-gray-400 mt-2">
                Create a stunning README for your GitHub project in seconds.
            </p>
        </header>
    );
};

export default Header;
