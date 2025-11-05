import { create } from "zustand";
import type { Edge, Node, XYPosition, Connection } from "reactflow";
import { addEdge } from "reactflow";

type RFState = {
  nodes: Node[];
  edges: Edge[];
  nextId: number;
  addNode: (pos: XYPosition) => void;
  onConnect: (conn: Connection) => void;
  setNodes: (updater: (nds: Node[]) => Node[]) => void;
  setEdges: (updater: (eds: Edge[]) => Edge[]) => void;
};

export const useRFStore = create<RFState>((set) => ({
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
  onConnect: (conn) => set((s) => ({ edges: addEdge(conn, s.edges) })),
  setNodes: (updater) => set((s) => ({ nodes: updater(s.nodes) })),
  setEdges: (updater) => set((s) => ({ edges: updater(s.edges) })),
}));
