import { NavLink, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { ChevronDown, GraduationCap, Sparkles } from "lucide-react"

import { ContactService } from "@/services/contactService"
import { useUser } from "@/context/UserContext"
import { UserRole } from "@/types/user"
import { hasRequiredRole } from "@/utils/role"
import DemandeDevisContinuesService from "@/services/DemandeDevisContinuesService"
import { PreinscriptionService } from "@/services/preinscription.service"
import { SIDEBAR_CONFIG, SidebarChild, SidebarItem } from "@/config/sidebarConfig"

const SubNavLink = ({ item, badge }: { item: SidebarChild; badge?: number | null }) => (
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
    {badge != null && badge > 0 && (
      <span className="inline-flex items-center justify-center text-[10px] font-black
                       bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] animate-pulse">
        {badge}
      </span>
    )}
  </NavLink>
)

const MenuItemComp = ({
  item,
  children,
  getBadge,
}: {
  item: SidebarItem
  children: SidebarChild[]
  getBadge: (key?: SidebarChild["badgeKey"]) => number | null
}) => {
  const location = useLocation()
  const hasChildren = children.length > 0
  const isChildActive = children.some((c) => location.pathname.startsWith(c.path))
  const [open, setOpen] = useState(item.defaultOpen || isChildActive)

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
            <div className={`flex-shrink-0 transition-transform duration-200 ${!isActive ? "group-hover:scale-110" : ""}`}>
              <item.icon size={19} />
            </div>
            <span className="font-semibold flex-1 truncate">{item.label}</span>
            {isActive && <Sparkles size={14} className="ml-auto opacity-70 animate-pulse" />}
          </>
        )}
      </NavLink>
    )
  }

  const totalBadge = children.reduce((acc, c) => acc + (getBadge(c.badgeKey) ?? 0), 0)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isChildActive ? "bg-[#00A4E0]/8 text-[#00A4E0]" : "text-gray-600 hover:bg-[#cfe3ff]/30 hover:text-[#00A4E0]"
        }`}
      >
        <div className={`flex-shrink-0 transition-transform duration-200 ${!isChildActive ? "group-hover:scale-110" : ""}`}>
          <item.icon size={19} className={isChildActive ? "text-[#00A4E0]" : ""} />
        </div>
        <span className={`font-semibold flex-1 truncate text-left ${isChildActive ? "text-[#00A4E0]" : ""}`}>
          {item.label}
        </span>
        {!open && totalBadge > 0 && (
          <span className="inline-flex items-center justify-center text-[10px] font-black
                           bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] animate-pulse">
            {totalBadge}
          </span>
        )}
        <ChevronDown size={15} className={`ml-auto flex-shrink-0 transition-transform duration-300 opacity-50 ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="ml-4 mt-1 mb-1 pl-3 border-l-2 border-[#00A4E0]/20 space-y-0.5">
          {children.map((child) => (
            <SubNavLink key={child.path} item={child} badge={getBadge(child.badgeKey)} />
          ))}
        </div>
      </div>
    </div>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 px-4 mb-2">
      <div className="w-1 h-3.5 bg-gradient-to-b from-[#00A4E0] to-[#0077A8] rounded-full" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
    </div>
    {children}
  </div>
)

export default function Sidebar() {
  const [unrepliedCount, setUnrepliedCount] = useState<number | null>(null)
  const [devisCount, setDevisCount] = useState<number | null>(null)
  const [preinscriptionCount, setPreinscriptionCount] = useState<number | null>(null)

  const { user, loading } = useUser()
  const userRole = user?.role
  const menuAccess = user?.menuAccess ?? []

  const canAccessSuperAdmin = userRole && hasRequiredRole(userRole, [UserRole.SUPERADMIN])
  const canAccessAdmin = userRole && hasRequiredRole(userRole, [UserRole.ADMIN])

  useEffect(() => {
    if (!canAccessAdmin) return
    const loadData = async () => {
      if (canAccessSuperAdmin) {
        try { setUnrepliedCount((await ContactService.getUnreplied()).length) } catch {}
        try { setDevisCount(await DemandeDevisContinuesService.countNonTraitees()) } catch {}
      }
      try {
        const demandes = await PreinscriptionService.getAll()
        const enAttente = demandes.filter((d) => d.statut === "EN_ATTENTE").length
        setPreinscriptionCount(enAttente > 0 ? enAttente : null)
      } catch {}
    }
    loadData()
  }, [canAccessAdmin, canAccessSuperAdmin])

  const getBadge = (key?: SidebarChild["badgeKey"]): number | null => {
    if (key === "unreplied") return unrepliedCount
    if (key === "devis") return devisCount
    if (key === "preinscription") return preinscriptionCount
    return null
  }

  const isChildVisible = (child: SidebarChild) => {
    if (canAccessSuperAdmin) return true
    if (!child.permissionKey) return true
    return menuAccess.includes(child.permissionKey)
  }

  const isItemVisible = (item: SidebarItem) => {
    if (canAccessSuperAdmin) return true
    if (item.children) return item.children.some(isChildVisible)
    if (!item.permissionKey) return true
    return menuAccess.includes(item.permissionKey)
  }

  const sections = SIDEBAR_CONFIG.reduce<Record<string, SidebarItem[]>>((acc, item) => {
    if (!isItemVisible(item)) return acc
    acc[item.section] = [...(acc[item.section] ?? []), item]
    return acc
  }, {})

  if (loading) return null
  if (!canAccessAdmin) return null

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col shadow-sm">
      <div className="h-16 flex items-center px-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-md opacity-50" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-black text-sm bg-gradient-to-r from-[#00A4E0] to-[#0077A8] bg-clip-text text-transparent tracking-wide">
              ESIITECH
            </h1>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Administration</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {Object.entries(sections).map(([sectionTitle, items]) => (
          <Section key={sectionTitle} title={sectionTitle}>
            {items.map((item) => (
              <MenuItemComp
                key={item.label}
                item={item}
                children={(item.children ?? []).filter(isChildVisible)}
                getBadge={getBadge}
              />
            ))}
          </Section>
        ))}
      </nav>
    </aside>
  )
}