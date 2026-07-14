import { useState } from "react";
import { motion } from "motion/react";

interface MascotOniProps {
  text: string;
  pose?: "wave" | "point" | "smile" | "writing" | "think";
  className?: string;
}

export default function MascotOni({ text, pose = "smile", className = "" }: MascotOniProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Define some playful animations based on pose
  const mascotVariants = {
    idle: {
      y: [0, -6, 0],
      rotate: [0, 1, -1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.1,
      y: -12,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const handVariants = {
    wave: {
      rotate: [0, 20, -10, 20, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    point: {
      x: [0, 4, 0],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    idle: {
      rotate: 0,
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-3xl bg-white/50 backdrop-blur-md border border-white/40 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.6)] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Claymorphic Mascot '온이' */}
      <motion.div
        variants={mascotVariants}
        animate={isHovered ? "hover" : "idle"}
        className="relative w-24 h-24 flex-shrink-0 cursor-pointer select-none"
      >
        {/* Glow behind On-i */}
        <div className="absolute inset-0 bg-yellow-400/30 rounded-full filter blur-xl scale-110" />

        {/* 3D Body */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-[inset_0_4px_8px_rgba(255,255,255,0.8),inset_0_-6px_12px_rgba(0,0,0,0.15),0_10px_20px_rgba(245,158,11,0.3),0_2px_4px_rgba(0,0,0,0.1)] border-b-4 border-amber-600/30 flex items-center justify-center">
          
          {/* Eyes & Mouth Container */}
          <div className="relative w-16 h-12 flex flex-col items-center justify-between mt-1">
            
            {/* Eyes */}
            <div className="flex justify-between w-11 px-1">
              {/* Left Eye */}
              <motion.div 
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="w-3.5 h-3.5 bg-slate-900 rounded-full relative flex items-center justify-center shadow-inner"
              >
                {/* Pupil highlight */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
              </motion.div>

              {/* Right Eye */}
              <motion.div 
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2.1 }}
                className="w-3.5 h-3.5 bg-slate-900 rounded-full relative flex items-center justify-center shadow-inner"
              >
                {/* Pupil highlight */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
              </motion.div>
            </div>

            {/* Cute Rosy Cheeks */}
            <div className="absolute w-14 top-4 flex justify-between">
              <div className="w-3.5 h-2 bg-rose-400/70 rounded-full filter blur-[1px] shadow-sm" />
              <div className="w-3.5 h-2 bg-rose-400/70 rounded-full filter blur-[1px] shadow-sm" />
            </div>

            {/* Mouth */}
            <motion.div 
              animate={pose === "think" ? { scaleY: 0.2, rotate: 10 } : { scaleY: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-5 h-3.5 bg-slate-900 rounded-b-full shadow-inner border-t-2 border-amber-500/20"
            />
          </div>

          {/* Angel Halo (3D Ring) above On-i */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full border-4 border-yellow-300 bg-yellow-100/40 opacity-90 shadow-[0_4px_10px_rgba(253,224,71,0.5),inset_0_1px_2px_rgba(255,255,255,0.8)] rotate-[6deg] animate-pulse" />
        </div>

        {/* Floating Waving Hand (Left) */}
        <motion.div
          variants={handVariants}
          animate={pose === "wave" ? "wave" : "idle"}
          className="absolute -left-2.5 top-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_3px_6px_rgba(0,0,0,0.1)] border-b border-amber-600/30 origin-right"
        />

        {/* Floating Pointing Hand (Right) */}
        <motion.div
          variants={handVariants}
          animate={pose === "point" ? "point" : "idle"}
          className="absolute -right-2.5 top-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_3px_6px_rgba(0,0,0,0.1)] border-b border-amber-600/30 origin-left"
        />
        
        {/* Cute Mascot Feet */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-4 w-12 justify-center">
          <div className="w-4 h-2.5 bg-amber-500 rounded-full shadow-md border-b-2 border-amber-700/30" />
          <div className="w-4 h-2.5 bg-amber-500 rounded-full shadow-md border-b-2 border-amber-700/30" />
        </div>
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
