import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";
import { useRFStore } from "../stores/canvasStore";

type P = { selected?: boolean };

export default function GroupNode({ selected }: P) {
  const showResizers = useRFStore((s) => s.ui.showResizers);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "rgba(59,130,246,0.06)",
        border: "2px dashed #3b82f6",
        borderRadius: 12,
      }}
    >
      <NodeResizer
        isVisible={!!selected || showResizers}
        minWidth={160}
        minHeight={120}
      />
    </div>
  );
}
