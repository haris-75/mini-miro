import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "reactflow";

type Data = {
  dashed?: boolean;
  label?: string;
};

const StraightEdge: React.FC<EdgeProps<Data>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style,
  data,
}) => {
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd ?? "url(#mm-arrow)"}
        style={{
          strokeWidth: 2,
          ...style,
          ...(data?.dashed ? { strokeDasharray: "6 6" } : null),
        }}
      />
      {data?.label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${
                (sourceX + targetX) / 2
              }px, ${(sourceY + targetY) / 2}px)`,
              background: "#0f172a",
              color: "#e5e7eb",
              border: "1px solid #334155",
              padding: "2px 6px",
              borderRadius: 6,
              fontSize: 12,
              pointerEvents: "all",
              userSelect: "none",
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
};

export default StraightEdge;
