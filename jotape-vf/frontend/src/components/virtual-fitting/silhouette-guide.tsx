"use client";

import { motion } from "framer-motion";

export function SilhouetteGuide() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.svg
        viewBox="0 0 120 280"
        className="h-[82%] w-auto text-violet-300/50"
        aria-hidden
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse
          cx="60"
          cy="28"
          rx="18"
          ry="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d="M60 50 L60 130 M35 70 L85 70 M42 130 L42 200 M78 130 L78 200 M42 200 L50 260 M78 200 L70 260"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 5"
        />
      </motion.svg>
      <p className="absolute bottom-24 left-0 right-0 text-center text-xs font-medium tracking-wide text-white/70">
        Posiciónate al centro
      </p>
    </div>
  );
}
