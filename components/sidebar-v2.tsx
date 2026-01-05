/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  Maximize2,
  Settings,
  Sparkles,
  Layers,
  Info,
  Menu,
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  defaultOpen?: boolean;
  position?: "left" | "right";
}

export function GeminiSidebar({
  defaultOpen = false,
  position = "right",
}: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState("apis");
  const [showTooltip, setShowTooltip] = React.useState(false);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovering(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setIsOpen(false);
    }, 300); // Delay before closing
  };

  // Close tooltip when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const stopScrollPropagation = (event: React.WheelEvent) => {
    event.stopPropagation();
  };

  return (
    <>
      {/* Hover trigger area */}
      <motion.div
        ref={sidebarRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ width: "60px" }}
        animate={{ width: isHovered ? "380px" : "60px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed ${
          position === "right" ? "right-1" : "left-1"
        } top-2 h-[calc(100vh-1rem)] z-40 flex 
        bg-slate-600/40 rounded-2xl backdrop-blur-lg shadow-lg border border-slate-500/20
        hover:shadow-xl transition-shadow duration-300`}
      >
        <div className="flex flex-col items-center gap-2 p-2 w-[60px] ">
          <button className="p-2 hover:bg-gray-700/40 rounded-md transition">
            <Menu className="h-5 w-5 text-white" />
          </button>
          <button className="p-2 hover:bg-gray-700/40 rounded-md transition">
            <Sparkles className="h-5 w-5 text-purple-300" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 h-full overflow-hidden"
          onWheel={stopScrollPropagation}
        >
          <div className="w-[320px] flex flex-col h-full">
            <div className="flex">
              <button
                onClick={() => setActiveTab("apis")}
                className={`flex flex-1 items-center justify-center gap-2 py-3 transition-all ${
                  activeTab === "apis"
                    ? "border-b-2 border-b-gray-500 font-medium"
                    : "border-b-2 border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>APIs</span>
              </button>
              <button
                onClick={() => setActiveTab("tools")}
                className={`flex flex-1 items-center justify-center gap-2 py-3 transition-all ${
                  activeTab === "tools"
                    ? "border-b-2 border-gray-500 font-medium"
                    : "border-b-2 border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Tools</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between items-center py-6 overflow-auto">
              <div className="flex flex-col items-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-700/70 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                  <Sparkles className="h-10 w-10 text-purple-300" />
                </div>
                <h2 className="mb-1 text-2xl font-medium">Assistant</h2>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <div className="relative">
                    <button
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="inline-flex items-center justify-center"
                    >
                      <Info className="h-4 w-4 cursor-pointer" />
                    </button>

                    {showTooltip && (
                      <div
                        ref={tooltipRef}
                        className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-gray-800 px-3 py-1.5 text-xs shadow-lg"
                      >
                        <p>Gemini AI Assistant</p>
                        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-800"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full px-8">
                <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 backdrop-blur-sm">
                  <p className="text-center text-sm text-gray-400">
                    Ask me anything or use the tools above to explore different
                    capabilities.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 p-4">
              <div className="flex justify-between text-gray-400">
                <div className="flex gap-2 text-sm opacity-70">
                  <span>/key</span>
                  <span>/model</span>
                  <span>/clear</span>
                </div>
                <Maximize2 className="h-5 w-5 opacity-70" />
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Message Gemini..."
                  className="w-full rounded-full bg-gray-800/50 px-4 py-2 text-sm outline-none ring-1 ring-gray-700/50 transition-all focus:ring-purple-500/50"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
