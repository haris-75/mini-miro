import type { Node, Edge, NodeTypes, EdgeTypes } from "reactflow";

import StraightEdge from "../components/StraightEdge";
import StickyNode from "../components/StickyNode";
export type Tool = "select" | "add-sticky";

export interface StickyData {
  text: string;
  w: number;
  h: number;
}

export type AppNode = Node<StickyData>;
export type AppEdge = Edge;

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export interface PersistedCanvas {
  version: 1;
  nodes: AppNode[];
  edges: AppEdge[];
  viewport: ViewportState;
}

export const NODE_TYPES: NodeTypes = {
  sticky: StickyNode,
};

export const EDGE_TYPES: EdgeTypes = { straight: StraightEdge };

export type ShapeKind = "rectangle" | "circle" | "diamond";
export type EdgeType = "straight" | "step" | "smoothstep";
