// StickyNoteNode.tsx
import { Handle, Position } from "reactflow";

type StickyData = { text: string };

// Minimal prop shape React Flow passes to custom nodes
type CustomNodeProps<T> = {
  id: string;
  data: T;
  selected?: boolean;
  isConnectable?: boolean;
  dragging?: boolean;
};

export default function StickyNoteNode({ data }: CustomNodeProps<StickyData>) {
  return (
    <div
      style={{
        padding: 12,
        background: "#004766ff",
        borderRadius: 8,
        minWidth: 120,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>{data.text}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
