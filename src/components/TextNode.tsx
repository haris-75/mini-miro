import { useCallback, useRef } from "react";
import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";
import { useRFStore } from "../stores/canvasStore";

type TextData = { text: string };
type P = { id: string; data: TextData; selected?: boolean };

export default function TextNode({ id, data, selected }: P) {
  const setNodes = useRFStore((s) => s.setNodes);
  const divRef = useRef(null);

  const onInput = useCallback(() => {
    const val = divRef.current?.innerText ?? "";
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { text: val } } : n))
    );
  }, [id, setNodes]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer isVisible={!!selected} minWidth={80} minHeight={40} />
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        style={{
          width: "100%",
          height: "100%",
          padding: 8,
          outline: "none",
          background: "white",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        {data.text}
      </div>
    </div>
  );
}
