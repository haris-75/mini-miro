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

const nodeTypes = { sticky: StickyNode, shape: ShapeNode };

function Board() {
  const {
    addNode,
    addShape,
    nodes,
    edges,
    setNodes,
    setEdges,
    onConnect,
    edgeOpts,
    setEdgeOpts,
    shapeOpts,
    setShapeOpts,
  } = useRFStore();
  const rf = useReactFlow();

  const centerPos = () =>
    rf.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

  const onAddSticky = () => addNode(centerPos());
  const onAddShape = () => addShape(centerPos());

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

        <select
          value={shapeOpts.kind}
          onChange={(e) => setShapeOpts({ kind: e.target.value as any })}
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
          onChange={(e) => setEdgeOpts({ type: e.target.value as any })}
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
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(chs) => setNodes((nds) => applyNodeChanges(chs, nds))}
        onEdgesChange={(chs) => setEdges((eds) => applyEdgeChanges(chs, eds))}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
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
