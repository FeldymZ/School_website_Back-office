import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const AdminLayout = () => {
  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar FIXE */}
      <div className="fixed left-0 top-0 h-screen w-64 z-30">
        <Sidebar />
      </div>

      {/* Zone principale (décalée à droite) */}
      <div className="ml-64 h-screen flex flex-col">
        {/* Topbar FIXE */}
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
