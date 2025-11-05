import { useRef, useCallback, useLayoutEffect } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import { NodeResizer } from "@reactflow/node-resizer";
import { useRFStore } from "../stores/canvasStore";

type StickyData = { text: string };
type CustomNodeProps<T> = {
  id: string;
  data: T;
  selected?: boolean;
  isConnectable?: boolean;
};

export default function StickyNode({
  id,
  data,
  selected,
}: CustomNodeProps<StickyData>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const setNodes = useRFStore((s) => s.setNodes);
  const boxRef = useRef<HTMLDivElement | null>(null);

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

  const textRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    el.textContent = data.text ?? "";
  }, [id, data.text]);

  return (
    <div
      ref={boxRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#554d2fff",
        borderRadius: 8,
        padding: 10,
        boxShadow: "0 1px 0 rgba(0,0,0,.08)",
        minWidth: 120,
        minHeight: 90,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NodeResizer
        isVisible={!!selected}
        minWidth={120}
        minHeight={90}
        onResizeEnd={onResizeEnd}
      />

      <Handle type="target" position={Position.Top} />

      <div
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        tabIndex={0}
        className="nodrag nowheel"
        style={{
          pointerEvents: "all",
          outline: "none",
          cursor: "text",
          fontSize: 14,
          lineHeight: 1.25,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          flex: 1,
          minHeight: 0,
          overflow: "auto",
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onBlur={() => {
          const next = textRef.current?.innerText ?? "";
          setNodes((nds) =>
            nds.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, text: next } } : n
            )
          );
        }}
      />

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
