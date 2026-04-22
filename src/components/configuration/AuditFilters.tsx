import { useState, useRef, useEffect } from "react";
import {
  Filter, Calendar, RotateCcw, Search, Sparkles,
  Shield, Zap, SlidersHorizontal, X,
  CheckCircle2, XCircle, ChevronDown, Users
} from "lucide-react";
import type { User } from "@/types/user";

interface Props {
  users: User[];
  loadingUsers: boolean;
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  onClearUser: () => void;
  dateStart: string;
  dateEnd: string;
  onDateStartChange: (v: string) => void;
  onDateEndChange: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
  loading: boolean;
  hasSearched: boolean;
}

const AVATAR_COLORS = [
  "from-[#00A4E0] to-[#0077A8]",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-amber-700",
  "from-rose-500 to-pink-700",
  "from-indigo-500 to-blue-700",
];

const getColor = (email: string) =>
  AVATAR_COLORS[email.charCodeAt(0) % AVATAR_COLORS.length];

const fmt = (d: Date) => d.toISOString().split("T")[0];

const AuditFilters = ({
  users, loadingUsers, selectedUser, onSelectUser, onClearUser,
  dateStart, dateEnd, onDateStartChange, onDateEndChange,
  onSearch, onReset, loading, hasSearched,
}: Props) => {
  const [search, setSearch]       = useState("");
  const [open, setOpen]           = useState(false);
  const [showDates, setShowDates] = useState(false);
  const dropdownRef               = useRef<HTMLDivElement>(null);

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSelect = (user: User) => {
    onSelectUser(user);
    setSearch("");
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClearUser();
    setSearch("");
  };

  const hasDates = dateStart || dateEnd;

  const applyQuickRange = (days: number) => {
    const end   = new Date();
    const start = new Date();
    if (days === 0) {
      onDateStartChange(fmt(start));
      onDateEndChange(fmt(end));
    } else {
      start.setDate(start.getDate() - days);
      onDateStartChange(fmt(start));
      onDateEndChange(fmt(end));
    }
  };

  return (
    <div
      className="relative overflow-hidden bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/60"
      style={{ boxShadow: "0 8px 48px rgba(0,164,224,0.10), 0 1px 0 rgba(255,255,255,0.8) inset" }}
    >
      {/* Orbes décoratifs */}
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-gradient-to-br from-[#00A4E0]/12 to-[#cfe3ff]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-gradient-to-tr from-[#cfe3ff]/18 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-40" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-xl">
              <Filter className="text-white" size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Consulter les actions des utilisateur de la plateforme
              <Sparkles size={15} className="text-[#00A4E0] animate-pulse" />
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Choisissez un utilisateur</p>
          </div>
        </div>

        {/* ── Sélecteur utilisateur (dropdown) ── */}
        <div className="space-y-2" ref={dropdownRef}>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <Users size={12} className="text-[#00A4E0]" />
           
Utilisateur          </label>

          {/* ── Trigger ── */}
          {selectedUser ? (
            /* Utilisateur sélectionné → carte compacte */
            <div
              className="relative overflow-hidden flex items-center gap-3 p-3.5 rounded-2xl border-2 border-[#00A4E0]/35 cursor-pointer"
              style={{ background: "linear-gradient(to right, rgba(0,164,224,0.05), rgba(207,227,255,0.25), white)", boxShadow: "0 0 0 4px rgba(0,164,224,0.06)" }}
              onClick={() => setOpen(v => !v)}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColor(selectedUser.email)} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                {selectedUser.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0077A8] truncate">{selectedUser.email}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedUser.role === "SUPERADMIN"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-[#cfe3ff]/60 text-[#0077A8] border-[#00A4E0]/20"
                  }`}>
                    <Shield size={8} />
                    {selectedUser.role}
                  </span>
                  {!selectedUser.enabled && (
                    <span className="text-[10px] font-semibold text-red-400">· Désactivé</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <CheckCircle2 size={16} className="text-[#00A4E0]" />
                <button
                  onClick={handleClear}
                  className="w-7 h-7 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ) : (
            /* Pas de sélection → bouton d'ouverture */
            <button
              onClick={() => setOpen(v => !v)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all duration-200 ${
                open
                  ? "border-[#00A4E0]/40 bg-white shadow-lg"
                  : "border-gray-200 bg-gray-50/70 hover:border-gray-300 hover:bg-white hover:shadow-sm"
              }`}
              style={open ? { boxShadow: "0 0 0 4px rgba(0,164,224,0.08)" } : {}}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                <Users size={16} className="text-gray-400" />
              </div>
              <span className={`flex-1 text-sm font-medium ${open ? "text-gray-700" : "text-gray-400"}`}>
                {loadingUsers ? "Chargement…" : "Sélectionner un administrateur"}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </button>
          )}

          {/* ── Panneau dropdown ── */}
          {open && (
            <div
              className="relative rounded-2xl border border-gray-200/80 bg-white overflow-hidden"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.8) inset" }}
            >
              {/* Barre de recherche dans le panneau */}
              <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rechercher par email…"
                    value={search}
                    autoFocus
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-gray-200 text-sm
                               text-gray-700 placeholder:text-gray-400
                               focus:outline-none focus:border-[#00A4E0]/50 focus:shadow-sm transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={13} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 px-1 font-medium">
                  {filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}
                </p>
              </div>

              {/* Liste des utilisateurs — scrollable, spacieuse */}
              <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
                {filtered.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm font-semibold text-gray-400">Aucun résultat</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filtered.map(user => {
                      const isSelected = selectedUser?.id === user.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => handleSelect(user)}
                          className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-left transition-all group ${
                            isSelected
                              ? "bg-gradient-to-r from-[#cfe3ff]/40 to-white border border-[#00A4E0]/20"
                              : "hover:bg-gray-50 border border-transparent"
                          }`}
                        >
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColor(user.email)} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                            {user.email.charAt(0).toUpperCase()}
                          </div>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isSelected ? "text-[#0077A8]" : "text-gray-800"}`}>
                              {user.email}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Shield size={9} className={user.role === "SUPERADMIN" ? "text-purple-500" : "text-[#00A4E0]"} />
                              <span className={`text-[10px] font-bold ${user.role === "SUPERADMIN" ? "text-purple-600" : "text-[#00A4E0]"}`}>
                                {user.role}
                              </span>
                              {!user.enabled && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-red-400 font-semibold">
                                  <XCircle size={9} />
                                  Désactivé
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Indicateur */}
                          <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? "border-[#00A4E0] bg-[#00A4E0]" : "border-gray-200 group-hover:border-[#00A4E0]/40"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Période ── */}
        <div className="space-y-3">
          <button
            onClick={() => setShowDates(v => !v)}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-[#00A4E0] transition-colors group w-full"
          >
            <SlidersHorizontal size={12} className="group-hover:text-[#00A4E0] transition-colors" />
            Filtrer par période
            <ChevronDown size={12} className={`ml-auto transition-transform duration-300 ${showDates ? "rotate-180" : ""}`} />
            {hasDates && <span className="w-2 h-2 rounded-full bg-[#00A4E0] animate-pulse" />}
          </button>

          {showDates && (
            <div className="rounded-2xl border-2 border-gray-100 bg-gray-50/60 p-4 space-y-3">

              {/* Raccourcis rapides */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Rapide :</span>
                {[
                  { label: "Auj.",    days: 0  },
                  { label: "7 j.",    days: 7  },
                  { label: "30 j.",   days: 30 },
                  { label: "90 j.",   days: 90 },
                ].map(({ label, days }) => (
                  <button
                    key={label}
                    onClick={() => applyQuickRange(days)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-gray-200
                               text-gray-600 hover:border-[#00A4E0]/40 hover:text-[#00A4E0] hover:bg-[#cfe3ff]/20
                               transition-all shadow-sm"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Champs dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <div className="w-4 h-4 rounded-md bg-[#00A4E0]/10 flex items-center justify-center">
                      <Calendar size={9} className="text-[#00A4E0]" />
                    </div>
                    Début
                  </label>
                  <div className={`rounded-xl border-2 bg-white transition-all ${dateStart ? "border-[#00A4E0]/40 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="date"
                      value={dateStart}
                      onChange={e => onDateStartChange(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm text-gray-700 bg-transparent focus:outline-none rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <div className="w-4 h-4 rounded-md bg-[#00A4E0]/10 flex items-center justify-center">
                      <Calendar size={9} className="text-[#00A4E0]" />
                    </div>
                    Fin
                  </label>
                  <div className={`rounded-xl border-2 bg-white transition-all ${dateEnd ? "border-[#00A4E0]/40 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="date"
                      value={dateEnd}
                      onChange={e => onDateEndChange(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm text-gray-700 bg-transparent focus:outline-none rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Aperçu période */}
              {hasDates && (
                <div className="flex items-center justify-between bg-[#cfe3ff]/30 border border-[#00A4E0]/15 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0077A8]">
                    <Calendar size={12} className="text-[#00A4E0]" />
                    {dateStart
                      ? new Date(dateStart + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                      : "…"}
                    <span className="text-gray-400 font-normal">→</span>
                    {dateEnd
                      ? new Date(dateEnd + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                      : "…"}
                  </div>
                  <button
                    onClick={() => { onDateStartChange(""); onDateEndChange(""); }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onSearch}
            disabled={!selectedUser || loading}
            className="relative flex-1 py-3.5 rounded-2xl font-bold text-sm text-white overflow-hidden
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={selectedUser
              ? { background: "linear-gradient(135deg, #00A4E0 0%, #0077A8 100%)", boxShadow: "0 8px 24px rgba(0,164,224,0.35)" }
              : { background: "#e5e7eb" }
            }
          >
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Chargement…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  {hasSearched ? "Actualiser les logs" : "Afficher les logs"}
                </>
              )}
            </span>
          </button>

          {hasSearched && (
            <button
              onClick={onReset}
              className="px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white/70 text-gray-500
                         hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm group"
            >
              <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditFilters;