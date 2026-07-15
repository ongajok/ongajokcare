import { useState } from "react";
import { motion } from "motion/react";

interface MascotOniProps {
  text: string;
  pose?: "wave" | "point" | "smile" | "writing" | "think";
  className?: string;
}

export default function MascotOni({ text, pose = "smile", className = "" }: MascotOniProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Playful float/bobbing animation
  const mascotVariants = {
    idle: {
      y: [0, -6, 0],
      rotate: [0, 1.5, -1.5, 0],
      transition: {
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.1,
      y: -10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
      },
    },
  };

  return (
    <div
      className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-3xl bg-white/50 backdrop-blur-md border border-white/40 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.6)] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic 3D/4D Mascot Container */}
      <motion.div
        variants={mascotVariants}
        animate={isHovered ? "hover" : "idle"}
        className="relative w-24 h-24 flex-shrink-0 cursor-pointer select-none flex items-center justify-center"
      >
        {/* Multi-layered 3D/4D Luminous Back Glow (Extremely Bright & Radiant) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300 via-amber-400 to-orange-400 rounded-full filter blur-xl opacity-75 scale-110 animate-pulse" />
        <div className="absolute inset-2 bg-radial from-white via-amber-300 to-transparent rounded-full filter blur-md opacity-90 scale-100 mix-blend-screen animate-pulse" />
        
        {/* Interactive Orbiting 3D/4D Rings */}
        <div className="absolute -inset-1.5 rounded-full border border-amber-300/40 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
        <div className="absolute -inset-3.5 rounded-full border-2 border-dashed border-amber-200/30 scale-110 animate-[spin_30s_linear_infinite]" />
        <div className="absolute -inset-5 rounded-full border border-amber-100/10 scale-115 animate-[spin_15s_reverse_linear_infinite]" />

        {/* Floating 4D Light Particles / Sparkles */}
        <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75" />
        <span className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping opacity-60 delay-300" />
        <span className="absolute top-4 left-0 w-1 h-1 bg-white rounded-full animate-pulse opacity-90" />

        {/* Mascot Image (Using User's Beautiful On-i Mascot Design) */}
        <motion.img
          src="https://i.postimg.cc/s2bzbCyd/on-imaseukoteu.png"
          alt="온가족간병협회 수호천사 온이"
          referrerPolicy="no-referrer"
          className="w-22 h-22 object-contain relative z-10 filter drop-shadow-[0_12px_20px_rgba(217,119,6,0.6)] mix-blend-multiply brightness-105 contrast-105"
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* 3D Conversation Speech Bubble */}
      <div className="relative flex-1">
        {/* Speech Bubble Arrow */}
        <div className="absolute left-1/2 -top-2 md:left-[-10px] md:top-1/2 md:-translate-y-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-amber-100 md:border-t-[10px] md:border-t-transparent md:border-b-[10px] md:border-b-transparent md:border-r-[10px] md:border-r-amber-100" />
        
        {/* Bubble Box */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/60 rounded-2xl p-3.5 shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.9),0_4px_12px_-2px_rgba(217,119,6,0.06)]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold tracking-wider text-amber-700 bg-amber-200/40 px-2 py-0.5 rounded-full shadow-sm">
              MASCOT ON-I
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
          </div>
          <p className="text-xs md:text-[13px] font-medium leading-relaxed text-amber-900 whitespace-pre-wrap">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
