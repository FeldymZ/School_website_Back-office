import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const AdminLayout = () => {
  return (
    <div className="h-screen bg-gray-100 overflow-hidden flex">
      {/* Sidebar (fixed) :
          - mobile : cachée, s'ouvre en overlay via le hamburger
          - desktop (lg+) : toujours dépliée, 18rem (w-72) */}
      <Sidebar />

      {/* Zone principale :
          lg:pl-72 réserve la place de la sidebar fixe sur desktop,
          pour qu'elle ne passe pas par-dessus le contenu */}
      <div className="flex-1 min-w-0 h-screen flex flex-col lg:pl-72">
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