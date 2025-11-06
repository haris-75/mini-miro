import type { Edge, Node, XYPosition, Connection } from "reactflow";
import { addEdge, MarkerType } from "reactflow";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ShapeKind = "rectangle" | "circle" | "diamond";

type RFState = {
  nodes: Node[];
  edges: Edge[];
  nextId: number;
  addNode: (pos: XYPosition) => void;
  addShape: (pos: XYPosition) => void;

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
      nodes: [],
      edges: [],
      nextId: 1,

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
      // persist only serializable state
      partialize: (s) => ({
        nodes: s.nodes,
        edges: s.edges,
        nextId: s.nextId,
        edgeOpts: s.edgeOpts,
        shapeOpts: s.shapeOpts,
      }),
    }
  )
);
