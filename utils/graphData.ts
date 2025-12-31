"use client"

// Types for repository data
export interface RepoFile {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'dir';
  children?: RepoFile[]; // For directories with nested content

  // sha: string;
  // url: string;
  // html_url: string;
  // git_url: string;
  // download_url: string | null;
  // _links: {
  //   self: string;
  //   git: string;
  //   html: string;
  // };
}

export interface RepoData {
  readme: string;
  files: RepoFile[];
  branch?: string;
}

// Types for graph data
export interface GraphNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  color: string;
  val: number; // Size for visualization
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  parentId: string|null // useul for expand/collpse logic
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Color mapping for different file types
export const fileTypeColors:  Record<string, string> = {
  // Config files
  json: '#f1e05a', // Yellow
  yml: '#cb171e', // Red
  yaml: '#cb171e', // Red
  toml: '#cb171e', // Red
  ini: '#cb171e', // Red
  env: '#cb171e', // Red

  // Code files
  js: '#f1e05a', // Yellow
  jsx: '#f1e05a', // Yellow
  ts: '#3178c6', // Blue
  tsx: '#3178c6', // Blue
  py: '#3572A5', // Python blue
  rb: '#701516', // Ruby red
  java: '#b07219', // Java brown
  go: '#00ADD8', // Go blue
  rs: '#dea584', // Rust orange
  php: '#4F5D95', // PHP purple
  c: '#555555', // C gray
  cpp: '#f34b7d', // C++ pink
  cs: '#178600', // C# green
  html: '#e34c26', // HTML orange
  css: '#563d7c', // CSS purple
  scss: '#c6538c', // SCSS pink
  md: '#083fa1', // Markdown blue

  // Default
  dir: '#6cc644', // Green for directories
  default: '#9e9e9e', // Gray for unknown types
};

// const fileTypeColors: Record<string, string> = {
//   // Config files – Solar golds and mars reds
//   json: '#d1b654',     // Muted solar gold
//   yml: '#a44242',      // Mars red
//   yaml: '#a44242',
//   toml: '#a44242',
//   ini: '#a44242',
//   env: '#a44242',

//   // Code files – Earthy and cosmic hues
//   js: '#d1b654',       // Same gold as JSON
//   jsx: '#d1b654',
//   ts: '#446e9b',       // Deep cosmic blue
//   tsx: '#446e9b',
//   py: '#5e88af',       // Muted starlight blue
//   rb: '#8e4a53',       // Dusty ruby
//   java: '#a06b3f',     // Dried clay
//   go: '#4c8891',       // Faded ocean blue
//   rs: '#c29a6b',       // Rusty bronze
//   php: '#6d5d8c',      // Dimmed twilight purple
//   c: '#606060',        // Carbon gray
//   cpp: '#a65f73',      // Slightly rich dusty rose
//   cs: '#5a8051',       // Faded forest green
//   html: '#b14d2e',     // Burnt orange
//   css: '#5c4f73',      // Smoky amethyst
//   scss: '#a85d76',     // Faded wine
//   md: '#486d88',       // Dull storm blue

//   // Default
//   dir: '#508a57',      // Desaturated moss green
//   default: '#6a6a6a',  // Graphite gray
// };

// Get color based on file extension
const getFileColor = (fileName: string, type: 'file' | 'dir'): string => {
  if (type === 'dir') {
    return fileTypeColors.dir;
  }

  const extension = fileName.split('.').pop()?.toLowerCase() || 'default';
  return fileTypeColors[extension] || fileTypeColors.default;
};

// Calculate node size based on file size
const getNodeSize = (size: number, type: 'file' | 'dir'): number => {
  if (type === 'dir') { 
    return 6; // Base size for directories
  }

  // Logarithmic scale for file sizes to prevent huge nodes
  const baseSize = 2;
  if (size === 0) return baseSize;

  return baseSize + Math.log10(size) * 0.8;
};

// Transform repository data into graph format
export const transformRepoToGraph = (repoData: RepoData): GraphData => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Add root node (repository)
  const rootNodeId = 'root';
  nodes.push({
    id: rootNodeId,
    name: 'Repository Root',
    path: '/',
    type: 'dir',
    size: 0,
    color: '#6cc644',
    val: 6,
    depth: 0,
    parentId:null,
    hasChildren:repoData.files.length > 0,
    expanded: true,
 
  });

  // Process files and directories recursively
  const processFiles = (files: RepoFile[], parentId = rootNodeId, depth = 1) => {
    for (const file of files) {
      const nodeId = file.path;

      // Add node
      nodes.push({
        id: nodeId,
        name: file.name,
        path: file.path,
        type: file.type,
        size: file.size,
        color: getFileColor(file.name, file.type),
        val: getNodeSize(file.size, file.type),
         depth,
    parentId:parentId,
    hasChildren:  file.type === 'dir' && file.children !== undefined && file.children.length > 0,
    expanded: false,
      });

      // Link to parent
      links.push({
        source: parentId,
        target: nodeId,
      });

      // Process children if this is a directory with children
      if (file.type === 'dir' && file.children && file.children.length > 0) {
        processFiles(file.children, nodeId, depth+1);
      }
    }
  };

  processFiles(repoData.files);
  console.log(nodes, links);

  return { nodes, links };
};