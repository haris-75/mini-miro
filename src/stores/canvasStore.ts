import type { Edge, Node, XYPosition, Connection } from "reactflow";
import { addEdge, MarkerType } from "reactflow";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShapeKind } from "../types/canvas";

type RFState = {
  nodes: Node[];
  edges: Edge[];
  nextId: number;
  addNode: (pos: XYPosition) => void;
  addShape: (pos: XYPosition) => void;
  addText: (pos: XYPosition) => void;
  addGroup: (pos: XYPosition) => void;
  groupSelectionIntoFrame: () => void;
  deleteSelected: () => void;
  ui: { showResizers: boolean; allowStretch: boolean };
  setUI: (patch: Partial<RFState["ui"]>) => void;

  edgeOpts: {
    type: "straight" | "step" | "smoothstep";
    dashed: boolean;
    arrow: boolean;
    label: string;
  };
  setEdgeOpts: (patch: Partial<RFState["edgeOpts"]>) => void;

  shapeOpts: {
    kind: ShapeKind;
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
  setShapeOpts: (patch: Partial<RFState["shapeOpts"]>) => void;

  onConnect: (conn: Connection) => void;
  setNodes: (updater: (nds: Node[]) => Node[]) => void;
  setEdges: (updater: (eds: Edge[]) => Edge[]) => void;
};

export const useRFStore = create<RFState>()(
  persist(
    (set, get) => ({
      deleteSelected: () =>
        set((s) => {
          const toDelete = new Set(
            s.nodes.filter((n) => n.selected).map((n) => n.id)
          );
          if (toDelete.size === 0) return {};
          return {
            nodes: s.nodes.filter((n) => !toDelete.has(n.id)),
            edges: s.edges.filter(
              (e) => !toDelete.has(e.source) && !toDelete.has(e.target)
            ),
          };
        }),

      nodes: [],
      edges: [],
      nextId: 1,

      ui: { showResizers: false, allowStretch: false },
      setUI: (patch) => set((s) => ({ ui: { ...s.ui, ...patch } })),

      addNode: (pos) =>
        set((s) => ({
          nodes: [
            ...s.nodes,
            {
              id: String(s.nextId),
              type: "sticky",
              position: pos,
              data: { text: `Node ${s.nextId}` },
              style: { width: 180, height: 120 },
            },
          ],
          nextId: s.nextId + 1,
        })),

      shapeOpts: {
        kind: "rectangle",
        fill: "#bfdbfe",
        stroke: "#1e3a8a",
        strokeWidth: 2,
      },
      setShapeOpts: (patch) =>
        set((s) => ({ shapeOpts: { ...s.shapeOpts, ...patch } })),
      addShape: (pos) =>
        set((s) => {
          const o = get().shapeOpts;
          return {
            nodes: [
              ...s.nodes,
              {
                id: String(s.nextId),
                type: "shape",
                position: pos,
                data: {
                  kind: o.kind,
                  fill: o.fill,
                  stroke: o.stroke,
                  strokeWidth: o.strokeWidth,
                },
                style: {
                  width: o.kind === "rectangle" ? 160 : 120,
                  height: 120,
                  border: "none",
                  padding: 0,
                  background: "transparent",
                },
              },
            ],
            nextId: s.nextId + 1,
          };
        }),

      addText: (pos) =>
        set((s) => ({
          nodes: [
            ...s.nodes,
            {
              id: String(s.nextId),
              type: "textNode",
              position: pos,
              data: { text: "Title" },
              style: {
                width: 220,
                height: 56,
                background: "transparent",
                padding: 0,
              },
            },
          ],
          nextId: s.nextId + 1,
        })),

      addGroup: (pos) =>
        set((s) => ({
          nodes: [
            ...s.nodes,
            {
              id: String(s.nextId),
              type: "group",
              position: pos,
              data: {},
              style: {
                width: 320,
                height: 220,
                padding: 12,
                background: "transparent",
              },
            },
          ],
          nextId: s.nextId + 1,
        })),

      groupSelectionIntoFrame: () =>
        set((s) => {
          const selected = s.nodes.filter((n) => n.selected);
          if (selected.length === 0) return {};

          const minX = Math.min(...selected.map((n) => n.position.x));
          const minY = Math.min(...selected.map((n) => n.position.y));
          const maxX = Math.max(
            ...selected.map(
              (n) => n.position.x + (Number(n.style?.width) || 160)
            )
          );
          const maxY = Math.max(
            ...selected.map(
              (n) => n.position.y + (Number(n.style?.height) || 120)
            )
          );

          const pad = 24;
          const frameId = String(s.nextId);

          const frame: Node = {
            id: frameId,
            type: "group",
            position: { x: minX - pad, y: minY - pad },
            data: {},
            style: {
              width: maxX - minX + pad * 2,
              height: maxY - minY + pad * 2,
              padding: 12,
              background: "transparent",
            },
          };

          const intoGroup = (
            n: Node,
            parentPos: XYPosition,
            parentId: string
          ): Node => ({
            ...n,
            parentNode: parentId,
            extent: "parent",
            position: {
              x: n.position.x - parentPos.x,
              y: n.position.y - parentPos.y,
            },
            positionAbsolute: undefined,
          });

          const children: Node[] = s.nodes.map((n) =>
            n.selected ? intoGroup(n, frame.position, frame.id) : n
          );

          return {
            nodes: [...children, frame],
            nextId: s.nextId + 1,
          };
        }),

      edgeOpts: { type: "straight", dashed: false, arrow: true, label: "" },
      setEdgeOpts: (patch) =>
        set((s) => ({ edgeOpts: { ...s.edgeOpts, ...patch } })),

      onConnect: (conn) =>
        set((s) => {
          const o = get().edgeOpts;
          return {
            edges: addEdge(
              {
                ...conn,
                type: o.type,
                label: o.label || undefined,
                markerEnd: o.arrow
                  ? { type: MarkerType.ArrowClosed }
                  : undefined,
                style: o.dashed ? { strokeDasharray: "6 4" } : undefined,
              },
              s.edges
            ),
          };
        }),

      setNodes: (updater) => set((s) => ({ nodes: updater(s.nodes) })),
      setEdges: (updater) => set((s) => ({ edges: updater(s.edges) })),
    }),
    {
      name: "rf:canvas:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        nodes: s.nodes,
        edges: s.edges,
        nextId: s.nextId,
        edgeOpts: s.edgeOpts,
        shapeOpts: s.shapeOpts,
        ui: s.ui,
      }),
    }
  )
);
