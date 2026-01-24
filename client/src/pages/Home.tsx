import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useLocalOllamaChat } from "@/hooks/use-local-ollama";
import { OllamaSetupBanner } from "@/components/OllamaSetupBanner";
import { CyberButton } from "@/components/CyberButton";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Trash2, Volume2, VolumeX, Radio, LogOut, User as UserIcon, Layout, Plus, Wifi, WifiOff, Menu, X, Home as HomeIcon, Terminal, Settings } from "lucide-react";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useAuth } from "@/hooks/use-auth";

// Helper to clean text for TTS
const cleanTextForSpeech = (text: string) => {
  return text.replace(/[*_#`]/g, ''); // Remove markdown characters
};

import alkulousPilot from "@assets/Alkulous_SYS.AI.01_Pilot-2_(online-video-cutter.com)_1768657807602.mp4";
import cyberpunkBg from "@assets/generated_images/cyberpunk_lab_background_without_people.png";

import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  // ... rest of state
  const [inputValue, setInputValue] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use local Ollama hook instead of server-based chat
  const {
    messages: history,
    isLoading: historyLoading,
    ollamaStatus,
    showSetupBanner,
    sendMessage,
    clearHistory,
    retryConnection,
    dismissSetupBanner
  } = useLocalOllamaChat();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Avatar state logic
  const getAvatarState = () => {
    if (historyLoading) return "thinking";
    if (listening) return "listening";
    if (isSpeaking) return "speaking";
    return "idle";
  };

  // Sync speech recognition input
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Handle voice input stop
  useEffect(() => {
    if (!listening && transcript.length > 0) {
      handleSend(transcript);
      resetTranscript();
    }
  }, [listening]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Pause video if not speaking
  const videoRef = useRef<HTMLVideoElement>(null);

  // Voice Output (TTS)
  const speak = (text: string) => {
    if (!ttsEnabled) return;

    // Extract visible text (remove tags)
    const visibleText = text.replace(/\[ANIMATION_START\]|\[ANIMATION_STOP\]/g, '');

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(visibleText));

    // Attempt to find a "technological" or "deep" voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) || voices[0];

    utterance.voice = preferredVoice;
    utterance.pitch = 0.8; // Slightly deeper
    utterance.rate = 1.1;  // Slightly faster

    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setSendError(null);
    setInputValue("");

    try {
      const response = await sendMessage(text);
      speak(response);
    } catch (error: any) {
      setSendError(error.message || "Failed to send message");
      console.error("Send error:", error);
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <div className="min-h-screen text-foreground overflow-hidden font-body relative">
      <div className="static-background" />
      <div className="video-overlay" />

      {/* CRT Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 scanline" />

      {/* Background ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] md:w-[800px] h-[300px] md:h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Ollama Setup Banner */}
      <AnimatePresence>
        {showSetupBanner && (
          <OllamaSetupBanner
            onRetry={retryConnection}
            onDismiss={dismissSetupBanner}
            error={ollamaStatus.error}
          />
        )}
      </AnimatePresence>

      {/* HUD Header */}
      <header className="fixed top-0 w-full px-3 py-3 md:px-6 md:py-4 flex justify-between items-center z-40 border-b border-primary/50 bg-white/10 backdrop-blur-xl shadow-[0_4px_30px_rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-2 md:gap-3">
            <Radio className="text-primary animate-pulse w-4 h-4 md:w-5 md:h-5" />
            <h1 className="text-sm md:text-2xl tracking-wide md:tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]">
              ALKULOUS <span className="text-primary text-[8px] md:text-xs align-top hidden sm:inline">SYS.AI.01</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 ml-8">
            <Link href="/" asChild>
              <a className="text-xs font-mono text-white/80 hover:text-primary transition-colors">HOME</a>
            </Link>
            <Link href="/console" asChild>
              <button className="text-xs font-mono text-white hover:text-primary transition-colors border-b-2 border-primary pb-1">CONSOLE</button>
            </Link>
            {isAdmin && (
              <Link href="/admin" asChild>
                <a className="text-xs font-mono text-white/80 hover:text-primary transition-colors">ADMIN</a>
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-2 text-white">
                  <UserIcon className="w-3 h-3" />
                  <span className="text-[10px] font-mono uppercase tracking-tighter">{user?.email?.split('@')[0] || 'USER'}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="text-xs font-mono text-white/80 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                className="text-xs font-mono text-white/80 hover:text-primary transition-colors pb-1"
                onClick={() => window.location.href = '/auth'}
              >
                LOGIN / REGISTER
              </button>
            )}
          </nav>
        </div>

        {/* Desktop Status Indicators */}
        <div className="hidden md:flex gap-2 lg:gap-4 items-center">
          <div
            className={cn(
              "px-2 py-1 border text-[8px] md:text-[10px] font-mono transition-all flex items-center gap-1 md:gap-2",
              ollamaStatus.connected ? "border-green-500 bg-green-500/20 text-green-300" : "border-amber-500 bg-amber-500/20 text-amber-300"
            )}
            title={ollamaStatus.connected ? "Connected to local Ollama" : "Not connected to Ollama"}
          >
            {ollamaStatus.connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden sm:inline">OLLAMA:</span> {ollamaStatus.connected ? 'ON' : 'OFF'}
          </div>
          <div className="text-[10px] md:text-xs font-mono text-white/80 hidden lg:block">
            ALKULOUS: <span className="text-primary">ACTIVE</span>
          </div>
        </div>

        {/* Mobile Menu Button & Status */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Compact Mobile Status */}
          <div
            className={cn(
              "px-1.5 py-0.5 border text-[8px] font-mono flex items-center gap-1",
              ollamaStatus.connected ? "border-green-500 bg-green-500/20 text-green-300" : "border-amber-500 bg-amber-500/20 text-amber-300"
            )}
          >
            {ollamaStatus.connected ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-primary transition-colors p-1"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-64 sm:w-72 bg-black/95 border-l border-primary/30 z-50 lg:hidden backdrop-blur-md"
            >
              <div className="flex flex-col h-full pt-16 px-4 sm:px-6">
                {/* Close Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-3 right-3 text-white hover:text-primary transition-colors p-2"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Status Section */}
                <div className="mb-4 pb-4 border-b border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-white/60 uppercase tracking-widest">SYSTEM STATUS</span>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className={cn(
                        "flex-1 px-2 py-2 border text-[10px] font-mono flex items-center justify-center gap-2",
                        ollamaStatus.connected ? "border-green-500 bg-green-500/20 text-green-300" : "border-amber-500 bg-amber-500/20 text-amber-300"
                      )}
                    >
                      {ollamaStatus.connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      OLLAMA: {ollamaStatus.connected ? 'CONNECTED' : 'OFFLINE'}
                    </div>
                  </div>
                </div>

                {/* User Info */}
                {isAuthenticated && (
                  <div className="mb-4 pb-4 border-b border-primary/20">
                    <span className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">
                      OPERATOR
                    </span>
                    <div className="flex items-center gap-2 text-white">
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm font-mono">
                        {user?.email?.split('@')[0] || 'USER'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex flex-col gap-1 flex-1">
                  <Link href="/" asChild>
                    <a
                      className="flex items-center gap-3 text-sm font-mono text-white hover:text-primary hover:bg-primary/10 transition-colors py-3 px-2 border-b border-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <HomeIcon className="w-4 h-4" />
                      HOME
                    </a>
                  </Link>
                  <Link href="/console" asChild>
                    <a
                      className="flex items-center gap-3 text-sm font-mono text-white py-3 px-2 border-b border-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Terminal className="w-4 h-4" />
                      CONSOLE
                    </a>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" asChild>
                      <a
                        className="flex items-center gap-3 text-sm font-mono text-white hover:text-primary hover:bg-primary/10 transition-colors py-3 px-2 border-b border-white/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        ADMIN
                      </a>
                    </Link>
                  )}
                </nav>

                {/* Auth Button */}
                <div className="py-4 border-t border-primary/20">
                  {isAuthenticated ? (
                    <CyberButton
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      LOGOUT
                    </CyberButton>
                  ) : (
                    <CyberButton
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = '/auth';
                      }}
                    >
                      LOGIN / REGISTER
                    </CyberButton>
                  )}
                </div>

                {/* System Info */}
                <div className="py-3 text-center">
                  <span className="text-[8px] text-primary/40 tracking-widest">
                    SYS.AI.01 // MOBILE INTERFACE
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="container mx-auto min-h-screen pt-16 md:pt-20 pb-4 md:pb-8 px-3 md:px-4 flex flex-col lg:flex-row gap-4 md:gap-8 items-center justify-center relative z-10">

        {/* Left/Top: Avatar & Visualization */}
        <section className="flex-1 w-full flex flex-col items-center justify-center gap-4 md:gap-8 py-4 md:py-0">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-auto md:h-auto">
            <AvatarDisplay state={getAvatarState()} />
          </div>

          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md px-2 md:px-4">
            <AudioVisualizer isActive={listening || isSpeaking} />
          </div>

          <div className="text-center space-y-1 md:space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-display">
              <span className="text-primary">ALKULOUS</span> <span className="hidden sm:inline">SYS.AI.01</span>
            </h2>
            <p className="text-primary/60 font-mono text-xs md:text-sm tracking-widest">
              AWAITING INPUT_
            </p>
          </div>
        </section>

        {/* Right/Bottom: Chat Interface */}
        <section className="w-full lg:w-[450px] h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex flex-col bg-black/40 border border-white backdrop-blur-md relative overflow-hidden group flex-shrink-0">
          {/* Tech Corners */}
          <div className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-3 h-3 md:w-4 md:h-4 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 border-b-2 border-r-2 border-primary" />

          {/* Header */}
          <div className="border-b border-primary/10 flex justify-between items-center bg-primary/5">
            <span className="font-mono text-[10px] md:text-xs text-primary/80">COMMUNICATION_LOG</span>
            <button
              onClick={() => clearHistory()}
              className="text-primary/50 hover:text-primary transition-colors"
              title="Clear Memory"
            >
              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 scroll-smooth"
          >
            {historyLoading ? (
              <div className="flex items-center justify-center h-full text-primary/30 animate-pulse font-mono text-xs md:text-sm">
                LOADING_MEMORY_BANKS...
              </div>
            ) : history && history.length > 0 ? (
              history.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={cn(
                    "max-w-[90%] sm:max-w-[85%] p-2.5 md:p-3 rounded-sm border font-mono text-xs md:text-sm leading-relaxed",
                    msg.role === 'user'
                      ? "bg-primary/30 border-primary/60 text-white shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                      : "bg-white/20 border-white/40 text-white backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  )}>
                    <div className="text-[8px] md:text-[10px] opacity-50 mb-1 uppercase tracking-wider">
                      {msg.role === 'user' ? 'OPERATOR' : 'ALKULOUS'}
                    </div>
                    {msg.content}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-primary/30 font-mono text-[10px] md:text-xs text-center p-4 md:p-8">
                <div className="w-10 h-10 md:w-12 md:h-12 border border-primary/20 rounded-full flex items-center justify-center mb-3 md:mb-4">
                  <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                </div>
                NO_DATA_LOGGED
                <br />
                INITIATE_PROTOCOL_
              </div>
            )}

            {historyLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-secondary/50 border border-primary/20 p-2.5 md:p-3 rounded-sm">
                  <div className="flex gap-1">
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-2.5 md:p-4 border-t border-primary/40 bg-white/5 relative shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
            {sendError && (
              <div className="mb-2 text-[10px] md:text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/30 px-2 md:px-3 py-1.5 md:py-2 rounded">
                ERROR: {sendError}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="flex gap-1.5 md:gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="ENTER COMMAND..."
                  className="w-full bg-[#333333] border-2 border-primary p-2 md:p-3 pr-10 md:pr-20 text-white placeholder:text-white/60 focus:outline-none focus:border-primary focus:bg-black focus:shadow-[0_0_20px_rgba(255,0,0,0.5)] font-mono text-xs md:text-sm transition-all shadow-lg"
                  disabled={historyLoading}
                />
                <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2">
                  <label className="cursor-pointer text-white/80 hover:text-primary transition-colors" title="Upload File">
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <input type="file" className="hidden" onChange={(e) => console.log(e.target.files)} />
                  </label>
                </div>
                <div className="absolute right-0 bottom-0 w-2 h-2 md:w-3 md:h-3 bg-primary clip-path-polygon-[100%_100%,0_100%,100%_0]" />
              </div>

              {browserSupportsSpeechRecognition && (
                <CyberButton
                  type="button"
                  variant={listening ? "primary" : "outline"}
                  onClick={toggleListening}
                  className={cn(
                    "border-primary/80 bg-primary/20 text-white hover:bg-primary/40 p-2 md:p-3",
                    listening ? "animate-pulse" : ""
                  )}
                  title="Voice Input"
                >
                  <Mic className={cn("w-4 h-4 md:w-5 md:h-5", listening && "fill-current")} />
                </CyberButton>
              )}

              <CyberButton
                type="submit"
                variant="primary"
                disabled={!inputValue.trim() || historyLoading}
                className="bg-primary text-white hover:bg-primary/80 shadow-[0_0_15px_rgba(255,0,0,0.4)] p-2 md:p-3"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </CyberButton>
            </form>
          </div>
        </section>

      </main>

      {/* Decorative footer elements - hidden on mobile */}
      <div className="fixed bottom-4 left-4 text-[10px] text-primary/30 font-mono hidden md:block">
        SYSTEM_ID: ALK_9000<br />
        LATENCY: 12ms
      </div>
    </div>
  );
}

// Utility for class merging
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
