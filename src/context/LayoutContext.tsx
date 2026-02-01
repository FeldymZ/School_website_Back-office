import { createContext } from "react";

export interface LayoutContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const LayoutContext =
  createContext<LayoutContextType | null>(null);
