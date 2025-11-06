import { useRef, useCallback } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";
import { useRFStore } from "../stores/canvasStore";

type ShapeData = {
  kind: "rectangle" | "circle" | "diamond";
  fill: string;
  stroke: string;
  strokeWidth: number;
};

type CustomNodeProps<T> = { id: string; data: T; selected?: boolean };

export default function ShapeNode({
  id,
  data,
  selected,
}: CustomNodeProps<ShapeData>) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const setNodes = useRFStore((s) => s.setNodes);
  const showResizers = useRFStore((s) => s.ui.showResizers);
  const allowStretch = useRFStore((s) => s.ui.allowStretch);

  const onResizeEnd = useCallback(() => {
    const el = boxRef.current;
    if (!el) return;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, style: { ...n.style, width, height } } : n
      )
    );
    updateNodeInternals(id);
  }, [id, setNodes, updateNodeInternals]);

  const isCircle = data.kind === "circle";
  const isDiamond = data.kind === "diamond";

  return (
    <div
      ref={boxRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        padding: 8,
        minWidth: 80,
        minHeight: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        overflow: "visible",
      }}
    >
      <NodeResizer
        isVisible={!!selected || showResizers}
        minWidth={80}
        minHeight={80}
        keepAspectRatio={(isCircle || isDiamond) && !allowStretch}
        onResizeEnd={onResizeEnd}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ left: -6, zIndex: 3 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ right: -6, zIndex: 3 }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: isCircle ? "50%" : 8,
          background: data.fill,
          border: `${data.strokeWidth}px solid ${data.stroke}`,
          transform: isDiamond ? "rotate(45deg)" : "none",
          transformOrigin: "center",
          aspectRatio: isCircle || isDiamond ? "1 / 1" : "auto",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
