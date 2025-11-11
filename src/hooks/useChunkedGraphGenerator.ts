import { useCallback, useRef, useState, startTransition } from "react";
import type { Node, Edge } from "reactflow";
import { useRFStore } from "../stores/canvasStore";

type Progress = { total: number; done: number; running: boolean };

type Options = {
  cols?: number;
  chunkSize?: number;
  onDone?: () => void;
};

export function useChunkedGraphGenerator(opts?: Options) {
  const cols = opts?.cols ?? 100;
  const chunkSize = opts?.chunkSize ?? 300;
  const setNodes = useRFStore((s) => s.setNodes);
  const setEdges = useRFStore((s) => s.setEdges);
  const edgeOpts = useRFStore((s) => s.edgeOpts);

  const [progress, setProgress] = useState<Progress>({
    total: 0,
    done: 0,
    running: false,
  });
  const cancelRef = useRef(false);

  const buildChunk = useCallback(
    (
      startId: number,
      indexOffset: number,
      count: number
    ): { nodes: Node[]; edges: Edge[] } => {
      const outNodes: Node[] = [];
      const outEdges: Edge[] = [];
      const kinds = ["rectangle", "circle", "diamond"] as const;
      const gx = 200,
        gy = 140;

      for (let i = 0; i < count; i++) {
        const globalI = indexOffset + i;
        const id = String(startId + globalI);
        const row = Math.floor(globalI / cols);
        const col = globalI % cols;
        const t =
          globalI % 3 === 0
            ? "shape"
            : globalI % 3 === 1
            ? "sticky"
            : "textNode";

        if (t === "shape") {
          const kind = kinds[Math.floor(globalI / 3) % kinds.length];
          const w = kind === "rectangle" ? 160 : 120;
          const h = kind === "rectangle" ? 120 : 120;
          outNodes.push({
            id,
            type: "shape",
            position: { x: col * gx, y: row * gy },
            data: {
              kind,
              fill: globalI % 2 === 0 ? "#fde68a" : "#bfdbfe",
              stroke: "#1e3a8a",
              strokeWidth: 2,
            },
            style: {
              width: w,
              height: h,
              border: "none",
              padding: 0,
              background: "transparent",
            },
          });
        } else if (t === "sticky") {
          outNodes.push({
            id,
            type: "sticky",
            position: { x: col * gx, y: row * gy },
            data: { text: `Note ${id}` },
            style: { width: 180, height: 120 },
          });
        } else {
          outNodes.push({
            id,
            type: "textNode",
            position: { x: col * gx, y: row * gy },
            data: { text: `Title ${id}` },
            style: {
              width: 220,
              height: 56,
              background: "transparent",
              padding: 0,
            },
          });
        }

        if (globalI > 0) {
          const prev = String(startId + globalI - 1);
          outEdges.push({
            id: `e${prev}-${id}`,
            source: prev,
            target: id,
            type: edgeOpts.type,
          });
        }
      }
      return { nodes: outNodes, edges: outEdges };
    },
    [cols, edgeOpts.type]
  );

  const start = useCallback(
    (total: number) => {
      cancelRef.current = false;
      setProgress({ total, done: 0, running: true });

      const startId = useRFStore.getState().nextId;
      let done = 0;

      const step = () => {
        if (cancelRef.current) {
          setProgress({ total: 0, done: 0, running: false });
          return;
        }
        const size = Math.min(chunkSize, total - done);
        const { nodes: newNodes, edges: newEdges } = buildChunk(
          startId,
          done,
          size
        );

        startTransition(() => {
          setNodes((prev) => prev.concat(newNodes));
          setEdges((prev) => prev.concat(newEdges));
          useRFStore.setState((s) => ({ nextId: s.nextId + size }));
        });

        done += size;
        setProgress({ total, done, running: true });

        if (done < total) {
          requestAnimationFrame(step);
        } else {
          setProgress({ total, done, running: false });
          if (opts?.onDone) opts.onDone();
        }
      };

      requestAnimationFrame(step);
    },
    [buildChunk, chunkSize, opts, setEdges, setNodes]
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return { start, cancel, progress };
}
