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
  generateLargeGraph: (count: number) => void;
  resetCanvas: () => void;
};

export const useRFStore = create<RFState>()(
  persist(
    (set, get) => ({
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
      generateLargeGraph: (count: number) =>
        set((s) => {
          const kinds: ShapeKind[] = ["rectangle", "circle", "diamond"];
          const o = get().edgeOpts;

          const startId = s.nextId;
          const nodes: Node[] = new Array(count);
          const edges: Edge[] = new Array(Math.max(0, count - 1));

          const cols = 100; // 100 x 100 = 10k
          const gx = 200;
          const gy = 140;

          for (let i = 0; i < count; i++) {
            const id = String(startId + i);
            const row = Math.floor(i / cols);
            const col = i % cols;

            // rotate through: shape → sticky → text
            const t =
              i % 3 === 0 ? "shape" : i % 3 === 1 ? "sticky" : "textNode";

            if (t === "shape") {
              const kind = kinds[(i / 3) % kinds.length | 0];
              const w = kind === "rectangle" ? 160 : 120;
              const h = kind === "rectangle" ? 120 : 120;
              nodes[i] = {
                id,
                type: "shape",
                position: { x: col * gx, y: row * gy },
                data: {
                  kind,
                  fill: i % 2 ? "#bfdbfe" : "#fde68a",
                  stroke: "#1e3a8a",
                  strokeWidth: 2,
                },
                style: {
                  width: w,
                  height: h,
                  border: "none",
                  padding: 0,
                  background: "transparent",
                },
              };
            } else if (t === "sticky") {
              nodes[i] = {
                id,
                type: "sticky",
                position: { x: col * gx, y: row * gy },
                data: { text: `Note ${id}` },
                style: { width: 180, height: 120 },
              };
            } else {
              // textNode
              nodes[i] = {
                id,
                type: "textNode",
                position: { x: col * gx, y: row * gy },
                data: { text: `Title ${id}` },
                style: {
                  width: 220,
                  height: 56,
                  background: "transparent",
                  padding: 0,
                },
              };
            }

            if (i > 0) {
              const prev = String(startId + i - 1);
              edges[i - 1] = {
                id: `e${prev}-${id}`,
                source: prev,
                target: id,
                type: o.type,
                label: o.label || undefined,
                markerEnd: o.arrow
                  ? { type: MarkerType.ArrowClosed }
                  : undefined,
                style: o.dashed ? { strokeDasharray: "6 4" } : undefined,
              };
            }
          }

          return {
            nodes: [...s.nodes, ...nodes],
            edges: [...s.edges, ...edges],
            nextId: startId + count,
          };
        }),
      resetCanvas: () =>
        set(() => ({
          nodes: [],
          edges: [],
          nextId: 1,
        })),
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
