import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type Node,
  type EdgeChange,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { useRFStore } from "../stores/canvasStore";
import StickyNode from "./StickyNode";
import ShapeNode from "./ShapeNode";
import TextNode from "./TextNode";
import GroupNode from "./GroupNode";
import { useCallback, useEffect } from "react";
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
    // addGroup,
    // groupSelectionIntoFrame,
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
    generateLargeGraph,
    resetCanvas,
  } = useRFStore();
  const rf = useReactFlow();
  const onFit = useCallback(
    () => rf.fitView({ padding: 0.15, duration: 300 }),
    [rf]
  );

  const centerPos = useCallback(() => {
    return rf.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
  }, [rf]);

  const handleAddSticky = useCallback(
    () => addNode(centerPos()),
    [addNode, centerPos]
  );
  const handleAddShape = useCallback(
    () => addShape(centerPos()),
    [addShape, centerPos]
  );
  const handleAddText = useCallback(
    () => addText(centerPos()),
    [addText, centerPos]
  );
  // const handleAddGroup = useCallback(
  //   () => addGroup(centerPos()),
  //   [addGroup, centerPos]
  // );

  const handleShapeKindChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      if (isShapeKind(v)) setShapeOpts({ kind: v });
    },
    [setShapeOpts]
  );

  const handleShapeFillChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setShapeOpts({ fill: e.target.value }),
    [setShapeOpts]
  );

  const handleShapeStrokeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setShapeOpts({ stroke: e.target.value }),
    [setShapeOpts]
  );

  const handleShapeStrokeWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setShapeOpts({ strokeWidth: Number(e.target.value) }),
    [setShapeOpts]
  );

  const handleEdgeTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      if (isEdgeType(v)) setEdgeOpts({ type: v });
    },
    [setEdgeOpts]
  );

  const handleEdgeDashedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setEdgeOpts({ dashed: e.target.checked }),
    [setEdgeOpts]
  );

  const handleEdgeArrowChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setEdgeOpts({ arrow: e.target.checked }),
    [setEdgeOpts]
  );

  const handleEdgeLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setEdgeOpts({ label: e.target.value }),
    [setEdgeOpts]
  );

  const handleShowResizersChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setUI({ showResizers: e.target.checked }),
    [setUI]
  );

  const handleAllowStretchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setUI({ allowStretch: e.target.checked }),
    [setUI]
  );

  const handleDeleteSelected = useCallback(
    () => deleteSelected(),
    [deleteSelected]
  );
  // const handleGroupSelection = useCallback(
  //   () => groupSelectionIntoFrame(),
  //   [groupSelectionIntoFrame]
  // );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds: Node[]) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds: Edge[]) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onResetCanvas = useCallback(() => {
    resetCanvas();
    requestAnimationFrame(() => rf.setViewport({ x: 0, y: 0, zoom: 1 }));
  }, [resetCanvas, rf]);

  const onAddTenK = useCallback(() => {
    onResetCanvas();
    generateLargeGraph(10000);
    requestAnimationFrame(() => rf.fitView({ padding: 0.1 }));
  }, [generateLargeGraph, onResetCanvas, rf]);

  const onAddFiveK = useCallback(() => {
    onResetCanvas();
    generateLargeGraph(5000);
    requestAnimationFrame(() => rf.fitView({ padding: 0.1 }));
  }, [generateLargeGraph, onResetCanvas, rf]);

  const onAddOneK = useCallback(() => {
    onResetCanvas();
    generateLargeGraph(1000);
    requestAnimationFrame(() => rf.fitView({ padding: 0.1 }));
  }, [generateLargeGraph, onResetCanvas, rf]);

  const onAddFiveHundred = useCallback(() => {
    onResetCanvas();
    generateLargeGraph(500);
    requestAnimationFrame(() => rf.fitView({ padding: 0.1 }));
  }, [generateLargeGraph, onResetCanvas, rf]);

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
        return;
      }
      if (
        e.key.toLowerCase() === "f" ||
        ((e.metaKey || e.ctrlKey) && e.key === "0")
      ) {
        e.preventDefault();
        onFit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected, onFit]);

  return (
    <>
      <div className="absolute top-3 left-3 z-10 bg-[#12161f] backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-3">
        <div className="flex flex-wrap gap-2">
          {/* Action Buttons */}
          <div className="flex gap-2 pb-2 border-b border-gray-700 w-full">
            <button
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
              onClick={onAddTenK}
            >
              + 10k graph
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
              onClick={onAddFiveK}
            >
              + 5k graph
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
              onClick={onAddOneK}
            >
              + 1k graph
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
              onClick={onAddFiveHundred}
            >
              + 500 graph
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-800 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
              onClick={onFit}
            >
              Fit View
            </button>
            <button
              onClick={handleAddSticky}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
            >
              + Sticky
            </button>
            <button
              onClick={handleAddShape}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
            >
              + Shape
            </button>
            <button
              onClick={handleAddText}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
            >
              + Text
            </button>
            {/* <button
              onClick={handleAddGroup}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
            >
              + Group
            </button> */}
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
            >
              🗑 Delete
            </button>
            {/* <button
              onClick={handleGroupSelection}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Group Selection
            </button> */}
            <button
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-lg font-medium hover:shadow-md transition-all hover:scale-105 active:scale-95"
              onClick={onResetCanvas}
            >
              + Reset Canvas
            </button>
          </div>

          {/* Shape Controls */}
          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Shape:
            </span>
            <select
              value={shapeOpts.kind}
              onChange={handleShapeKindChange}
              title="Shape"
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm font-medium text-gray-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
              <option value="diamond">Diamond</option>
            </select>

            <input
              type="color"
              value={shapeOpts.fill}
              onChange={handleShapeFillChange}
              title="Fill"
              className="w-10 h-10 rounded-lg border-2 border-gray-600 cursor-pointer hover:border-blue-500 transition-all"
            />
            <input
              type="color"
              value={shapeOpts.stroke}
              onChange={handleShapeStrokeChange}
              title="Stroke"
              className="w-10 h-10 rounded-lg border-2 border-gray-600 cursor-pointer hover:border-blue-500 transition-all"
            />
            <input
              type="number"
              min={1}
              max={8}
              value={shapeOpts.strokeWidth}
              onChange={handleShapeStrokeWidthChange}
              title="Stroke width"
              className="w-16 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm font-medium text-gray-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Edge Controls */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Edge:
            </span>
            <select
              value={edgeOpts.type}
              onChange={handleEdgeTypeChange}
              title="Edge style"
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm font-medium text-gray-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="straight">Straight</option>
              <option value="step">Step</option>
              <option value="smoothstep">Curved</option>
            </select>

            <label className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={edgeOpts.dashed}
                onChange={handleEdgeDashedChange}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-200">Dashed</span>
            </label>

            <label className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={edgeOpts.arrow}
                onChange={handleEdgeArrowChange}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-200">Arrow</span>
            </label>

            <input
              type="text"
              placeholder="Edge label"
              value={edgeOpts.label}
              onChange={handleEdgeLabelChange}
              className="w-40 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-200 placeholder-gray-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* UI Options */}
          <div className="flex gap-2 items-center pt-2 border-t border-gray-700 w-full">
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={ui.showResizers}
                onChange={handleShowResizersChange}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-200">
                Show resize handles
              </span>
            </label>

            <label
              title="Allow non-proportional resize for circle/diamond"
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all cursor-pointer"
            >
              <input
                type="checkbox"
                checked={ui.allowStretch}
                onChange={handleAllowStretchChange}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-200">
                Allow stretch
              </span>
            </label>
          </div>
        </div>
      </div>

      <ReactFlow
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll
        onlyRenderVisibleElements
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
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
