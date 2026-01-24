import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Shield, Cpu, Activity, Database, Layout, Mic, Send, Trash2, Volume2, VolumeX, Key, Plus, X, Menu, Home as HomeIcon, Terminal, Wifi, WifiOff, Lock } from "lucide-react";
import serverRoomBg from "@assets/generated_images/cyberpunk_server_room_background..png";
import { Link, useLocation } from "wouter";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { useLocalOllamaChat } from "@/hooks/use-local-ollama";
import { OllamaSetupBanner } from "@/components/OllamaSetupBanner";
import { CyberButton } from "@/components/CyberButton";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Helper to clean text for TTS
const cleanTextForSpeech = (text: string) => {
  return text.replace(/[*_#`]/g, ''); // Remove markdown characters
};

// Utility for class merging
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [inputValue, setInputValue] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [useLocalBrain, setUseLocalBrain] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Access denied page for non-admin users
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-primary/60 font-mono text-sm tracking-widest">VERIFYING ACCESS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative">
        <div
          className="fixed inset-0 bg-cover bg-center z-0 opacity-30"
          style={{ backgroundImage: `url(${serverRoomBg})` }}
        />
        <div className="fixed inset-0 bg-black/60" />
        <div className="relative z-10 text-center p-8 border border-primary/30 bg-black/80 backdrop-blur-md max-w-md">
          <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-display mb-4 tracking-widest">ACCESS DENIED</h1>
          <p className="text-white/60 font-mono text-sm mb-6">
            AUTHENTICATION REQUIRED TO ACCESS ADMIN INTERFACE
          </p>
          <CyberButton
            variant="primary"
            onClick={() => window.location.href = '/api/login'}
            className="w-full"
          >
            LOGIN TO CONTINUE
          </CyberButton>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative">
        <div
          className="fixed inset-0 bg-cover bg-center z-0 opacity-30"
          style={{ backgroundImage: `url(${serverRoomBg})` }}
        />
        <div className="fixed inset-0 bg-black/60" />
        <div className="relative z-10 text-center p-8 border border-red-500/30 bg-black/80 backdrop-blur-md max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-display mb-4 tracking-widest text-red-400">ACCESS DENIED</h1>
          <p className="text-white/60 font-mono text-sm mb-4">
            INSUFFICIENT PRIVILEGES
          </p>
          <p className="text-white/40 font-mono text-xs mb-6">
            User: <span className="text-primary">{user?.email}</span><br />
            does not have admin access.
          </p>
          <div className="flex gap-3">
            <CyberButton
              variant="outline"
              onClick={() => setLocation('/console')}
              className="flex-1"
            >
              GO TO CONSOLE
            </CyberButton>
            <CyberButton
              variant="outline"
              onClick={() => setLocation('/')}
              className="flex-1"
            >
              GO HOME
            </CyberButton>
          </div>
        </div>
      </div>
    );
  }

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

  const { data: apiKeys, isLoading: keysLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/keys"],
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/admin/keys", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys"] });
      setNewKeyName("");
      toast({ title: "API Key Created", description: "External access granted." });
    }
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys"] });
    }
  });

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const stats = [
    { label: "CORE STATUS", value: "STABLE", icon: Activity, color: "text-emerald-400" },
    { label: "MEMORY LOAD", value: "42.1%", icon: Database, color: "text-blue-400" },
    { label: "AI SYNC", value: "ONLINE", icon: Cpu, color: "text-primary" },
    { label: "SECURITY", value: "LVL 5", icon: Shield, color: "text-orange-400" },
  ];

  const getAvatarState = () => {
    if (historyLoading) return "thinking";
    if (listening) return "listening";
    if (isSpeaking) return "speaking";
    return "idle";
  };

  useEffect(() => {
    if (transcript) setInputValue(transcript);
  }, [transcript]);

  useEffect(() => {
    if (!listening && transcript.length > 0) {
      handleSend(transcript);
      resetTranscript();
    }
  }, [listening]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const speak = (text: string) => {
    if (!ttsEnabled) return;
    const visibleText = text.replace(/\[ANIMATION_START\]|\[ANIMATION_STOP\]/g, '');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(visibleText));
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha")) || voices[0];
    utterance.voice = preferredVoice;
    utterance.pitch = 0.8;
    utterance.rate = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
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
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${serverRoomBg})` }}
      />
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1" />
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 scanline" />

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

      {/* Header */}
      <header className="fixed top-0 w-full px-3 py-3 md:px-6 md:py-4 flex justify-between items-center z-40 border-b border-primary/50 bg-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2 md:gap-3">
          <Settings className="text-primary animate-spin-slow w-4 h-4 md:w-5 md:h-5" />
          <h1 className="text-sm md:text-2xl tracking-wide md:tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]">
            ALKULOUS <span className="text-primary text-[8px] md:text-xs align-top hidden sm:inline">ADMIN.IF.01</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4">
          {/* Ollama Status */}
          <div
            className={cn(
              "px-2 py-1 border text-[10px] font-mono transition-all flex items-center gap-2",
              ollamaStatus.connected ? "border-green-500 bg-green-500/20 text-green-300" : "border-amber-500 bg-amber-500/20 text-amber-300"
            )}
            title={ollamaStatus.connected ? "Connected to local Ollama" : "Not connected to Ollama"}
          >
            {ollamaStatus.connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            OLLAMA: {ollamaStatus.connected ? 'ON' : 'OFF'}
          </div>
          <Link href="/" asChild>
            <a className="text-xs font-mono text-white/80 hover:text-primary transition-colors flex items-center gap-1">
              HOME
            </a>
          </Link>
          <Link href="/console" asChild>
            <a className="text-xs font-mono text-white/80 hover:text-primary transition-colors flex items-center gap-1">
              <Layout className="w-3 h-3" />
              CONSOLES
            </a>
          </Link>
          <button onClick={() => setTtsEnabled(!ttsEnabled)} className="text-white hover:text-primary">
            {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <div className="text-xs font-mono text-white/80 border-l border-white/20 pl-4 uppercase">
            ACCESS: <span className="text-primary">REED_GLOBAL_ARCHITECT</span>
          </div>
        </nav>

        {/* Mobile Menu Button */}
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
          <button onClick={() => setTtsEnabled(!ttsEnabled)} className="text-white hover:text-primary p-1">
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
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

                {/* Ollama Status Section */}
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

                {/* Access Info */}
                <div className="mb-4 pb-4 border-b border-primary/20">
                  <span className="text-[10px] text-primary/60 uppercase tracking-widest block mb-2">
                    ACCESS LEVEL
                  </span>
                  <span className="text-xs font-mono text-primary">
                    REED_GLOBAL_ARCHITECT
                  </span>
                </div>

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
                      className="flex items-center gap-3 text-sm font-mono text-white hover:text-primary hover:bg-primary/10 transition-colors py-3 px-2 border-b border-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Terminal className="w-4 h-4" />
                      CONSOLE
                    </a>
                  </Link>
                  <Link href="/admin" asChild>
                    <a
                      className="flex items-center gap-3 text-sm font-mono text-white py-3 px-2 border-b border-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      ADMIN
                    </a>
                  </Link>
                </nav>

                {/* System Info */}
                <div className="py-4 text-center border-t border-primary/20">
                  <span className="text-[8px] text-primary/40 tracking-widest">
                    ADMIN.IF.01 // MOBILE INTERFACE
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="container mx-auto min-h-screen pt-16 md:pt-24 pb-4 md:pb-8 px-3 md:px-4 flex flex-col lg:flex-row gap-4 md:gap-6 relative z-10">
        {/* Left: Avatar & Stats */}
        <section className="flex-1 flex flex-col gap-4 md:gap-6">
          <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-8 relative py-4 md:py-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-auto md:h-auto">
              <AvatarDisplay state={getAvatarState()} />
            </div>
            <div className="w-full max-w-xs sm:max-w-sm">
              <AudioVisualizer isActive={listening || isSpeaking} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-white font-display tracking-tighter">
                ALKULOUS <span className="text-primary">CORE</span>
              </h2>
              <p className="text-primary/40 font-mono text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.5em] mt-1 md:mt-2">SYSTEM_ACTIVE_</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-black/40 border border-primary/20 p-2 md:p-3 rounded-sm">
                <div className="text-[8px] md:text-[9px] text-white/30 font-mono tracking-widest">{stat.label}</div>
                <div className="text-sm md:text-lg text-white font-mono mt-0.5 md:mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Fine-Tuning & Chat */}
        <section className="w-full lg:w-[400px] xl:w-[450px] flex flex-col gap-3 md:gap-6 flex-shrink-0">
          {/* API Keys Panel */}
          <div className="h-[150px] md:h-[200px] bg-black/40 border border-primary/20 backdrop-blur-md flex flex-col relative group">
            <div className="p-2 md:p-3 border-b border-primary/10 flex justify-between items-center bg-primary/5">
              <div className="flex items-center gap-2">
                <Key className="w-3 h-3 text-primary" />
                <span className="font-mono text-[9px] md:text-[10px] text-primary/80 uppercase">Access_Keys</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="App Name..."
                  className="flex-1 bg-black/40 border border-primary/20 p-1 text-[9px] md:text-[10px] text-white/80 font-mono outline-none"
                />
                <button
                  onClick={() => createKeyMutation.mutate(newKeyName)}
                  disabled={!newKeyName.trim() || createKeyMutation.isPending}
                  className="p-1 border border-primary/40 hover:bg-primary/20 text-primary"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                {apiKeys?.map((key) => (
                  <div key={key.id} className="flex items-center justify-between bg-white/5 p-1 md:p-1.5 rounded-sm border border-white/5">
                    <div className="flex flex-col min-w-0 flex-1 mr-2">
                      <span className="text-[8px] md:text-[9px] text-white/60 font-mono truncate">{key.name}</span>
                      <span className="text-[7px] md:text-[8px] text-primary font-mono truncate">{key.key}</span>
                    </div>
                    <button
                      onClick={() => deleteKeyMutation.mutate(key.id)}
                      className="text-white/20 hover:text-primary transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fine-Tuning Panel (Smaller) */}
          <div className="h-[150px] md:h-[200px] bg-black/40 border border-primary/20 backdrop-blur-md flex flex-col relative group">
            <div className="p-2 md:p-3 border-b border-primary/10 flex justify-between items-center bg-primary/5">
              <span className="font-mono text-[9px] md:text-[10px] text-primary/80 uppercase">Neural_Tuning</span>
              <button
                onClick={() => setUseLocalBrain(!useLocalBrain)}
                className={cn(
                  "px-1.5 md:px-2 py-0.5 border text-[7px] md:text-[8px] font-mono transition-all",
                  useLocalBrain ? "border-primary bg-primary/20 text-white" : "border-white/20 text-white/40"
                )}
              >
                BRAIN: {useLocalBrain ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4">
              <div className="bg-white/5 border border-white/10 p-2 md:p-3 rounded-sm space-y-2 md:space-y-3">
                <textarea
                  className="w-full bg-black/40 border border-primary/20 p-1.5 md:p-2 text-[10px] md:text-xs text-white/80 font-mono focus:border-primary outline-none min-h-[40px] md:min-h-[60px]"
                  placeholder="Enter training vector..."
                />
                <div className="flex items-center justify-between">
                  <span className="text-[8px] md:text-[9px] text-white/40 font-mono">WEIGHT: 0.85</span>
                  <button className="text-[8px] md:text-[9px] text-primary/60 hover:text-primary uppercase">Sync_</button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface (Same as Home) */}
          <div className="h-[250px] sm:h-[300px] md:flex-1 md:min-h-[300px] bg-black/40 border border-primary/20 backdrop-blur-md flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 border-t-2 border-l-2 border-primary" />
            <div className="p-2 md:p-3 border-b border-primary/10 flex justify-between items-center bg-primary/5">
              <span className="font-mono text-[9px] md:text-[10px] text-primary/80 uppercase">Admin_Comm_Link</span>
              <button onClick={() => clearHistory()} className="text-primary/50 hover:text-primary">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4">
              {history?.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={cn(
                    "max-w-[90%] sm:max-w-[85%] p-2 md:p-3 rounded-sm border font-mono text-[10px] md:text-xs leading-relaxed",
                    msg.role === 'user'
                      ? "bg-primary/30 border-primary/60 text-white"
                      : "bg-white/20 border-white/40 text-white"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {historyLoading && (
                <div className="flex justify-start">
                  <div className="bg-primary/10 border border-primary/20 p-2 rounded-sm animate-pulse">
                    <div className="flex gap-1">
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-2 md:p-4 border-t border-primary/40 bg-white/5">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }} className="flex gap-1.5 md:gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="OVERRIDE COMMAND..."
                    className="w-full bg-[#333333] border-2 border-primary p-1.5 md:p-2 pr-8 md:pr-16 text-white placeholder:text-white/60 focus:outline-none focus:border-primary font-mono text-[10px] md:text-xs shadow-lg"
                  />
                  <div className="absolute right-8 md:right-10 top-1/2 -translate-y-1/2 hidden sm:block">
                    <label className="cursor-pointer text-white/80 hover:text-primary transition-colors" title="Upload File">
                      <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      <input type="file" className="hidden" onChange={(e) => console.log(e.target.files)} />
                    </label>
                  </div>
                </div>
                {browserSupportsSpeechRecognition && (
                  <CyberButton
                    type="button"
                    variant={listening ? "primary" : "outline"}
                    onClick={toggleListening}
                    className="border-primary/80 bg-primary/20 text-white hover:bg-primary/40 h-7 w-7 md:h-8 md:w-8 p-0"
                  >
                    <Mic className={cn("w-3 h-3 md:w-4 md:h-4", listening && "fill-current")} />
                  </CyberButton>
                )}
                <CyberButton
                  type="submit"
                  variant="primary"
                  disabled={!inputValue.trim() || historyLoading}
                  className="bg-primary text-white hover:bg-primary/80 shadow-[0_0_15px_rgba(255,0,0,0.4)] h-7 md:h-8 px-2 md:px-3"
                >
                  <Send className="w-3 h-3 md:w-4 md:h-4" />
                </CyberButton>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

