import { useCallback, useRef } from "react";
import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";
import { useRFStore } from "../stores/canvasStore";

type TextData = { text: string };
type P = { id: string; data: TextData; selected?: boolean };

export default function TextNode({ id, data, selected }: P) {
  const setNodes = useRFStore((s) => s.setNodes);
  const showResizers = useRFStore((s) => s.ui.showResizers);
  const divRef = useRef<HTMLDivElement | null>(null);

  const onBlur = useCallback(() => {
    const val = divRef.current?.innerText ?? "";
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { text: val } } : n))
    );
  }, [id, setNodes]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer
        isVisible={!!selected || showResizers}
        minWidth={80}
        minHeight={40}
      />

      <div
        className="drag-handle"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 14,
          cursor: "grab",
        }}
      />

      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={onBlur}
        className="nodrag nopan"
        tabIndex={0}
        role="textbox"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          height: "100%",
          padding: 8,
          outline: "none",
          background: "#2a5a94ff",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          fontWeight: 600,
          userSelect: "text",
          cursor: "text",
          whiteSpace: "pre-wrap",
          textAlign: "center",
        }}
      >
        {data.text}
      </div>
    </div>
  );
}
