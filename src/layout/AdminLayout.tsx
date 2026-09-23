import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const AdminLayout = () => {
  return (
    <div className="h-screen bg-gray-100 overflow-hidden flex">
      {/* Sidebar : gère elle-même sa largeur (w-0 ↔ w-72/w-64 selon sidebarOpen) */}
      <Sidebar />

      {/* Zone principale : flex-1 prend automatiquement tout l'espace restant,
          se redimensionne en temps réel avec l'animation de la sidebar */}
      <div className="flex-1 min-w-0 h-screen flex flex-col">
        {/* Topbar FIXE (dans le flux, sticky au scroll) */}
        <div className="sticky top-0 z-20">
          <Topbar />
        </div>

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;