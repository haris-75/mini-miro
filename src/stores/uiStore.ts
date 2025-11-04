import { create } from "zustand";
import type { Tool } from "../types/canvas";

interface UIState {
  activeTool: Tool;
  setTool: (t: Tool) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTool: "select",
  setTool: (t) => set({ activeTool: t }),
}));
