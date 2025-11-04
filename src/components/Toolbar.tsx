import React from "react";

const Toolbar: React.FC<{
  getViewportCenter: () => { x: number; y: number };
}> = ({ getViewportCenter }) => {
  return (
    <div className="toolbar">
      <button className="button">➕ Add Sticky</button>
    </div>
  );
};

export default Toolbar;
