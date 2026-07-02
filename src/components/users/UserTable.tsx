import React, { useState, useMemo } from "react";
import {
  Shield, ShieldCheck, User as UserIcon, Lock, LayoutGrid,
  ChevronDown, Search, Check, Minus,
} from "lucide-react";
import { User, UserRole } from "@/types/user";
import ManageMenuAccessModal from "@/components/ManageMenuAccessModal";
import { useUser } from "@/context/UserContext";
import { getSectionsStatus, getTotalCoverage } from "@/utils/menuAccessLabels";

interface Props {
  users: User[];
  onToggleStatus: (user: User) => void;
  onChangePassword: (user: User) => void;
  onMenuAccessUpdated?: () => void;
}

type RoleFilter = "ALL" | UserRole.ADMIN | UserRole.SUPERADMIN;

/* ================= INITIALS AVATAR ================= */
const Avatar = ({ email, role }: { email: string; role: UserRole }) => {
  const initials = email.slice(0, 2).toUpperCase();
  const isSuper = role === UserRole.SUPERADMIN;
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        isSuper ? "bg-indigo-50 text-indigo-600" : "bg-sky-50 text-sky-600"
      }`}
    >
      {initials}
    </div>
  );
};

/* ================= STATUS SWITCH ================= */
const StatusSwitch = ({ enabled, onClick }: { enabled: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    role="switch"
    aria-checked={enabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00A4E0] ${
      enabled ? "bg-emerald-500" : "bg-gray-200"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

/* ================= COVERAGE BAR (row summary) ================= */
const CoverageBar = ({ menuAccess }: { menuAccess: string[] }) => {
  const { granted, total } = getTotalCoverage(menuAccess);
  const pct = total > 0 ? Math.round((granted / total) * 100) : 0;

  if (granted === 0) {
    return <span className="text-xs text-gray-400">Aucun accès</span>;
  }

  return (
    <div className="flex items-center gap-2 w-40">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#00A4E0]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500 tabular-nums whitespace-nowrap">
        {granted}/{total}
      </span>
    </div>
  );
};

/* ================= PERMISSIONS MATRIX (expanded row) ================= */
const PermissionsMatrix = ({ menuAccess }: { menuAccess: string[] }) => {
  const sections = getSectionsStatus(menuAccess);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((s) => (
        <div key={s.section} className="bg-white border border-gray-150 rounded-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/60 rounded-t-lg">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              {s.section}
            </span>
            <span className="text-[11px] font-medium text-gray-400 tabular-nums">
              {s.grantedCount}/{s.total}
            </span>
          </div>
          <ul className="p-2 space-y-0.5">
            {s.items.map((item) => (
              <li
                key={item.key}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                  item.granted ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {item.granted ? (
                  <Check size={13} className="text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                ) : (
                  <Minus size={13} className="text-gray-300 flex-shrink-0" />
                )}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

/* ================= MAIN TABLE ================= */
const UserTable: React.FC<Props> = ({ users, onToggleStatus, onChangePassword, onMenuAccessUpdated }) => {
  const [menuTarget, setMenuTarget] = useState<User | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const { user: currentUser } = useUser();
  const isSuperAdmin = currentUser?.role === UserRole.SUPERADMIN;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const counts = useMemo(
    () => ({
      all: users.length,
      admin: users.filter((u) => u.role === UserRole.ADMIN).length,
      superadmin: users.filter((u) => u.role === UserRole.SUPERADMIN).length,
    }),
    [users]
  );

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-gray-300" />
        </div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">Aucun utilisateur</h3>
        <p className="text-sm text-gray-400">Créez le premier compte administrateur pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-gray-100 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
          {([
            { key: "ALL", label: "Tous", count: counts.all },
            { key: UserRole.ADMIN, label: "Admin", count: counts.admin },
            { key: UserRole.SUPERADMIN, label: "Superadmin", count: counts.superadmin },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                roleFilter === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label} <span className="tabular-nums text-gray-400">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par email"
            className="pl-8 pr-3 py-1.5 w-56 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-1 focus:ring-[#00A4E0] focus:border-[#00A4E0]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Utilisateur</th>
              <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Rôle</th>
              <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Actif</th>
              <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Accès menus</th>
              <th className="text-right font-medium text-gray-400 text-xs uppercase tracking-wide px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => {
              const isAdmin = user.role === UserRole.ADMIN;
              const isExpanded = expandedId === user.id;

              return (
                <React.Fragment key={user.id}>
                  <tr
                    className={`transition-colors ${isAdmin ? "cursor-pointer hover:bg-gray-50/70" : "hover:bg-gray-50/40"}`}
                    onClick={() => isAdmin && setExpandedId(isExpanded ? null : user.id)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar email={user.email} role={user.role} />
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-medium text-gray-900 truncate">{user.email}</span>
                          {isAdmin && (
                            <ChevronDown
                              size={14}
                              className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          user.role === UserRole.SUPERADMIN
                            ? "bg-indigo-50 text-indigo-600"
                            : "bg-sky-50 text-sky-600"
                        }`}
                      >
                        <Shield size={12} />
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <StatusSwitch enabled={user.enabled} onClick={() => onToggleStatus(user)} />
                    </td>

                    <td className="px-5 py-3.5">
                      {user.role === UserRole.SUPERADMIN ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600">
                          <ShieldCheck size={13} />
                          Accès complet
                        </span>
                      ) : (
                        <CoverageBar menuAccess={user.menuAccess ?? []} />
                      )}
                    </td>

                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onChangePassword(user)}
                          title="Changer le mot de passe"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#00A4E0] hover:bg-[#00A4E0]/8 transition-colors"
                        >
                          <Lock size={15} />
                        </button>

                        {isAdmin && isSuperAdmin && (
                          <button
                            onClick={() => setMenuTarget(user)}
                            title="Gérer les menus"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#00A4E0] hover:bg-[#00A4E0]/8 transition-colors"
                          >
                            <LayoutGrid size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {isAdmin && isExpanded && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={5} className="px-5 py-4">
                        <PermissionsMatrix menuAccess={user.menuAccess ?? []} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="py-14 text-center text-sm text-gray-400">
            Aucun résultat pour « {search} »
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-gray-100 text-xs text-gray-400">
        {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} affiché{filteredUsers.length > 1 ? "s" : ""}
      </div>

      {menuTarget && (
        <ManageMenuAccessModal
          user={menuTarget}
          onClose={() => setMenuTarget(null)}
          onSaved={() => {
            setMenuTarget(null);
            onMenuAccessUpdated?.();
          }}
        />
      )}
    </div>
  );
};

export default UserTable;