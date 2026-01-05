"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const ImmersiveLoader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      time += 0.01; // Slow, deliberate speed

      // Clean white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const spacing = 18; // Denser grid for "tech" feel
      const rows = Math.ceil(canvas.height / spacing);
      const cols = Math.ceil(canvas.width / spacing);

      const offsetX = (canvas.width - cols * spacing) / 2;
      const offsetY = (canvas.height - rows * spacing) / 2;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const posX = offsetX + x * spacing;
          const posY = offsetY + y * spacing;

          // Sophisticated Interference Pattern
          // Creates a "breathing" topological map effect
          const wave1 = Math.sin(x * 0.05 + time);
          const wave2 = Math.cos(y * 0.05 + time);
          const wave3 = Math.sin((x + y) * 0.02 + time * 0.5);

          const value = wave1 + wave2 + wave3;

          // Map to opacity and size
          const alpha = (Math.sin(value) + 1) / 2; // 0 to 1

          // Threshold for "digital" look - only show dots at peaks
          // making it look like data moving through the grid
          const opacity = Math.pow(alpha, 3) * 0.5;
          const size = Math.max(0.5, alpha * 2);

          // Black/Grey dots
          ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;

          ctx.beginPath();
          ctx.arc(posX, posY, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white text-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-xs font-light tracking-[0.5em] uppercase text-black/80"
        >
          Analyzing Repository
        </motion.div>

        {/* Minimal thin loading line */}
        <motion.div
          className="h-[1px] bg-black/10 w-32 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-black w-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
};
