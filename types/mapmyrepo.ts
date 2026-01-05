/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from "d3";

export enum NodeType {
  FOLDER = "FOLDER",
  FILE = "FILE",
  FUNCTION = "FUNCTION",
  CLASS = "CLASS",
  COMPONENT = "COMPONENT",
}

export interface ChatMessage {
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

export interface FileSystemNode {
  name: string;
  type: NodeType;
  children?: FileSystemNode[];
  content?: string; // For files, the actual code
  description?: string; // AI generated description for specific item
  summary?: string; // AI generated overall significance of the file
  path: string; // Relative path
  size?: number; // File size or arbitrary size for visualization
  analyzed?: boolean; // If true, children (functions) have been populated by AI
  value?: number; // For d3 packing
  downloadUrl?: string; // URL to fetch raw content
}

export interface AIAnalysisResult {
  summary: string; // High level purpose of the file
  items: {
    name: string;
    type: "FUNCTION" | "CLASS" | "COMPONENT";
    description: string;
  }[];
}

// D3 Force Graph Types
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string; // Unique path
  name: string;
  type: NodeType;
  data: FileSystemNode; // Reference to original data
  r?: number; // Radius
  color?: string;
  isExpanded?: boolean; // Visual state for Folders/Files
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  depth?: number; // Distance from root
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value?: number; // Strength/Distance modifier
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url?: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  master_branch?: string;
  default_branch: string;
  score?: number;
  // Visualization props
  r?: number;
  color?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface UniverseNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: "USER" | "LANGUAGE" | "REPO";
  r?: number;
  color?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  // Specific properties
  language?: string;
  full_name?: string;
  stargazers_count?: number;
  data?: GithubRepo;
}

export interface UniverseLink extends d3.SimulationLinkDatum<UniverseNode> {
  source: string | UniverseNode;
  target: string | UniverseNode;
  value?: number;
}

// Theme type (cosmic removed - 3D disabled)
export type VisualizationTheme = "modern" | "pencil" | "comic";

// Color palettes
export const watercolorColors: Record<string, string> = {
  TypeScript: "#89CFF0",
  JavaScript: "#FFFACD",
  Python: "#98FB98",
  Java: "#DEB887",
  HTML: "#FFA07A",
  CSS: "#E6E6FA",
  "C++": "#FFB6C1",
  "C#": "#90EE90",
  Go: "#E0FFFF",
  Rust: "#FFDAB9",
  PHP: "#B0C4DE",
  Ruby: "#CD5C5C",
  Swift: "#FA8072",
  Kotlin: "#DDA0DD",
  Dart: "#AFEEEE",
  Shell: "#F0E68C",
  C: "#D3D3D3",
  Vue: "#98FB98",
  React: "#E0FFFF",
  Svelte: "#FFA07A",
  Dockerfile: "#B0C4DE",
  Other: "#D3D3D3",
};

export const githubColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C++": "#f34b7d",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  C: "#555555",
  Vue: "#41b883",
  React: "#61dafb",
  Svelte: "#ff3e00",
  Dockerfile: "#384d54",
  Other: "#8b949e",
};

// Watercolor Palette for Comic Theme (Repo Nodes)
export const watercolorRepoColors: Record<string, string> = {
  FOLDER: "#89CFF0",
  FILE: "#D3D3D3",
  FUNCTION: "#DDA0DD",
  CLASS: "#FFDAB9",
  COMPONENT: "#98FB98",
  DEFAULT: "#D3D3D3",
};
