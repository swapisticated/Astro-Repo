"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Github,
  Sparkles,
  Code2,
  FolderTree,
  Zap,
  ArrowRight,
  GitBranch,
  Star,
  Eye,
} from "lucide-react";

type ThemeType = "modern" | "pencil" | "comic";

// Theme configuration
const themeConfig = {
  modern: {
    bg: "bg-[#0a0a1f]",
    bgGradient: "from-[#0a0a1f] via-[#0f0f3a] to-[#1a1a4a]",
    cardBg: "bg-slate-900/80",
    cardBorder: "border-slate-700/50",
    text: "text-slate-100",
    textMuted: "text-slate-400",
    accent: "from-purple-500 via-pink-500 to-rose-500",
    accentSolid: "bg-purple-600",
    buttonBg:
      "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    inputBg: "bg-slate-800/70",
    inputBorder: "border-slate-600/50 focus:border-purple-500",
    font: "",
    featureCardBg: "bg-slate-800/40 backdrop-blur-xl",
    glow: true,
    stars: true,
  },
  pencil: {
    bg: "bg-[#f8f6f0]",
    bgGradient: "from-[#f8f6f0] via-[#f5f3ed] to-[#ebe8e0]",
    cardBg: "bg-white",
    cardBorder: "border-gray-900 border-2",
    text: "text-gray-900",
    textMuted: "text-gray-600",
    accent: "from-gray-800 via-gray-700 to-gray-600",
    accentSolid: "bg-gray-900",
    buttonBg: "bg-gray-900 hover:bg-gray-800",
    inputBg: "bg-white",
    inputBorder: "border-gray-900 border-2 focus:border-gray-700",
    font: "font-[var(--font-patrick-hand)]",
    featureCardBg: "bg-white",
    glow: false,
    stars: false,
  },
  comic: {
    bg: "bg-[#fef9ed]",
    bgGradient: "from-[#fef9ed] via-[#fff5e0] to-[#ffefd5]",
    cardBg: "bg-[#fff8e7]",
    cardBorder: "border-gray-900 border-2",
    text: "text-gray-900",
    textMuted: "text-gray-700",
    accent: "from-orange-400 via-rose-400 to-purple-400",
    accentSolid: "bg-orange-500",
    buttonBg:
      "bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 hover:from-orange-500 hover:via-rose-500 hover:to-purple-500",
    inputBg: "bg-white",
    inputBorder: "border-gray-900 border-2 focus:border-orange-500",
    font: "font-[var(--font-patrick-hand)]",
    featureCardBg: "bg-[#fff8e7]",
    glow: false,
    stars: false,
  },
};

// Features data
const features = [
  {
    icon: FolderTree,
    title: "Repository Structure",
    description:
      "Visualize your entire codebase as an interactive force-directed graph",
    modern: { color: "text-purple-400", bg: "bg-purple-500/10" },
    pencil: { color: "text-gray-900", bg: "bg-gray-100" },
    comic: { color: "text-rose-500", bg: "bg-rose-100" },
  },
  {
    icon: Code2,
    title: "AI Code Analysis",
    description:
      "Get intelligent summaries and explanations for any file or folder",
    modern: { color: "text-pink-400", bg: "bg-pink-500/10" },
    pencil: { color: "text-gray-900", bg: "bg-gray-100" },
    comic: { color: "text-orange-500", bg: "bg-orange-100" },
  },
  {
    icon: Zap,
    title: "Interactive Exploration",
    description:
      "Click to expand, drag to explore, and dive deep into your code",
    modern: { color: "text-blue-400", bg: "bg-blue-500/10" },
    pencil: { color: "text-gray-900", bg: "bg-gray-100" },
    comic: { color: "text-purple-500", bg: "bg-purple-100" },
  },
];

// Star component for modern theme
const Star3D = ({ style }: { style: React.CSSProperties }) => (
  <motion.div
    className="absolute rounded-full bg-white"
    style={style}
    animate={{
      opacity: [0.3, 1, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: Math.random() * 3 + 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Sketchy border SVG pattern for pencil/comic themes
const SketchyBorder = ({ theme }: { theme: ThemeType }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    style={{ zIndex: 0 }}
  >
    <defs>
      <filter id="sketchy-filter" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence
          baseFrequency="0.05"
          numOctaves="2"
          result="noise"
          type="fractalNoise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={theme === "comic" ? 2 : 3}
        />
      </filter>
    </defs>
  </svg>
);

// Paper texture overlay for pencil theme
const PaperTexture = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-30"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

// Halftone pattern for comic theme
const HalftonePattern = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-5"
    style={{
      backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
      backgroundSize: "8px 8px",
    }}
  />
);

const Home = () => {
  const [url, setUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [theme] = useState<ThemeType>("pencil");
  const [stars, setStars] = useState<
    { top: number; left: number; size: number; delay: number }[]
  >([]);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const config = themeConfig[theme];

  // Generate stars for modern theme
  useEffect(() => {
    if (theme === "modern") {
      const newStars = Array.from({ length: 80 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 5,
      }));
      setStars(newStars);
    }
  }, [theme]);

  const handleSubmit = useCallback(() => {
    if (!url.trim()) return;

    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([\w-]+)\/([\w.-]+)/
    );
    if (!match) {
      return alert("Invalid GitHub URL");
    }

    const [, owner, repo] = match;
    const sanitizedRepo = repo.replace(/\.git$/, "");

    setIsLoading(true);
    const branchParam = branch.trim()
      ? `&branch=${encodeURIComponent(branch.trim())}`
      : "";
    window.location.href = `/visualization?owner=${owner}&repo=${sanitizedRepo}${branchParam}`;
  }, [url, branch]);

  const themeLabels: Record<ThemeType, { name: string; icon: string }> = {
    modern: { name: "Modern", icon: "✨" },
    pencil: { name: "Pencil", icon: "✏️" },
    comic: { name: "Comic", icon: "🎨" },
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${config.bgGradient} ${config.text} relative overflow-hidden transition-all duration-700`}
    >
      {/* Theme-specific background elements */}
      <AnimatePresence mode="wait">
        {theme === "modern" && (
          <motion.div
            key="modern-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Gradient orbs */}
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />

            {/* Stars */}
            {stars.map((star, i) => (
              <Star3D
                key={i}
                style={{
                  top: `${star.top}%`,
                  left: `${star.left}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
              />
            ))}
          </motion.div>
        )}

        {theme === "pencil" && (
          <motion.div
            key="pencil-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <PaperTexture />
            {/* Decorative sketchy elements */}
            <div
              className="absolute top-20 left-20 w-32 h-32 border-2 border-gray-300 rounded-full opacity-20"
              style={{ filter: "url(#sketchy-filter)" }}
            />
            <div
              className="absolute bottom-40 right-32 w-24 h-24 border-2 border-gray-300 rotate-45 opacity-20"
              style={{ filter: "url(#sketchy-filter)" }}
            />
            <div
              className="absolute top-1/3 right-20 w-16 h-16 border-2 border-gray-400 rounded-lg opacity-15"
              style={{ filter: "url(#sketchy-filter)" }}
            />
            <SketchyBorder theme={theme} />
          </motion.div>
        )}

        {theme === "comic" && (
          <motion.div
            key="comic-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <HalftonePattern />
            {/* Colorful watercolor blobs */}
            <div className="absolute top-20 -left-20 w-64 h-64 bg-gradient-to-br from-rose-300/40 to-orange-200/30 rounded-full blur-2xl" />
            <div className="absolute bottom-32 -right-20 w-72 h-72 bg-gradient-to-br from-purple-300/40 to-pink-200/30 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-blue-200/30 to-cyan-200/20 rounded-full blur-2xl" />
            <SketchyBorder theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50 flex items-center justify-between px-6 py-4 md:px-12"
      >
        <motion.div
          className={`flex items-center gap-3 ${config.font}`}
          whileHover={{ scale: 1.02 }}
        >
          <div
            className={`p-2 rounded-xl ${
              theme === "modern"
                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                : theme === "pencil"
                ? "border-2 border-gray-900"
                : "bg-gradient-to-br from-orange-400 to-rose-400 border-2 border-gray-900"
            }`}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xl font-bold ${config.text}`}>
            ExplainMyShit
          </span>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.cardBg} ${config.cardBorder} border mb-8 ${config.font}`}
            >
              <Star
                className={`w-4 h-4 ${
                  theme === "modern"
                    ? "text-yellow-400"
                    : theme === "pencil"
                    ? "text-gray-700"
                    : "text-orange-500"
                }`}
              />
            </motion.div>

            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight ${config.font}`}
            >
              <span
                className={`bg-clip-text text-transparent bg-gradient-to-r ${config.accent}`}
              >
                Understand Any
              </span>
              <br />
              <span className={config.text}>Codebase Instantly</span>
            </h1>

            <p
              className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 ${config.textMuted} ${config.font}`}
            >
              Transform GitHub repositories into beautiful, interactive
              visualizations. Explore code structure, get AI-powered insights,
              and navigate projects like never before.
            </p>
          </motion.div>

          {/* Main Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-2xl mx-auto mb-20"
          >
            <div className="relative">
              {/* Glow effect for modern theme */}
              {theme === "modern" && (
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl blur-lg opacity-40 animate-pulse" />
              )}

              {/* Comic/Pencil shadow */}
              {(theme === "pencil" || theme === "comic") && (
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-gray-900 rounded-2xl" />
              )}

              <div
                className={`relative p-6 md:p-8 rounded-2xl ${config.cardBg} ${config.cardBorder} border backdrop-blur-xl ${config.font}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Github
                    className={`w-6 h-6 ${
                      theme === "modern"
                        ? "text-purple-400"
                        : theme === "pencil"
                        ? "text-gray-700"
                        : "text-orange-500"
                    }`}
                  />
                  <h2 className={`text-lg font-semibold ${config.text}`}>
                    Enter Repository URL
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="https://github.com/username/repository"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      className={`w-full px-4 py-4 rounded-xl ${config.inputBg} ${config.inputBorder} border ${config.text} placeholder:${config.textMuted} focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 ${config.font}`}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <GitBranch
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${config.textMuted}`}
                      />
                      <input
                        type="text"
                        placeholder="Branch (optional)"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl ${config.inputBg} ${config.inputBorder} border ${config.text} placeholder:${config.textMuted} focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 text-sm ${config.font}`}
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl ${config.buttonBg} text-white font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg ${config.font}`}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5" />
                          <span>Visualize</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                <p className={`text-xs mt-4 ${config.textMuted}`}>
                  Paste any public GitHub repository URL to start exploring
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features Section */}
          {/* Example Repos Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className={`text-center ${config.font}`}
          >
            <p className={`text-sm ${config.textMuted} mb-4`}>
              Try with popular repositories
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { owner: "facebook", repo: "react" },
                { owner: "vercel", repo: "next.js" },
                { owner: "microsoft", repo: "vscode" },
                { owner: "tailwindlabs", repo: "tailwindcss" },
              ].map(({ owner, repo }) => (
                <motion.button
                  key={`${owner}/${repo}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUrl(`https://github.com/${owner}/${repo}`)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${config.cardBg} ${config.cardBorder} border text-sm transition-all duration-200 hover:opacity-80`}
                >
                  <Github className="w-4 h-4" />
                  <span>
                    {owner}/{repo}
                  </span>
                  <ArrowRight className="w-3 h-3 opacity-50" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`relative z-10 text-center py-8 border-t ${config.cardBorder} ${config.font}`}
      >
        <p className={`text-sm ${config.textMuted}`}>
          © {new Date().getFullYear()} ExplainMyShit • Open Source • Made with
          💜 for developers
        </p>
      </footer>
    </div>
  );
};

export default Home;
