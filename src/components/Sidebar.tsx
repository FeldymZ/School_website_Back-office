import { NavLink, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
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
  Grid3x3,
  ChevronDown,
  BookOpen,
  ClipboardList,
} from "lucide-react"

import { ContactService } from "@/services/contactService"
import { getUserFromToken } from "@/utils/auth"
import { UserRole } from "@/types/user"
import { hasRequiredRole } from "@/utils/role"
import DemandeDevisContinuesService from "@/services/DemandeDevisContinuesService"
import { PreinscriptionService } from "@/services/preinscription.service"

/* ================= TYPES ================= */
interface SubItem {
  label: string
  path: string
  badge?: number | null
}

interface MenuItem {
  icon: React.ElementType
  label: string
  path?: string
  badge?: number | null
  children?: SubItem[]
}

/* ================= SUB ITEM ================= */
const SubNavLink = ({ item }: { item: SubItem }) => (
  <NavLink
    to={item.path}
    end
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
        isActive
          ? "bg-[#00A4E0]/10 text-[#00A4E0] font-bold"
          : "text-gray-500 hover:text-[#00A4E0] hover:bg-[#cfe3ff]/20 font-medium"
      }`
    }
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 flex-shrink-0" />
    <span className="flex-1 truncate">{item.label}</span>
    {item.badge != null && item.badge > 0 && (
      <span className="inline-flex items-center justify-center text-[10px] font-black
                       bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] animate-pulse">
        {item.badge}
      </span>
    )}
  </NavLink>
)

/* ================= MENU ITEM ================= */
const MenuItemComp = ({
  item,
  defaultOpen = false,
}: {
  item: MenuItem
  defaultOpen?: boolean
}) => {
  const location = useLocation()
  const hasChildren = !!item.children?.length

  const isChildActive = item.children?.some((c) =>
    location.pathname.startsWith(c.path)
  ) ?? false

  const [open, setOpen] = useState(defaultOpen || isChildActive)

  /* ---- Single link ---- */
  if (!hasChildren && item.path) {
    return (
      <NavLink
        to={item.path}
        end
        className={({ isActive }) =>
          `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive
              ? "bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white shadow-md"
              : "text-gray-600 hover:bg-[#cfe3ff]/30 hover:text-[#00A4E0]"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`flex-shrink-0 transition-transform duration-200
                            ${!isActive ? "group-hover:scale-110" : ""}`}>
              <item.icon size={19} />
            </div>
            <span className="font-semibold flex-1 truncate">{item.label}</span>
            {isActive && (
              <Sparkles size={14} className="ml-auto opacity-70 animate-pulse" />
            )}
            {!isActive && item.badge != null && item.badge > 0 && (
              <span className="inline-flex items-center justify-center text-[10px] font-black
                               bg-red-500 text-white px-1.5 py-0.5 rounded-full
                               min-w-[18px] animate-pulse ml-auto">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    )
  }

  /* ---- Collapsible ---- */
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 ${
                      isChildActive
                        ? "bg-[#00A4E0]/8 text-[#00A4E0]"
                        : "text-gray-600 hover:bg-[#cfe3ff]/30 hover:text-[#00A4E0]"
                    }`}
      >
        <div className={`flex-shrink-0 transition-transform duration-200
                        ${!isChildActive ? "group-hover:scale-110" : ""}`}>
          <item.icon size={19} className={isChildActive ? "text-[#00A4E0]" : ""} />
        </div>
        <span className={`font-semibold flex-1 truncate text-left
                         ${isChildActive ? "text-[#00A4E0]" : ""}`}>
          {item.label}
        </span>
        {!open && item.children?.some(c => (c.badge ?? 0) > 0) && (
          <span className="inline-flex items-center justify-center text-[10px] font-black
                           bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] animate-pulse">
            {item.children.reduce((acc, c) => acc + (c.badge ?? 0), 0)}
          </span>
        )}
        <ChevronDown
          size={15}
          className={`ml-auto flex-shrink-0 transition-transform duration-300 opacity-50
                      ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`overflow-hidden transition-all duration-300
                      ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="ml-4 mt-1 mb-1 pl-3 border-l-2 border-[#00A4E0]/20 space-y-0.5">
          {item.children?.map((child) => (
            <SubNavLink key={child.path} item={child} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================= SECTION ================= */
const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 px-4 mb-2">
      <div className="w-1 h-3.5 bg-gradient-to-b from-[#00A4E0] to-[#0077A8] rounded-full" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {title}
      </p>
    </div>
    {children}
  </div>
)

/* ================= SIDEBAR ================= */
export default function Sidebar() {

  const [unrepliedCount, setUnrepliedCount]       = useState<number | null>(null)
  const [devisCount, setDevisCount]               = useState<number | null>(null)
  const [preinscriptionCount, setPreinscriptionCount] = useState<number | null>(null)

  const user     = getUserFromToken()
  const userRole = user?.role

  const canAccessAdmin      = userRole && hasRequiredRole(userRole, [UserRole.ADMIN])
  const canAccessSuperAdmin = userRole && hasRequiredRole(userRole, [UserRole.SUPERADMIN])

  useEffect(() => {
    if (!canAccessAdmin) return

    const loadData = async () => {

      // Messages non répondus (superadmin uniquement)
      if (canAccessSuperAdmin) {
        try {
          const contacts = await ContactService.getUnreplied()
          setUnrepliedCount(contacts.length)
        } catch {}

        try {
          const count = await DemandeDevisContinuesService.countNonTraitees()
          setDevisCount(count)
        } catch {}
      }

      // Préinscriptions en attente (admin + superadmin)
      try {
        const demandes = await PreinscriptionService.getAll()
        const enAttente = demandes.filter(d => d.statut === "EN_ATTENTE").length
        setPreinscriptionCount(enAttente > 0 ? enAttente : null)
      } catch {}
    }

    loadData()
  }, [canAccessAdmin, canAccessSuperAdmin])

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col shadow-sm">

      {/* ===== LOGO ===== */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8]
                            rounded-xl blur-md opacity-50" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-[#00A4E0] to-[#0077A8]
                            rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-black text-sm bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                           bg-clip-text text-transparent tracking-wide">
              ESIITECH
            </h1>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
              Administration
            </p>
          </div>
        </div>
      </div>

      {/* ===== NAV ===== */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">

        {/* ===== GÉNÉRAL ===== */}
        <Section title="Général">
          <MenuItemComp
            item={{ icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" }}
          />
        </Section>

        {/* ===== FORMATIONS ===== */}
        {canAccessSuperAdmin && (
          <Section title="Formations">
            <MenuItemComp
              item={{
                icon: GraduationCap,
                label: "Formations initiales",
                path: "/formations",
              }}
            />
            <MenuItemComp
              defaultOpen
              item={{
                icon: BookOpen,
                label: "Formations continues",
                children: [
                  { label: "Catégories",      path: "/categories" },
                  { label: "Sous-catégories", path: "/sous-categories" },
                  { label: "Formations",      path: "/formations-continues" },
                  { label: "Devis",           path: "/demandes-devis", badge: devisCount },
                ],
              }}
            />
          </Section>
        )}

        {/* ===== PRÉINSCRIPTIONS ===== */}
        {canAccessSuperAdmin && (
          <Section title="Préinscriptions">
            <MenuItemComp
              item={{
                icon: ClipboardList,
                label: "Préinscriptions",
                children: [
                  {
                    label: "Demandes",
                    path: "/preinscriptions",
                    badge: preinscriptionCount,
                  },
                  {
                    label: "Paramètres",
                    path: "/preinscriptions/configuration",
                  },
                ],
              }}
            />
          </Section>
        )}

        {/* ===== COMMUNICATION ===== */}
        {canAccessAdmin && (
          <Section title="Communication">
            <MenuItemComp
              item={{
                icon: Mail,
                label: "Communication",
                children: [
                  { label: "Actualités", path: "/actualites" },
                  { label: "Pop-up",     path: "/banner-messages" },
                  { label: "Messages",   path: "/messages", badge: unrepliedCount },
                  { label: "Agenda",     path: "/agenda" },
                ],
              }}
            />
          </Section>
        )}

        {/* ===== ÉDITORIAL ===== */}
        {canAccessAdmin && (
          <Section title="Éditorial">
            <MenuItemComp
              item={{
                icon: Newspaper,
                label: "Éditorial",
                children: [
                  ...(canAccessSuperAdmin
                    ? [{ label: "Activités", path: "/activites" }]
                    : []),
                  { label: "Bannières",    path: "/banners" },
                  { label: "Commentaires", path: "/commentaires" },
                  ...(canAccessSuperAdmin
                    ? [{ label: "Statistiques", path: "/statistiques" }]
                    : []),
                  { label: "Partenaires",  path: "/partenaires" },
                ],
              }}
            />
          </Section>
        )}

        {/* ===== ADMINISTRATION ===== */}
        {canAccessSuperAdmin && (
          <Section title="Administration">
            <MenuItemComp
              item={{
                icon: Settings,
                label: "Système",
                children: [
                  { label: "Utilisateurs", path: "/utilisateurs" },
                  { label: "Audits",       path: "/configuration" },
                ],
              }}
            />
          </Section>
        )}

      </nav>
    </aside>
  )
}