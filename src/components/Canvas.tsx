import { useCallback } from "react";
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

const nodeTypes = { sticky: StickyNode };

function Board() {
  const { addNode, nodes, edges, setNodes, setEdges, onConnect } = useRFStore();
  const rf = useReactFlow();

  const onAdd = useCallback(() => {
    const center = rf.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addNode(center);
  }, [rf, addNode]);

  return (
    <>
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10 }}>
        <button onClick={onAdd}>+ Add Sticky</button>
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
