import { useState, ReactNode } from "react";
import { LayoutContext } from "./LayoutContext";

export const LayoutProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <LayoutContext.Provider
      value={{ sidebarOpen, toggleSidebar, closeSidebar }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
