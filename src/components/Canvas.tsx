import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import { useRFStore } from "../stores/canvasStore";
import StickyNode from "./StickyNode";
import ShapeNode from "./ShapeNode";
import TextNode from "./TextNode";
import GroupNode from "./GroupNode";
import { useEffect } from "react";
import { isEdgeType, isShapeKind } from "../utils";
const nodeTypes = {
  sticky: StickyNode,
  shape: ShapeNode,
  textNode: TextNode,
  group: GroupNode,
};

function Board() {
  const {
    addNode,
    addShape,
    addText,
    addGroup,
    groupSelectionIntoFrame,
    nodes,
    edges,
    setNodes,
    setEdges,
    onConnect,
    edgeOpts,
    setEdgeOpts,
    shapeOpts,
    setShapeOpts,
    deleteSelected,
    ui,
    setUI,
  } = useRFStore();
  const rf = useReactFlow();

  const centerPos = () =>
    rf.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

  const onAddSticky = () => addNode(centerPos());
  const onAddShape = () => addShape(centerPos());
  const onAddText = () => addText(centerPos());
  const onAddGroup = () => addGroup(centerPos());

  useEffect(() => {
    const isEditing = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const name = el.tagName;
      if (name === "INPUT" || name === "TEXTAREA") return true;
      if (el.isContentEditable) return true;
      return false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (isEditing()) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 10,
          display: "flex",
          gap: 8,
        }}
      >
        <button onClick={onAddSticky}>+ Sticky</button>
        <button onClick={onAddShape}>+ Shape</button>
        <button onClick={onAddText}>+ Text</button>
        <button onClick={onAddGroup}>+ Group</button>
        <button onClick={deleteSelected}>🗑 Delete</button>
        <button onClick={groupSelectionIntoFrame}>Group Selection</button>
        <select
          value={shapeOpts.kind}
          onChange={(e) => {
            const v = e.target.value;
            if (isShapeKind(v)) setShapeOpts({ kind: v });
          }}
          title="Shape"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="diamond">Diamond</option>
        </select>
        <input
          type="color"
          value={shapeOpts.fill}
          onChange={(e) => setShapeOpts({ fill: e.target.value })}
          title="Fill"
        />
        <input
          type="color"
          value={shapeOpts.stroke}
          onChange={(e) => setShapeOpts({ stroke: e.target.value })}
          title="Stroke"
        />
        <input
          type="number"
          min={1}
          max={8}
          value={shapeOpts.strokeWidth}
          onChange={(e) =>
            setShapeOpts({ strokeWidth: Number(e.target.value) })
          }
          title="Stroke width"
          style={{ width: 64 }}
        />
        <select
          value={edgeOpts.type}
          onChange={(e) => {
            const v = e.target.value;
            if (isEdgeType(v)) setEdgeOpts({ type: v });
          }}
          title="Edge style"
        >
          <option value="straight">Straight</option>
          <option value="step">Step</option>
          <option value="smoothstep">Curved</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={edgeOpts.dashed}
            onChange={(e) => setEdgeOpts({ dashed: e.target.checked })}
          />
          Dashed
        </label>
        <label>
          <input
            type="checkbox"
            checked={edgeOpts.arrow}
            onChange={(e) => setEdgeOpts({ arrow: e.target.checked })}
          />
          Arrow
        </label>
        <input
          type="text"
          placeholder="Edge label"
          value={edgeOpts.label}
          onChange={(e) => setEdgeOpts({ label: e.target.value })}
          style={{ width: 160 }}
        />
        <label>
          <input
            type="checkbox"
            checked={ui.showResizers}
            onChange={(e) => setUI({ showResizers: e.target.checked })}
          />
          Show resize handles
        </label>
        <label title="Allow non-proportional resize for circle/diamond">
          <input
            type="checkbox"
            checked={ui.allowStretch}
            onChange={(e) => setUI({ allowStretch: e.target.checked })}
          />
          Allow stretch
        </label>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(chs) => setNodes((nds) => applyNodeChanges(chs, nds))}
        onEdgesChange={(chs) => setEdges((eds) => applyEdgeChanges(chs, eds))}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{ interactionWidth: 24 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </>
  );
}
export default function Canvas() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <ReactFlowProvider>
        <Board />
      </ReactFlowProvider>
    </div>
  );
}
