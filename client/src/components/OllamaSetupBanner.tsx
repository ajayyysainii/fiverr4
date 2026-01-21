import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, RefreshCw, Terminal, CheckCircle, Copy, ExternalLink } from 'lucide-react';

interface OllamaSetupBannerProps {
    onRetry: () => Promise<{ connected: boolean }>;
    onDismiss: () => void;
    error?: string;
}

export function OllamaSetupBanner({ onRetry, onDismiss, error }: OllamaSetupBannerProps) {
    const [isRetrying, setIsRetrying] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            const status = await onRetry();
            if (status.connected) {
                onDismiss();
            }
        } finally {
            setIsRetrying(false);
        }
    };

    const copyCommand = (command: string, id: string) => {
        navigator.clipboard.writeText(command);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const commands = [
        {
            id: 'install',
            label: 'Install Ollama',
            command: 'curl -fsSL https://ollama.com/install.sh | sh',
            description: 'Download and install Ollama on your machine',
        },
        {
            id: 'pull',
            label: 'Pull Model',
            command: 'ollama pull gemma3:4b',
            description: 'Download the required AI model',
        },
        {
            id: 'serve',
            label: 'Start with CORS',
            command: 'OLLAMA_ORIGINS=* ollama serve',
            description: 'Start Ollama with cross-origin access enabled',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
            <div className="bg-gradient-to-br from-amber-950/95 to-red-950/95 border border-amber-500/50 rounded-lg shadow-[0_0_40px_rgba(245,158,11,0.3)] backdrop-blur-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/30 bg-amber-500/10">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                        <span className="font-mono text-sm text-amber-200 tracking-wide">
                            LOCAL OLLAMA NOT DETECTED
                        </span>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="text-amber-400/60 hover:text-amber-200 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <p className="text-amber-100/80 text-sm leading-relaxed">
                        ALKULOUS SYS.AI.01 connects directly to <span className="text-amber-300 font-semibold">Ollama running on your local machine</span>.
                        This ensures your conversations stay private and the AI responds quickly.
                    </p>

                    {error && (
                        <div className="bg-red-950/50 border border-red-500/30 rounded px-3 py-2 text-red-300 text-xs font-mono">
                            Error: {error}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded text-amber-200 text-sm font-mono hover:bg-amber-500/30 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                            {isRetrying ? 'CHECKING...' : 'RETRY CONNECTION'}
                        </button>
                        <button
                            onClick={() => setShowInstructions(!showInstructions)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded text-white text-sm font-mono hover:bg-primary/30 transition-all"
                        >
                            <Terminal className="w-4 h-4" />
                            {showInstructions ? 'HIDE SETUP' : 'SHOW SETUP'}
                        </button>
                    </div>

                    {/* Setup Instructions */}
                    <AnimatePresence>
                        {showInstructions && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3 overflow-hidden"
                            >
                                <div className="border-t border-amber-500/20 pt-4">
                                    <h4 className="text-amber-200 font-semibold text-sm mb-3 flex items-center gap-2">
                                        <Terminal className="w-4 h-4" />
                                        Quick Setup Guide
                                    </h4>

                                    {commands.map((cmd, index) => (
                                        <div
                                            key={cmd.id}
                                            className="mb-3 group"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-5 h-5 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center text-xs text-primary font-bold">
                                                    {index + 1}
                                                </span>
                                                <span className="text-amber-100 text-sm font-medium">{cmd.label}</span>
                                                <span className="text-amber-100/50 text-xs">— {cmd.description}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded px-3 py-2 font-mono text-xs">
                                                <code className="flex-1 text-green-400 overflow-x-auto">
                                                    {cmd.command}
                                                </code>
                                                <button
                                                    onClick={() => copyCommand(cmd.command, cmd.id)}
                                                    className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
                                                    title="Copy command"
                                                >
                                                    {copied === cmd.id ? (
                                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="mt-4 p-3 bg-blue-950/50 border border-blue-500/30 rounded">
                                        <p className="text-blue-200 text-xs leading-relaxed">
                                            <strong>Note for macOS/Windows:</strong> Visit{' '}
                                            <a
                                                href="https://ollama.com/download"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:underline inline-flex items-center gap-1"
                                            >
                                                ollama.com/download
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                            {' '}to download the desktop app. After installation, run the CORS command in your terminal.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
