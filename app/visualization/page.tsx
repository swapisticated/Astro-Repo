"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import CommitHistory from "@/components/CommitHistory";
import TopContributors from "@/components/TopContributors";
import RepoActivity from "@/components/RepoActivity";
import {
  ArrowLeft,
  Palette,
  Info,
  GitCommit,
  Users,
  Activity,
  X,
  FolderTree,
  FileText,
  HardDrive,
  GitBranch,
} from "lucide-react";
import { RepoVisualizer } from "@/components/mapmyrepo/RepoVisualizer";
import { Sidebar } from "@/components/mapmyrepo/Sidebar";
import {
  StatsWidget,
  CommitsWidget,
  ContributorsWidget,
  ActivityWidget,
} from "@/components/CanvasWidgets";
import { ImmersiveLoader } from "@/components/ImmersiveLoader";
import {
  FileSystemNode,
  NodeType,
  VisualizationTheme,
} from "@/types/mapmyrepo";

interface RepoItem {
  type: "dir" | "file";
  path: string;
  name: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  children?: RepoItem[];
}

interface RepoData {
  readme: string;
  files: RepoItem[];
  branch: string;
}

// Convert RepoItem to FileSystemNode for 2D visualization
function convertToFileSystemNode(
  item: RepoItem,
  _parentPath: string = ""
): FileSystemNode {
  const node: FileSystemNode = {
    name: item.name,
    type: item.type === "dir" ? NodeType.FOLDER : NodeType.FILE,
    path: item.path,
    size: item.size,
    children: undefined,
    downloadUrl: item.download_url || undefined,
  };

  if (item.children && item.children.length > 0) {
    node.children = item.children.map((child) =>
      convertToFileSystemNode(child, item.path)
    );
  }

  return node;
}

// Helper to count files and dirs recursively
function countNodes(files: RepoItem[]): {
  files: number;
  dirs: number;
  totalSize: number;
} {
  let fileCount = 0;
  let dirCount = 0;
  let totalSize = 0;

  const traverse = (items: RepoItem[]) => {
    for (const item of items) {
      if (item.type === "dir") {
        dirCount++;
        if (item.children) traverse(item.children);
      } else {
        fileCount++;
        totalSize += item.size || 0;
      }
    }
  };

  traverse(files);
  return { files: fileCount, dirs: dirCount, totalSize };
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Theme-aware styling
function getThemeStyles(theme: VisualizationTheme) {
  switch (theme) {
    case "pencil":
      return {
        bg: "bg-[#f5f5dc]",
        panelBg: "bg-white/95",
        text: "text-gray-900",
        textMuted: "text-gray-600",
        border: "border-gray-900",
        accent: "text-gray-900",
        buttonBg: "bg-gray-900 hover:bg-gray-800",
        buttonText: "text-white",
        font: "font-['Patrick_Hand']",
      };
    case "comic":
      return {
        bg: "bg-[#f0e6d2]",
        panelBg: "bg-[#fff8e7]/95",
        text: "text-gray-900",
        textMuted: "text-gray-700",
        border: "border-orange-400",
        accent: "text-orange-600",
        buttonBg: "bg-orange-500 hover:bg-orange-600",
        buttonText: "text-white",
        font: "font-['Patrick_Hand']",
      };
    default: // modern
      return {
        bg: "bg-zinc-50",
        panelBg:
          "bg-white/80 backdrop-blur-md shadow-sm border border-gray-200",
        text: "text-gray-900",
        textMuted: "text-gray-500",
        border: "border-gray-200",
        accent: "text-indigo-600",
        buttonBg: "bg-gray-900 hover:bg-black text-white",
        buttonText: "text-white",
        font: "",
      };
  }
}

const VisualizationContent = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme State
  const [theme, setTheme] = useState<VisualizationTheme>("modern");
  const [selectedNode, setSelectedNode] = useState<FileSystemNode | null>(null);

  // Panel visibility states
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<
    "overview" | "commits" | "contributors" | "activity"
  >("overview");

  // Get parameters from URL
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const branch = searchParams.get("branch");
  const depth = searchParams.get("depth") || "2"; // Shallow load, lazy fetch on expand

  const styles = getThemeStyles(theme);

  // Memoize the 2D visualization data
  const memoized2DData = useMemo(() => {
    if (!data) return null;
    const rootItem: RepoItem = {
      type: "dir" as const,
      path: repo || "root",
      name: repo || "root",
      sha: "",
      size: 0,
      url: "",
      html_url: "",
      git_url: "",
      download_url: null,
      children: data.files,
    };
    return convertToFileSystemNode(rootItem);
  }, [data, repo]);

  // Compute stats
  const stats = useMemo(() => {
    if (!data) return null;
    return countNodes(data.files);
  }, [data]);

  // Fetch repository data
  useEffect(() => {
    const fetchData = async () => {
      if (!owner || !repo) {
        setError("Missing repository information");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const branchParam = branch
          ? `&branch=${encodeURIComponent(branch)}`
          : "";
        const depthParam = `&depth=${encodeURIComponent(depth)}`;
        const res = await fetch(
          `/api/fetchRepo?owner=${owner}&repo=${repo}${branchParam}${depthParam}`
        );

        if (!res.ok) {
          throw new Error(
            `Failed to fetch repository: ${res.status} ${res.statusText}`
          );
        }

        const repoData = await res.json();
        setData(repoData);
      } catch (error) {
        console.error("Error fetching repository:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch repository data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [owner, repo, branch, depth]);

  // Info Panel Component
  const InfoPanel = () => (
    <AnimatePresence>
      {showInfoPanel && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`fixed right-0 top-0 h-full w-[420px] ${styles.panelBg} backdrop-blur-xl ${styles.border} border-l shadow-2xl z-50 flex flex-col`}
        >
          {/* Panel Header */}
          <div
            className={`flex items-center justify-between p-4 border-b ${styles.border}`}
          >
            <h2
              className={`text-lg font-semibold ${styles.text} ${styles.font}`}
            >
              Repository Info
            </h2>
            <button
              onClick={() => setShowInfoPanel(false)}
              className={`p-2 rounded-full hover:bg-slate-800/50 transition-colors ${styles.textMuted}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className={`flex border-b ${styles.border} px-2`}>
            {[
              { id: "overview", label: "Overview", icon: Info },
              { id: "commits", label: "Commits", icon: GitCommit },
              { id: "contributors", label: "Contributors", icon: Users },
              { id: "activity", label: "Activity", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveInfoTab(tab.id as typeof activeInfoTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeInfoTab === tab.id
                    ? `${styles.accent} border-current`
                    : `${styles.textMuted} border-transparent hover:${styles.text}`
                } ${styles.font}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeInfoTab === "overview" && stats && (
              <div className="space-y-6">
                {/* Repository Name */}
                <div className={`text-center pb-4 border-b ${styles.border}`}>
                  <h3
                    className={`text-xl font-bold ${styles.text} ${styles.font}`}
                  >
                    {owner}/{repo}
                  </h3>
                  <p
                    className={`text-sm ${styles.textMuted} flex items-center justify-center gap-2 mt-1`}
                  >
                    <GitBranch className="h-4 w-4" />
                    {branch || "main"}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg ${
                      theme === "modern" ? "bg-slate-800/50" : "bg-white/50"
                    } border ${styles.border}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className={`h-5 w-5 ${styles.accent}`} />
                      <span
                        className={`text-sm ${styles.textMuted} ${styles.font}`}
                      >
                        Files
                      </span>
                    </div>
                    <p
                      className={`text-2xl font-bold ${styles.text} ${styles.font}`}
                    >
                      {stats.files}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${
                      theme === "modern" ? "bg-slate-800/50" : "bg-white/50"
                    } border ${styles.border}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FolderTree className={`h-5 w-5 ${styles.accent}`} />
                      <span
                        className={`text-sm ${styles.textMuted} ${styles.font}`}
                      >
                        Directories
                      </span>
                    </div>
                    <p
                      className={`text-2xl font-bold ${styles.text} ${styles.font}`}
                    >
                      {stats.dirs}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${
                      theme === "modern" ? "bg-slate-800/50" : "bg-white/50"
                    } border ${styles.border} col-span-2`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className={`h-5 w-5 ${styles.accent}`} />
                      <span
                        className={`text-sm ${styles.textMuted} ${styles.font}`}
                      >
                        Total Size
                      </span>
                    </div>
                    <p
                      className={`text-2xl font-bold ${styles.text} ${styles.font}`}
                    >
                      {formatBytes(stats.totalSize)}
                    </p>
                  </div>
                </div>

                {/* GitHub Link */}
                <a
                  href={`https://github.com/${owner}/${repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-3 rounded-lg ${styles.buttonBg} ${styles.buttonText} font-medium transition-colors ${styles.font}`}
                >
                  View on GitHub
                </a>
              </div>
            )}

            {activeInfoTab === "commits" && (
              <CommitHistory
                owner={owner || ""}
                repo={repo || ""}
                branch={branch || "main"}
              />
            )}

            {activeInfoTab === "contributors" && (
              <TopContributors owner={owner || ""} repo={repo || ""} />
            )}

            {activeInfoTab === "activity" && (
              <RepoActivity owner={owner || ""} repo={repo || ""} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Fullscreen Loading
  // Fullscreen Loading
  if (isLoading) {
    return <ImmersiveLoader />;
  }

  // Fullscreen Error
  if (error) {
    return (
      <div
        className={`fixed inset-0 ${styles.bg} flex items-center justify-center`}
      >
        <div
          className={`max-w-md p-8 rounded-xl ${styles.panelBg} border ${styles.border}`}
        >
          <h2
            className={`text-2xl font-bold ${styles.text} mb-4 ${styles.font}`}
          >
            Error
          </h2>
          <p className={`${styles.textMuted} mb-6`}>{error}</p>
          <Link
            href="/"
            className={`block text-center py-3 rounded-lg ${styles.buttonBg} ${styles.buttonText} font-medium ${styles.font}`}
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 ${styles.bg} overflow-hidden`}>
      {/* Fullscreen Canvas */}
      {memoized2DData && (
        <div className="absolute inset-0">
          <RepoVisualizer
            data={memoized2DData}
            onNodeSelect={(node) => setSelectedNode(node)}
            theme={theme}
            owner={owner || undefined}
            repo={repo || undefined}
            branch={branch || undefined}
          />
        </div>
      )}

      {/* Top Bar - Floating */}
      <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="flex items-center justify-between p-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto"
          >
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${styles.panelBg} backdrop-blur-xl border ${styles.border} ${styles.text} hover:opacity-80 transition-opacity ${styles.font}`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
          </motion.div>

          {/* Center - Repo Name */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-6 py-2 rounded-full ${styles.panelBg} backdrop-blur-xl border ${styles.border} pointer-events-auto`}
          >
            <h1 className={`text-sm font-medium ${styles.text} ${styles.font}`}>
              {owner}/{repo}
              {branch && branch !== "main" && (
                <span className={`ml-2 ${styles.textMuted}`}>({branch})</span>
              )}
            </h1>
          </motion.div>

          {/* Right - Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 pointer-events-auto"
          >
            {/* Theme Selector */}
            <div
              className={`relative ${styles.panelBg} backdrop-blur-xl rounded-full border ${styles.border}`}
            >
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as VisualizationTheme)}
                className={`appearance-none bg-transparent ${styles.text} text-sm font-medium px-4 py-2 pr-10 rounded-full cursor-pointer focus:outline-none ${styles.font}`}
              >
                <option value="modern">Modern</option>
                <option value="pencil">Pencil</option>
                <option value="comic">Comic</option>
              </select>
              <Palette
                className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${styles.textMuted}`}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Canvas Widgets */}

      {/* Left Side Widget Stack - Above Legend */}
      <div className="absolute top-20 left-4 z-30 pointer-events-auto w-fit space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
        {/* Stats Widget */}
        <StatsWidget
          theme={theme}
          stats={stats}
          owner={owner || ""}
          repo={repo || ""}
          branch={branch || undefined}
        />

        {/* Commits Widget */}
        <CommitsWidget
          theme={theme}
          owner={owner || ""}
          repo={repo || ""}
          branch={branch || undefined}
        />

        {/* Contributors Widget */}
        <ContributorsWidget
          theme={theme}
          owner={owner || ""}
          repo={repo || ""}
        />

        {/* Activity Widget */}
        <ActivityWidget theme={theme} owner={owner || ""} repo={repo || ""} />
      </div>

      {/* Node Detail Sidebar (from RepoVisualizer) - for full details */}
      <Sidebar node={selectedNode} rootNode={memoized2DData} theme={theme} />
    </div>
  );
};

// Main page component with Suspense boundary
const VisualizationPage = () => {
  return (
    <Suspense fallback={<ImmersiveLoader />}>
      <VisualizationContent />
    </Suspense>
  );
};

export default VisualizationPage;
