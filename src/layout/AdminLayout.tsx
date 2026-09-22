import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const AdminLayout = () => {
  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar en position fixed : ne pousse jamais le contenu, elle se superpose */}
      <Sidebar />

      {/* Zone principale :
          - tablette et mobile (< lg) : aucune marge, sidebar totalement cachée par défaut
          - desktop (lg+) : marge = largeur de la sidebar pleinement dépliée (w-52 = 208px) */}
      <div className="ml-0 lg:ml-52 h-screen flex flex-col transition-[margin] duration-300">
        <div className="sticky top-0 z-20">
          <Topbar />
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;