import * as THREE from "three";
import { GraphNode, NodeType, VisualizationTheme } from "@/types/mapmyrepo";
import { fileTypeColors } from "./graphData";

const textureCache: Record<string, THREE.Texture> = {};

// 1. Definition Strings (Exact copies from RepoVisualizer)
const SVG_DEFS = `
  <filter id="sketchy-border-repo" x="-25%" y="-25%" width="150%" height="150%">
    <feTurbulence baseFrequency="0.05" numOctaves="2" result="noise" type="fractalNoise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
  </filter>
  
  <filter id="sketchy-border-comic" x="-25%" y="-25%" width="150%" height="150%">
    <feTurbulence baseFrequency="0.05" numOctaves="2" result="noise" type="fractalNoise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
  </filter>

  <filter id="grainy-texture-repo" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" result="noise"/>
    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0" in="noise" result="coloredNoise"/>
    <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="compositeNoise"/>
    <feMerge>
      <feMergeNode in="SourceGraphic"/>
      <feMergeNode in="compositeNoise"/>
    </feMerge>
  </filter>

  <pattern id="pattern-folder" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
    <rect width="8" height="8" fill="#ffffff"/>
    <path d="M0 0L8 8M8 0L0 8" stroke="#000000" stroke-width="0.5"/>
  </pattern>

  <pattern id="pattern-file" patternUnits="userSpaceOnUse" width="6" height="6">
    <circle cx="3" cy="3" r="1" fill="#000000"/>
  </pattern>

  <pattern id="pattern-function" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="6" stroke="#000000" stroke-width="1"/>
  </pattern>

  <pattern id="pattern-class" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
    <path d="M0 0L8 8M8 0L0 8" stroke="#000000" stroke-width="1"/>
  </pattern>

  <pattern id="pattern-component" patternUnits="userSpaceOnUse" width="4" height="4">
    <circle cx="2" cy="2" r="1" fill="#000000"/>
  </pattern>
`;

// Helper for Comic Colors
const watercolorRepoColors: Record<string, string> = {
  FOLDER: "#89CFF0", // Baby Blue
  FILE: "#D3D3D3", // Light Gray
  FUNCTION: "#DDA0DD", // Plum
  CLASS: "#FFDAB9", // Peach Puff
  COMPONENT: "#98FB98", // Pale Green
  DEFAULT: "#D3D3D3",
};

const getComicColor = (node: GraphNode) => {
  const ext = node.name.split(".").pop()?.toLowerCase();
  const comicColors: Record<string, string> = {
    js: "#FFFACD",
    ts: "#89CFF0",
    tsx: "#98FB98",
    jsx: "#FFFACD",
    py: "#98FB98",
    html: "#FFA07A",
    css: "#E6E6FA",
    json: "#FFDAB9",
  };
  return (
    comicColors[ext || ""] ||
    watercolorRepoColors[node.type as string] ||
    watercolorRepoColors.DEFAULT
  );
};

// Main Generator
export const generateSVGTexture = (
  node: GraphNode,
  theme: VisualizationTheme
): THREE.Texture => {
  const cacheKey = `${node.id}-${theme}-${node.isExpanded}`; // Include expansion state if it affects visual
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const size = 128; // Higher resolution for closeups
  const r = 50;
  const cx = 64;
  const cy = 64;

  let fill = "";
  let stroke = "";
  let strokeWidth = "";
  let filter = "";

  // 2. Determine Attributes based on Exact 2D Logic
  if (theme === "pencil") {
    stroke = "#000000";
    strokeWidth = node.isExpanded ? "3" : "2"; // +1 width for texture clarity
    filter = `url(#sketchy-border-repo)`;

    const nodeType = String(node.type);
    if (nodeType === NodeType.FOLDER || nodeType === "dir") {
      fill = "url(#pattern-folder)";
    } else if (nodeType === NodeType.FILE || nodeType === "file") {
      fill = "url(#pattern-file)";
    } else if (nodeType === NodeType.FUNCTION) {
      fill = "url(#pattern-function)";
    } else if (nodeType === NodeType.CLASS) {
      fill = "url(#pattern-class)";
    } else if (nodeType === NodeType.COMPONENT) {
      fill = "url(#pattern-component)";
    } else {
      fill = "#ffffff";
    }
  } else if (theme === "comic") {
    stroke = "#000000";
    strokeWidth = "4";
    filter = `url(#grainy-texture-repo) url(#sketchy-border-comic)`;
    fill = getComicColor(node);
  } else {
    // Fallback: simple fill
    fill = node.color || "#8b949e";
    stroke = node.isExpanded ? "#0969da" : "#ffffff";
  }

  // 3. Construct SVG
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        ${SVG_DEFS}
      </defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" filter="${filter}" />
    </svg>
  `;

  // 4. Convert to Texture
  const img = new Image();
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const texture = new THREE.Texture(img);
  img.onload = () => {
    texture.needsUpdate = true;
    URL.revokeObjectURL(url); // Cleanup
  };
  img.src = url;

  textureCache[cacheKey] = texture;
  return texture;
};
