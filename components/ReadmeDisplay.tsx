
import React, { useState, useEffect } from 'react';
import { CopyIcon, DownloadIcon, ErrorIcon, SparklesIcon } from './icons';

interface ReadmeDisplayProps {
    content: string;
    isLoading: boolean;
    error: string | null;
}

const LoadingSkeleton: React.FC = () => {
    return (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700 animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
            <div className="h-6 bg-gray-700 rounded w-1/4 mt-8 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-4/6"></div>
            </div>
            <div className="h-6 bg-gray-700 rounded w-1/4 mt-8 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>
        </div>
    );
};

const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({ content, isLoading, error }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy Markdown');

    useEffect(() => {
        if (copyButtonText !== 'Copy Markdown') {
            const timer = setTimeout(() => setCopyButtonText('Copy Markdown'), 2000);
            return () => clearTimeout(timer);
        }
    }, [copyButtonText]);

    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setCopyButtonText('Copied!');
    };

    const handleDownload = () => {
        if (!content) return;
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'README.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="mt-8 p-6 bg-red-900/20 border border-red-500 rounded-lg text-center">
                <ErrorIcon className="w-12 h-12 mx-auto text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
                <p className="text-red-400 mt-2">{error}</p>
            </div>
        );
    }
    
    if (!content) {
        return (
            <div className="mt-8 p-10 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg text-center flex flex-col items-center justify-center h-96">
                <SparklesIcon className="w-16 h-16 text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">Your generated README will appear here.</p>
                <p className="text-gray-500">Enter a GitHub repo URL above to get started.</p>
            </div>
        );
    }
    
    return (
        <div className="mt-8">
            <div className="flex justify-end gap-2 mb-2">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
                >
                    <CopyIcon className="w-4 h-4" /> {copyButtonText}
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm transition-colors"
                >
                    <DownloadIcon className="w-4 h-4" /> Download .md
                </button>
            </div>
            <textarea
                value={content}
                readOnly
                className="w-full h-[600px] p-4 bg-gray-950/70 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Generated README content..."
            />
        </div>
    );
};

export default ReadmeDisplay;
