import { Menu, LogOut, UserCircle, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLayout } from "../context/useLayout";
import { logout } from "../utils/auth";

const titles: Record<string, string> = {
  "/": "Tableau de bord",
  "/dashboard": "Tableau de bord",
  "/formations": "Formations",
  "/agenda": "Agenda",
  "/actualites": "Actualités",
  "/messages": "Messages",
  "/banners": "Bannières",
  "/commentaires": "Commentaires",
  "/partenaires": "Partenaires",
  "/statistiques": "Statistiques",
  "/utilisateurs": "Utilisateurs",
  "/configuration": "Configuration",
};

const Topbar = () => {
  const { toggleSidebar } = useLayout();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const title = titles[pathname] ?? "Administration";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="relative h-16 bg-gradient-to-r from-white via-white to-[#cfe3ff]/20 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00A4E0]/5 to-transparent opacity-50" />

      {/* LEFT */}
      <div className="relative z-10 flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-600 hover:text-[#00A4E0] hover:bg-[#cfe3ff]/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-[#00A4E0] to-[#0077A8] rounded-full" />
            <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative z-10 flex items-center gap-3">
        {/* User Profile */}
        <div className="group relative flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#cfe3ff]/30 to-transparent border border-[#cfe3ff] hover:border-[#00A4E0] transition-all duration-200 cursor-pointer">
          <div className="relative">
            <div className="w-9 h-9 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <UserCircle size={20} className="text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-900">Administrateur</p>
            <p className="text-xs text-[#A6A6A6]">En ligne</p>
          </div>

          {/* Dropdown indicator */}
          <div className="hidden md:block text-[#A6A6A6] group-hover:text-[#00A4E0] transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group relative p-3 text-gray-500 hover:text-white rounded-xl border border-gray-200 hover:border-red-500 bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
          title="Se déconnecter"
        >
          <LogOut size={20} className="relative z-10" />

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
              Se déconnecter
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
            </div>
          </div>
        </button>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00A4E0] to-transparent opacity-50" />
    </header>
  );
};

export default Topbar;
