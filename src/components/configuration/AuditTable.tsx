import { useState, useMemo } from "react";
import {
  Shield, Activity, Sparkles, FileText,
  LogIn, LogOut, Plus, Pencil, Trash2, Eye, ToggleLeft,
  ArrowUpDown, AlertTriangle, ChevronLeft, ChevronRight,
  Download, Calendar, Target, CheckCircle
} from "lucide-react";
import type { AdminAuditLog } from "@/types/audit";

interface Props {
  logs: AdminAuditLog[];
  actorEmail?: string;
}

/* ================================================================
   ACTION META — couleurs cohérentes avec la charte bleue
   ================================================================ */
type ActionMeta = { dot: string; pill: string; icon: React.ReactNode; label: string };

const getActionMeta = (action: string): ActionMeta => {
  const base = (dot: string, pill: string, icon: React.ReactNode): ActionMeta =>
    ({ dot, pill, icon, label: action.replace(/_/g, " ") });

  if (action === "LOGIN_SUCCESS")
    return base("bg-emerald-400", "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100", <LogIn size={11}/>);
  if (action === "DECONNEXION")
    return base("bg-slate-400", "bg-slate-50 text-slate-600 border-slate-200 shadow-slate-100", <LogOut size={11}/>);
  if (action.includes("ECHEC"))
    return base("bg-red-500", "bg-red-50 text-red-700 border-red-200 shadow-red-100", <AlertTriangle size={11}/>);
  if (action.startsWith("LOGIN"))
    return base("bg-red-400", "bg-red-50 text-red-600 border-red-200 shadow-red-100", <AlertTriangle size={11}/>);
  if (action.startsWith("CREATION"))
    return base("bg-emerald-400", "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100", <Plus size={11}/>);
  if (action.startsWith("MODIFICATION") || action.startsWith("UPLOAD") || action.startsWith("AJOUT") || action.startsWith("REMPLACEMENT"))
    return base("bg-[#00A4E0]", "bg-[#cfe3ff]/60 text-[#005f8a] border-[#00A4E0]/25 shadow-[#00A4E0]/10", <Pencil size={11}/>);
  if (action.startsWith("SUPPRESSION"))
    return base("bg-orange-400", "bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100", <Trash2 size={11}/>);
  if (action.startsWith("CONSULTATION") || action.startsWith("FILTRE") || action.startsWith("RECHERCHE") || action.startsWith("TELECHARGEMENT"))
    return base("bg-slate-300", "bg-slate-50 text-slate-500 border-slate-200 shadow-slate-100", <Eye size={11}/>);
  if (action.startsWith("ACTIVATION") || action.startsWith("DESACTIVATION") || action.startsWith("TOGGLE"))
    return base("bg-amber-400", "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100", <ToggleLeft size={11}/>);
  if (action.startsWith("REORDONNANCEMENT"))
    return base("bg-indigo-400", "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100", <ArrowUpDown size={11}/>);
  if (action.startsWith("CHANGEMENT") || action.startsWith("REPONSE") || action.startsWith("CLOTURE"))
    return base("bg-violet-400", "bg-violet-50 text-violet-700 border-violet-200 shadow-violet-100", <Activity size={11}/>);
  return base("bg-slate-300", "bg-slate-50 text-slate-500 border-slate-200 shadow-slate-100", <Activity size={11}/>);
};

/* ── Groupes ── */
const GROUPS = [
  { key: "Tous",         match: (_: string) => true },
  { key: "Auth",         match: (a: string) => a.startsWith("LOGIN") || a === "DECONNEXION" },
  { key: "Création",     match: (a: string) => a.startsWith("CREATION") },
  { key: "Modification", match: (a: string) => a.startsWith("MODIFICATION") || a.startsWith("UPLOAD") || a.startsWith("AJOUT") || a.startsWith("REMPLACEMENT") },
  { key: "Suppression",  match: (a: string) => a.startsWith("SUPPRESSION") },
  { key: "Consultation", match: (a: string) => a.startsWith("CONSULTATION") || a.startsWith("FILTRE") || a.startsWith("RECHERCHE") },
  { key: "Activation",   match: (a: string) => a.startsWith("ACTIVATION") || a.startsWith("DESACTIVATION") || a.startsWith("TOGGLE") },
  { key: "Échec",        match: (a: string) => a.includes("ECHEC") },
];

const PAGE_SIZE = 15;

/* ================================================================
   COMPOSANT
   ================================================================ */
const AuditTable = ({ logs, actorEmail }: Props) => {
  const [activeGroup, setActiveGroup] = useState("Tous");
  const [page, setPage] = useState(1);

  const groupFn = GROUPS.find(g => g.key === activeGroup)?.match ?? (() => true);

  const filtered = useMemo(() =>
    logs
      .filter(l => groupFn(l.action))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [logs, activeGroup]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    const csv = ["ID,Acteur,Action,Cible,Date",
      ...filtered.map(l => `${l.id},"${l.actorEmail}","${l.action}","${l.target}","${new Date(l.createdAt).toLocaleString("fr-FR")}"`)
    ].join("\n");
    Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `audit-${actorEmail ?? "export"}.csv`,
    }).click();
  };

  /* ── Empty state ── */
  if (logs.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#00A4E0]/15 shadow-2xl"
        style={{ background: "linear-gradient(135deg, #f0f8ff 0%, #ffffff 50%, #f0f8ff 100%)" }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-[#00A4E0]/10 to-[#cfe3ff]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-[#cfe3ff]/15 to-transparent rounded-full blur-3xl" />
        <div className="relative z-10 p-24 text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-25 animate-pulse scale-110" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl"
              style={{ boxShadow: "0 16px 48px rgba(0,164,224,0.30)" }}>
              <FileText className="w-12 h-12 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
            Aucun log d'audit
            <Sparkles size={20} className="text-[#00A4E0] animate-pulse" />
          </h3>
          <p className="text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
            Aucune activité enregistrée pour cet administrateur sur la période sélectionnée
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/60"
      style={{ boxShadow: "0 8px 48px rgba(0,164,224,0.10), 0 1px 0 rgba(255,255,255,0.8) inset" }}>

      {/* Orbes décoratifs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-[#cfe3ff]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-gradient-to-tr from-[#00A4E0]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ── Barre supérieure : tabs + export ── */}
      <div className="relative z-10 px-6 pt-5 pb-4 border-b border-gray-100/80 flex items-center justify-between gap-4 flex-wrap">

        {/* Tabs groupes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {GROUPS.map(g => {
            const cnt = g.key === "Tous" ? logs.length : logs.filter(l => g.match(l.action)).length;
            if (g.key !== "Tous" && cnt === 0) return null;
            const active = activeGroup === g.key;
            return (
              <button key={g.key} onClick={() => { setActiveGroup(g.key); setPage(1); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  active
                    ? "text-white shadow-lg scale-[1.02]"
                    : "bg-gray-100/80 text-gray-500 hover:bg-[#cfe3ff]/50 hover:text-[#0077A8]"
                }`}
                style={active ? { background: "linear-gradient(135deg, #00A4E0, #0077A8)", boxShadow: "0 4px 16px rgba(0,164,224,0.30)" } : {}}>
                {g.key}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg min-w-[20px] text-center ${
                  active ? "bg-white/25 text-white" : "bg-white text-gray-400 shadow-sm"
                }`}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Export */}
        <button onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-500
                     bg-white border border-gray-200 hover:border-[#00A4E0]/40 hover:text-[#00A4E0]
                     hover:bg-[#cfe3ff]/20 transition-all shadow-sm hover:shadow-md">
          <Download size={13} />
          Exporter CSV
        </button>
      </div>

      {/* ── Entête tableau ── */}
      <div className="relative z-10 grid grid-cols-[2fr_3fr_2fr_1.5fr] gap-0 bg-gradient-to-r from-gray-50/90 via-[#cfe3ff]/10 to-gray-50/90 border-b border-gray-100">
        {[
          { icon: <Shield size={13} className="text-blue-500" />, bg: "from-blue-100 to-sky-100", label: "Administrateur" },
          { icon: <Activity size={13} className="text-[#00A4E0]" />, bg: "from-[#00A4E0] to-[#0077A8]", label: "Action", white: true },
          { icon: <Target size={13} className="text-purple-500" />, bg: "from-purple-100 to-pink-100", label: "Sur quoi" },
          { icon: <Calendar size={13} className="text-orange-500" />, bg: "from-orange-100 to-amber-100", label: "Date", right: true },
        ].map(({ icon, bg, label, white, right }) => (
          <div key={label} className={`px-6 py-4 flex items-center gap-2 ${right ? "justify-end" : ""}`}>
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${bg} flex items-center justify-center shadow-sm flex-shrink-0`}>
              {white ? <span className="text-white">{icon}</span> : icon}
            </div>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Lignes ── */}
      <div className="relative z-10 divide-y divide-gray-50/80">
        {rows.map((log, i) => {
          const meta = getActionMeta(log.action);
          const hasTarget = log.target && log.target !== "-" && log.target !== "";
          const d = new Date(log.createdAt);

          return (
            <div key={log.id}
              className="grid grid-cols-[2fr_3fr_2fr_1.5fr] gap-0 hover:bg-gradient-to-r hover:from-[#cfe3ff]/8 hover:to-white transition-all duration-200 group"
              style={{ animation: `slideIn 0.45s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.045}s both` }}>

              {/* Acteur */}
              <div className="px-6 py-4 flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all"
                    style={{ boxShadow: "0 2px 12px rgba(0,164,224,0.25)" }}>
                    {log.actorEmail.charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${meta.dot}`} />
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#0077A8] transition-colors">
                  {log.actorEmail}
                </p>
              </div>

              {/* Action */}
              <div className="px-6 py-4 flex items-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wide shadow-sm ${meta.pill}`}>
                  {meta.icon}
                  {meta.label}
                </span>
              </div>

              {/* Cible */}
              <div className="px-6 py-4 flex items-center">
                {hasTarget ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle size={13} className="text-gray-300 shrink-0" />
                    <p className="text-sm text-gray-600 font-medium truncate group-hover:text-gray-800 transition-colors">
                      {log.target}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-300 text-sm">—</span>
                )}
              </div>

              {/* Date */}
              <div className="px-6 py-4 flex flex-col items-end justify-center">
                <p className="text-xs font-bold text-gray-700 tabular-nums">
                  {d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
                <p className="text-[11px] text-gray-400 tabular-nums mt-0.5 font-medium">
                  {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="relative z-10 px-6 py-4 border-t border-gray-100/80 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-gray-400 font-medium">
            <span className="text-gray-700 font-bold">{(page-1)*PAGE_SIZE+1}</span>
            {" – "}
            <span className="text-gray-700 font-bold">{Math.min(page*PAGE_SIZE, filtered.length)}</span>
            {" sur "}
            <span className="text-gray-700 font-bold">{filtered.length}</span>
            {" résultats"}
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#00A4E0]/40 hover:text-[#00A4E0] hover:bg-[#cfe3ff]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
              <ChevronLeft size={15} />
            </button>
            {Array.from({length: Math.min(5,totalPages)},(_,i)=>{
              const n=Math.min(Math.max(page-2,1)+i,totalPages);
              return (
                <button key={n} onClick={()=>setPage(n)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    n===page
                      ? "text-white scale-[1.05]"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-[#00A4E0]/40 hover:text-[#00A4E0] hover:bg-[#cfe3ff]/20"
                  }`}
                  style={n===page ? { background: "linear-gradient(135deg,#00A4E0,#0077A8)", boxShadow: "0 4px 14px rgba(0,164,224,0.30)" } : {}}>
                  {n}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#00A4E0]/40 hover:text-[#00A4E0] hover:bg-[#cfe3ff]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="relative z-10 px-8 py-4 border-t border-gray-100/80"
        style={{ background: "linear-gradient(to right, rgba(249,250,251,0.8), rgba(207,227,255,0.15), rgba(249,250,251,0.8))" }}>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-[#00A4E0]" />
            <span className="font-medium">
              {filtered.length} entrée{filtered.length > 1 ? "s" : ""}
              {activeGroup !== "Tous" && <span className="text-[#00A4E0] font-bold"> · {activeGroup}</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Synchronisé</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;