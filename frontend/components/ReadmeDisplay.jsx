import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CopyIcon, DownloadIcon, ErrorIcon, SparklesIcon } from './icons';

const LoadingSkeleton = () => {
    return (
        <div className="mt-8 p-8 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg animate-pulse">
            <div className="h-10 bg-slate-700/50 rounded-lg w-1/3 mb-8"></div>
            <div className="space-y-4 mb-8">
                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
            </div>
            <div className="h-8 bg-slate-700/50 rounded-lg w-1/4 mt-10 mb-6"></div>
            <div className="space-y-4">
                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
            </div>
            <div className="h-8 bg-slate-700/50 rounded-lg w-1/5 mt-10 mb-6"></div>
            <div className="h-32 bg-slate-700/50 rounded-xl w-full"></div>
        </div>
    );
};

const ReadmeDisplay = ({ content, isLoading, error }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy Markdown');
    const [activeTab, setActiveTab] = useState('preview');

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
            <div className="mt-8 p-8 bg-red-900/20 backdrop-blur-md border border-red-500/50 rounded-2xl text-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <ErrorIcon className="w-16 h-16 mx-auto text-red-400 mb-4 drop-shadow-md" />
                <h3 className="text-2xl font-bold text-red-300">Analysis Failed</h3>
                <p className="text-red-400/80 mt-2 text-lg">{error}</p>
            </div>
        );
    }
    
    if (!content) {
        return (
            <div className="mt-8 p-12 bg-slate-800/30 backdrop-blur-sm border-2 border-dashed border-slate-700 rounded-3xl text-center flex flex-col items-center justify-center h-96 transition-all hover:bg-slate-800/50">
                <SparklesIcon className="w-20 h-20 text-slate-600 mb-6" />
                <p className="text-slate-300 text-xl font-medium">Your generated README will appear here.</p>
                <p className="text-slate-500 mt-2">Enter a GitHub repo URL above to get started.</p>
            </div>
        );
    }
    
    return (
        <div className="mt-8 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center bg-slate-800/80 px-4 py-3 border-b border-slate-700/50">
                <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => setActiveTab('raw')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'raw' ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Raw Markdown
                    </button>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/80 rounded-lg text-sm text-slate-300 transition-colors border border-slate-600/50"
                    >
                        <CopyIcon className="w-4 h-4" /> <span className="hidden sm:inline">{copyButtonText}</span>
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors shadow-lg shadow-blue-900/30 border border-blue-500"
                    >
                        <DownloadIcon className="w-4 h-4" /> <span className="hidden sm:inline">Download</span>
                    </button>
                </div>
            </div>
            
            <div className="p-6 md:p-10 h-[700px] overflow-y-auto custom-scrollbar">
                {activeTab === 'preview' ? (
                    <div className="markdown-body">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            rehypePlugins={[rehypeHighlight]}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <textarea
                        value={content}
                        readOnly
                        className="w-full h-full bg-transparent text-slate-300 font-mono text-sm leading-relaxed outline-none resize-none custom-scrollbar"
                    />
                )}
            </div>
        </div>
    );
};

export default ReadmeDisplay;
