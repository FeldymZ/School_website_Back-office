import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Calendar,
  Newspaper,
  Image,
  MessageSquare,
  Users,
  Mail,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";

import { ContactService } from "@/services/contactService";
import { getUserFromToken } from "@/utils/auth";

/* ================= STYLES ================= */

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white shadow-lg"
      : "text-gray-600 hover:bg-[#cfe3ff]/30 hover:text-[#00A4E0]"
  }`;

/* ================= COMPONENT ================= */

const Sidebar = () => {
  const [unrepliedCount, setUnrepliedCount] = useState<number | null>(null);

  const user = getUserFromToken();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  /* ================= INIT UNREPLIED COUNT ================= */

  useEffect(() => {
    if (!user || !["ADMIN", "SUPERADMIN"].includes(user.role)) {
      return;
    }

    const loadUnreplied = async () => {
      try {
        const data = await ContactService.getUnreplied();
        setUnrepliedCount(data.length);
      } catch {
        // ignore
      }
    };

    loadUnreplied();
  }, [user]);

  return (
    <aside className="w-64 bg-gradient-to-b from-white to-[#cfe3ff]/10 border-r border-gray-200 h-screen flex flex-col shadow-sm">
      {/* ================= LOGO ================= */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base bg-gradient-to-r from-[#00A4E0] to-[#0077A8] bg-clip-text text-transparent">
              ESIITECH
            </h1>
            <p className="text-[10px] text-[#A6A6A6] font-medium">
              Administration
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8">

        {/* ================= GÉNÉRAL ================= */}
        <Section title="Général">
          <NavLink to="/dashboard" end className={linkClass}>
            {({ isActive }) => (
              <>
                <IconWrap isActive={isActive}>
                  <LayoutDashboard size={20} />
                </IconWrap>
                <span className="font-medium">Dashboard</span>
                {isActive && (
                  <Sparkles size={16} className="ml-auto animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        </Section>

        {/* ================= ACADÉMIQUE ================= */}
        <Section title="Académique">
          <NavLink to="/formations" end className={linkClass}>
            {({ isActive }) => (
              <>
                <IconWrap isActive={isActive}>
                  <GraduationCap size={20} />
                </IconWrap>
                <span className="font-medium">Formations</span>
              </>
            )}
          </NavLink>

          <NavLink to="/agenda" end className={linkClass}>
            {({ isActive }) => (
              <>
                <IconWrap isActive={isActive}>
                  <Calendar size={20} />
                </IconWrap>
                <span className="font-medium">Agenda</span>
              </>
            )}
          </NavLink>
        </Section>

        {/* ================= CONTENU ================= */}
        <Section title="Contenu">
          <NavLink to="/actualites" end className={linkClass}>
            {({ isActive }) => (
              <>
                <IconWrap isActive={isActive}>
                  <Newspaper size={20} />
                </IconWrap>
                <span className="font-medium">Actualités</span>
              </>
            )}
          </NavLink>

          <NavLink to="/banners" end className={linkClass}>
            {({ isActive }) => (
              <>
                <IconWrap isActive={isActive}>
                  <Image size={20} />
                </IconWrap>
                <span className="font-medium">Bannières</span>
              </>
            )}
          </NavLink>

          <NavLink to="/commentaires" end className={linkClass}>
            {({ isActive }) => (
              <>
                <IconWrap isActive={isActive}>
                  <MessageSquare size={20} />
                </IconWrap>
                <span className="font-medium">Commentaires</span>
              </>
            )}
          </NavLink>
        </Section>

        {/* ================= COMMUNICATION ================= */}
        <Section title="Communication">
          <NavLink to="/partenaires" end className={linkClass}>
            {({ isActive }) => (
              <>
                <IconWrap isActive={isActive}>
                  <Users size={20} />
                </IconWrap>
                <span className="font-medium">Partenaires</span>
              </>
            )}
          </NavLink>

          <NavLink to="/messages" end className={linkClass}>
            {({ isActive }) => (
              <>
                <IconWrap isActive={isActive}>
                  <Mail size={20} />
                </IconWrap>
                <span className="font-medium">Messages</span>

                {unrepliedCount !== null && unrepliedCount > 0 && (
                  <span className="ml-auto text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {unrepliedCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        </Section>

        {/* ================= STATISTIQUES ================= */}
        <Section title="Statistiques">
          <NavLink to="/statistiques" end className={linkClass}>
            {({ isActive }) => (
              <>
                <IconWrap isActive={isActive}>
                  <BarChart3 size={20} />
                </IconWrap>
                <span className="font-medium">Chiffres clés</span>
              </>
            )}
          </NavLink>
        </Section>

        {/* ================= ADMINISTRATION (SUPERADMIN ONLY) ================= */}
        {isSuperAdmin && (
          <Section title="Administration">
            <NavLink to="/utilisateurs" end className={linkClass}>
              {({ isActive }) => (
                <>
                  <IconWrap isActive={isActive}>
                    <Users size={20} />
                  </IconWrap>
                  <span className="font-medium">Utilisateurs</span>
                </>
              )}
            </NavLink>

            <NavLink to="/configuration" end className={linkClass}>
              {({ isActive }) => (
                <>
                  <IconWrap isActive={isActive}>
                    <Settings size={20} />
                  </IconWrap>
                  <span className="font-medium">Audits</span>
                </>
              )}
            </NavLink>
          </Section>
        )}
      </nav>
    </aside>
  );
};

/* ================= HELPERS ================= */

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 px-4 mb-3">
      <div className="w-1 h-4 bg-gradient-to-b from-[#00A4E0] to-[#0077A8] rounded-full" />
      <p className="text-xs font-bold text-[#A6A6A6] uppercase tracking-wider">
        {title}
      </p>
    </div>
    {children}
  </div>
);

const IconWrap = ({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={`transition-transform duration-200 ${
      isActive ? "" : "group-hover:scale-110"
    }`}
  >
    {children}
  </div>
);

export default Sidebar;
