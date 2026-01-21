import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import alkulousPilot from "@assets/Alkulous_SYS.AI.01_Pilot-2_(online-video-cutter.com)_1768657807602.mp4";

interface AvatarDisplayProps {
  state: "idle" | "listening" | "thinking" | "speaking";
}

export function AvatarDisplay({ state }: AvatarDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (state === "speaking") {
        videoRef.current.play();
        videoRef.current.playbackRate = 1.2;
      } else if (state === "listening" || state === "thinking") {
        videoRef.current.play();
        videoRef.current.playbackRate = 0.8;
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // Reset to front-facing frame
      }
    }
  }, [state]);

  // Animation variants for the glow/pulse effect
  const glowVariants = {
    idle: { scale: 1, opacity: 0.6, filter: "brightness(1)" },
    listening: { scale: [1, 1.02, 1], opacity: 0.9, filter: "brightness(1.1)", transition: { repeat: Infinity, duration: 2 } },
    thinking: { scale: [1, 1.05, 1], opacity: 1, filter: "hue-rotate(0deg) brightness(1.2)", transition: { repeat: Infinity, duration: 0.8 } },
    speaking: { scale: [1, 1.03, 1], opacity: 1, filter: "brightness(1.2)", transition: { repeat: Infinity, duration: 0.3 } },
  };

  return (
    <div className="relative w-full max-w-lg aspect-square mx-auto flex items-center justify-center">
      {/* Background tech circle rings */}
      <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite] opacity-30" />
      <div className="absolute inset-8 border border-primary/10 rounded-full animate-[spin_15s_linear_infinite_reverse] opacity-20" />
      
      {/* Central Living Avatar (Bubble) */}
      <motion.div
        variants={glowVariants}
        animate={state}
        className="relative z-10 w-4/5 h-4/5 rounded-full overflow-hidden shadow-[0_0_80px_rgba(255,0,0,0.5)] border-4 border-primary/30 bg-black group"
      >
        <video
          ref={videoRef}
          src={alkulousPilot}
          autoPlay={false}
          loop
          muted
          playsInline
          className="w-full h-full object-cover brightness-125 contrast-150 hover:brightness-150 transition-all duration-500 scale-[1.6] translate-y-[5%] mix-blend-screen"
        />
        
        {/* Neon Red Overlay to ensure consistent theme color */}
        <div className="absolute inset-0 bg-primary/20 mix-blend-color pointer-events-none" />
        
        {/* Vignette to hide video edges and focus on face */}
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,1)] pointer-events-none" />
        
        {/* Overlay scanline and technological effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan pointer-events-none" />
      </motion.div>

      {/* State label */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        <motion.span 
            key={state}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-primary font-display tracking-[0.8em] text-xs uppercase drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]"
        >
          {state}
        </motion.span>
      </div>
    </div>
  );
}
