import * as THREE from "three";
import { GraphNode, VisualizationTheme } from "@/types/mapmyrepo";

export const getLinkThreeObject = (link: any, theme: VisualizationTheme) => {
  if (theme !== "pencil" && theme !== "comic") return null; // Use default for others

  // Create a wobbly curve
  const start = link.source;
  const end = link.target;

  if (!start || !end || typeof start !== "object" || typeof end !== "object")
    return null;

  // We can't easily get strict positions here because ForceGraph manages them.
  // BUT: react-force-graph calls this function ONCE. It doesn't update positions automatically for custom objects unless we handle it in `linkPositionUpdate`.
  // Actually, returning a custom object here means WE are responsible for updating it, OR the library updates the position/rotation of the returned object?
  // The library updates position/orientation of the returned object to Match source/target.
  // So we just need a line of specific length? No, length changes.

  // Strategy: The library scales/positions the object.
  // If we return a specific geometry, it might get distorted.

  // Alternative: Just use standard lines but with a specialized material or width?
  // User wants "detail". Wobbly lines need geometry updates every frame.

  // Let's rely on specific `linkWidth` and `resolution` for now.
  // If we REALLY need sketchy lines, we'd need to update geometry in `linkPositionUpdate`.

  return null; // Fallback to default for now to avoid broken physics/rendering
};
