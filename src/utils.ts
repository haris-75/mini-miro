import type { EdgeType, ShapeKind } from "./types/canvas";

export function isShapeKind(v: string): v is ShapeKind {
  return v === "rectangle" || v === "circle" || v === "diamond";
}
export function isEdgeType(v: string): v is EdgeType {
  return v === "straight" || v === "step" || v === "smoothstep";
}
