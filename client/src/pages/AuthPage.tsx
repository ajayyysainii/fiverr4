import { useAuth } from "@/hooks/use-auth";
import { CyberButton } from "@/components/CyberButton";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Cpu, Chrome } from "lucide-react";

import stockImage from '@assets/stock_images/futuristic_cyberpunk_9d65bcd1.jpg'

import alkulousPic from "@assets/Gemini_Generated_Image_uxp343uxp343uxp3_1768059918218_1768818523300.png";

export default function AuthPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-mono">
      {/* Background with stock image */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-30 grayscale hover:grayscale-0 transition-all duration-1000" 
        style={{ backgroundImage: `url(${stockImage})` }}
      />
      <div className="fixed inset-0 bg-black/60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.2),transparent_70%)]" />
      
      {/* Animated tech ring background */}
      <div className="fixed inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-[800px] h-[800px] border border-primary/20 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-[600px] h-[600px] border border-primary/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      <div className="fixed inset-0 opacity-10 scanline pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-black/80 border border-primary/40 backdrop-blur-2xl p-10 rounded-sm shadow-[0_0_80px_rgba(255,0,0,0.15)] relative"
        >
          {/* Cyberpunk Corners */}
          <div className="absolute top-0 left-0 w-10 h-1 border-t-2 border-primary" />
          <div className="absolute top-0 left-0 w-1 h-10 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-10 h-1 border-b-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-1 h-10 border-r-2 border-primary" />

          <div className="flex flex-col items-center text-center space-y-10">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border border-primary/40 rounded-full flex items-center justify-center"
              >
                <div className="w-20 h-20 border-2 border-primary rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                  <img src={alkulousPic} alt="Alkulous" className="w-full h-full object-cover scale-110" />
                </div>
              </motion.div>
              <div className="absolute -top-3 -right-3 bg-primary text-black text-[10px] px-2 py-0.5 font-bold tracking-tighter shadow-lg skew-x-[-20deg]">
                AUTHENTICATOR
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-display tracking-tighter text-white">
                ALKULOUS <span className="text-primary text-sm align-top font-mono">SYS_v1</span>
              </h1>
              <div className="h-0.5 w-16 bg-primary mx-auto" />
              <p className="text-[10px] text-primary/80 uppercase tracking-[0.4em] font-bold">
                Identity_Verification_Engaged
              </p>
            </div>

            <div className="w-full space-y-6">
              <div className="space-y-4">
                <CyberButton 
                  onClick={handleLogin}
                  variant="primary"
                  className="w-full h-16 bg-primary text-white hover:bg-primary/90 shadow-[0_0_30px_rgba(255,0,0,0.4)] text-xs tracking-[0.3em] font-black group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  <span className="flex items-center justify-center gap-3">
                    <ShieldCheck className="w-5 h-5" />
                    ENTER_THE_BRAIN
                  </span>
                </CyberButton>

                <button 
                  onClick={handleLogin}
                  className="w-full h-12 border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 uppercase font-mono"
                >
                  <Chrome className="w-4 h-4" />
                  Sign In with Google Link
                </button>
              </div>

              <div className="p-4 border-l-2 border-primary/40 bg-white/5 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3 h-3 text-primary" />
                  <span className="text-[9px] text-white/60 uppercase tracking-widest font-bold">System Security Notice</span>
                </div>
                <p className="text-[8px] text-white/30 leading-relaxed uppercase font-mono">
                  Access is restricted to authorized neural-architects only. All connections are logged via the master backbone.
                </p>
              </div>

              <div className="pt-6 flex justify-between items-center text-[8px] text-white/20 uppercase tracking-[0.3em]">
                <span className="flex items-center gap-1"><div className="w-1 h-1 bg-green-500 rounded-full animate-ping" /> Uplink: Stable</span>
                <span>Node: ALK-99</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
