"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  UserCheck,
  Loader2,
  RefreshCw,
  Settings,
  Sparkles,
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Plus,
  ChevronDown,
  ImagePlus,
} from "lucide-react";

import {
  SessionUniversitaire,
  PreinscriptionPeriode,
  PreinscriptionEmetteur,
} from "@/types/preinscription";
import { PreinscriptionService } from "@/services/preinscription.service";

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] text-sm transition-all bg-white";

/* ================= SECTION HEADER ================= */
function SectionHeader({ icon: Icon, title, color, count }: { icon: any; title: string; color: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-xl blur-md opacity-40`} />
        <div className={`relative w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-md`}>
          <Icon size={17} className="text-white" />
        </div>
      </div>
      <div>
        <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
        <p className="text-xs text-gray-400">{count} élément{count > 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */
const PreinscriptionConfigPage = () => {

  const [sessions, setSessions] = useState<SessionUniversitaire[]>([]);
  const [periodes, setPeriodes] = useState<PreinscriptionPeriode[]>([]);
  const [emetteurs, setEmetteurs] = useState<PreinscriptionEmetteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sessions" | "periodes" | "emetteurs">("sessions");

  /* ================= EDIT / DELETE STATES ================= */
  const [editSession, setEditSession] = useState<any | null>(null);
  const [deleteSession, setDeleteSession] = useState<number | null>(null);

  const [editPeriode, setEditPeriode] = useState<any | null>(null);
  const [deletePeriode, setDeletePeriode] = useState<number | null>(null);

  const [editEmetteur, setEditEmetteur] = useState<any | null>(null);
  const [deleteEmetteur, setDeleteEmetteur] = useState<number | null>(null);

  /* ================= CREATE STATES ================= */
  const [createSessionForm, setCreateSessionForm] = useState({ annee: "" });
  const [openCreateSession, setOpenCreateSession] = useState(false);

  const [createPeriodeForm, setCreatePeriodeForm] = useState({
    dateDebut: "", dateFin: "", sessionId: "", emetteurId: "",
  });
  const [openCreatePeriode, setOpenCreatePeriode] = useState(false);

  const [createEmetteurForm, setCreateEmetteurForm] = useState({
    nom: "", fonction: "", signature: null as File | null,
  });
  const [openCreateEmetteur, setOpenCreateEmetteur] = useState(false);

  /* ================= LOAD ================= */
  const load = async () => {
    setLoading(true);
    const [s, p, e] = await Promise.all([
      PreinscriptionService.getSessions(),
      PreinscriptionService.getPeriodes(),
      PreinscriptionService.getAllEmetteurs(),
    ]);
    setSessions(s || []);
    setPeriodes(p || []);
    setEmetteurs(e || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-2xl opacity-30 animate-pulse" />
            <Loader2 className="relative w-12 h-12 text-[#00A4E0] animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6 space-y-8 animate-in fade-in duration-500">

      {/* ===== HEADER ===== */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
                  <Settings className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Configuration Préinscriptions
                </h1>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#00A4E0]" />
                  {sessions.length} session{sessions.length > 1 ? "s" : ""} · {periodes.length} période{periodes.length > 1 ? "s" : ""} · {emetteurs.length} émetteur{emetteurs.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={load}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
                         border border-gray-200 bg-white hover:border-[#00A4E0] hover:text-[#00A4E0]
                         hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
            >
              <RefreshCw size={15} className="group-hover:rotate-180 transition-transform duration-500" />
              Rafraîchir
            </button>
          </div>
        </div>
      </div>

      {/* ===== TABS BAR ===== */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg p-2 flex gap-2">
        {([
          { key: "sessions",  label: "Sessions",  icon: Calendar,  color: "from-[#00A4E0] to-[#0077A8]"   },
          { key: "periodes",  label: "Périodes",  icon: Clock,     color: "from-purple-500 to-indigo-600" },
          { key: "emetteurs", label: "Émetteurs", icon: UserCheck,  color: "from-orange-400 to-amber-500"  },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`group flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive ? "bg-gradient-to-r " + tab.color + " text-white shadow-md" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}>
              <Icon size={16} className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-lg p-6 animate-in fade-in duration-300">

        {activeTab === "sessions" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-4">
   <div className="flex items-center justify-between mb-4">
          <SectionHeader icon={Calendar} title="Sessions" color="from-[#00A4E0] to-[#0077A8]" count={sessions.length} />
          <button onClick={() => setOpenCreateSession(true)}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-md shadow-blue-200">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-1.5"><Plus size={14} /> Ajouter</span>
          </button>
        </div>
        <div className="space-y-2">
          {sessions.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6 bg-gray-50 rounded-xl">Aucune session</p>
          )}
          {sessions.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50/50 to-white
                         border border-blue-100 hover:shadow-md transition-all duration-200 group"
              style={{ animation: `fadeIn 0.2s ease-out ${i * 0.04}s both` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00A4E0]" />
                <span className="font-semibold text-gray-800 text-sm">{s.annee}</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditSession(s)}
                  className="p-2 rounded-lg text-gray-400 hover:text-[#00A4E0] hover:bg-blue-50 transition-all hover:scale-110" title="Modifier">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteSession(s.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-110" title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
          </div>
        )}

        {activeTab === "periodes" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-4">
   <div className="flex items-center justify-between mb-4">
          <SectionHeader icon={Clock} title="Périodes" color="from-purple-500 to-indigo-600" count={periodes.length} />
          <button onClick={() => setOpenCreatePeriode(true)}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-md shadow-purple-200">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-1.5"><Plus size={14} /> Ajouter</span>
          </button>
        </div>
        <div className="space-y-2">
          {periodes.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6 bg-gray-50 rounded-xl">Aucune période</p>
          )}
          {periodes.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-gradient-to-r from-purple-50/50 to-white
                         border border-purple-100 hover:shadow-md transition-all duration-200 group"
              style={{ animation: `fadeIn 0.2s ease-out ${i * 0.04}s both` }}
            >
              {/* ✅ STATUT + DATES */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-700 font-medium">
                    {new Date(p.dateDebut).toLocaleString("fr-FR")} → {new Date(p.dateFin).toLocaleString("fr-FR")}
                  </span>
                  <span className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${
                    p.active ? "text-green-500" : "text-gray-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.active ? "bg-green-400 animate-pulse" : "bg-gray-300"}`} />
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* ✅ DÉSACTIVER — seulement si active */}
                {p.active && (
                  <button
                    onClick={async () => {
                      await PreinscriptionService.deactivatePeriode(p.id);
                      load();
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all hover:scale-110"
                    title="Désactiver"
                  >
                    <X size={14} />
                  </button>
                )}
                <button onClick={() => setEditPeriode(p)}
                  className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all hover:scale-110" title="Modifier">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeletePeriode(p.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-110" title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
          </div>
        )}

        {activeTab === "emetteurs" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-4">
   <div className="flex items-center justify-between mb-4">
          <SectionHeader icon={UserCheck} title="Émetteurs" color="from-orange-400 to-amber-500" count={emetteurs.length} />
          <button onClick={() => setOpenCreateEmetteur(true)}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-md shadow-orange-200">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-1.5"><Plus size={14} /> Ajouter</span>
          </button>
        </div>
        <div className="space-y-2">
          {emetteurs.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6 bg-gray-50 rounded-xl">Aucun émetteur</p>
          )}
          {emetteurs.map((e, i) => (
            <div
              key={e.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-orange-50/50 to-white
                         border border-orange-100 hover:shadow-md transition-all duration-200 group"
              style={{ animation: `fadeIn 0.2s ease-out ${i * 0.04}s both` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{e.nom.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{e.nom}</p>
                  <p className="text-xs text-gray-500">{e.fonction}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditEmetteur(e)}
                  className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all hover:scale-110" title="Modifier">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteEmetteur(e.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-110" title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
          </div>
        )}

      </div>

      {/* ===== CREATE MODALS ===== */}
      {openCreateSession && (
        <Modal title="Nouvelle session" color="from-[#00A4E0] to-[#0077A8]" icon={<Calendar size={17} className="text-white" />} onClose={() => setOpenCreateSession(false)}>
          <input
            value={createSessionForm.annee}
            onChange={(e) => setCreateSessionForm({ annee: e.target.value })}
            placeholder="2025-2026"
            className={inputCls}
          />
          <button onClick={async () => {
            await PreinscriptionService.createSession({ annee: createSessionForm.annee });
            setCreateSessionForm({ annee: "" });
            setOpenCreateSession(false);
            load();
          }} className="group relative w-full py-3 rounded-xl font-semibold text-white text-sm overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-200">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2"><Plus size={15} /> Créer la session</span>
          </button>
        </Modal>
      )}

      {openCreatePeriode && (
        <Modal title="Nouvelle période" color="from-purple-500 to-indigo-600" icon={<Clock size={17} className="text-white" />} onClose={() => setOpenCreatePeriode(false)}>
          <div className="space-y-3">
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <select onChange={(e) => setCreatePeriodeForm({ ...createPeriodeForm, sessionId: e.target.value })}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] text-sm bg-white appearance-none">
                <option value="">Session</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>{s.annee}</option>)}
              </select>
            </div>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <select onChange={(e) => setCreatePeriodeForm({ ...createPeriodeForm, emetteurId: e.target.value })}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] text-sm bg-white appearance-none">
                <option value="">Émetteur</option>
                {emetteurs.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>
            <input type="datetime-local" className={inputCls} onChange={(e) => setCreatePeriodeForm({ ...createPeriodeForm, dateDebut: e.target.value })} />
            <input type="datetime-local" className={inputCls} onChange={(e) => setCreatePeriodeForm({ ...createPeriodeForm, dateFin: e.target.value })} />
          </div>
          <button onClick={async () => {
            await PreinscriptionService.createPeriode({
              sessionId: Number(createPeriodeForm.sessionId),
              emetteurId: Number(createPeriodeForm.emetteurId),
              dateDebut: createPeriodeForm.dateDebut,
              dateFin: createPeriodeForm.dateFin,
            });
            setCreatePeriodeForm({ dateDebut: "", dateFin: "", sessionId: "", emetteurId: "" });
            setOpenCreatePeriode(false);
            load();
          }} className="group relative w-full py-3 rounded-xl font-semibold text-white text-sm overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-purple-200">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2"><Plus size={15} /> Créer la période</span>
          </button>
        </Modal>
      )}

      {openCreateEmetteur && (
        <Modal title="Nouvel émetteur" color="from-orange-400 to-amber-500" icon={<UserCheck size={17} className="text-white" />} onClose={() => setOpenCreateEmetteur(false)}>
          <div className="space-y-3">
            <input placeholder="Nom de l'émetteur" className={inputCls} onChange={(e) => setCreateEmetteurForm({ ...createEmetteurForm, nom: e.target.value })} />
            <input placeholder="Fonction (ex: Directeur)" className={inputCls} onChange={(e) => setCreateEmetteurForm({ ...createEmetteurForm, fonction: e.target.value })} />
            <label className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer group">
              <ImagePlus size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
              <span className="text-sm text-gray-500 group-hover:text-orange-600 truncate">
                {createEmetteurForm.signature ? createEmetteurForm.signature.name : "Signature (obligatoire)"}
              </span>
              <input type="file" className="hidden" onChange={(e) => setCreateEmetteurForm({ ...createEmetteurForm, signature: e.target.files?.[0] || null })} />
            </label>
          </div>
          <button onClick={async () => {
            if (!createEmetteurForm.signature) return;
            await PreinscriptionService.createEmetteur(createEmetteurForm.nom, createEmetteurForm.fonction, createEmetteurForm.signature);
            setCreateEmetteurForm({ nom: "", fonction: "", signature: null });
            setOpenCreateEmetteur(false);
            load();
          }} className="group relative w-full py-3 rounded-xl font-semibold text-white text-sm overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-orange-200">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2"><Plus size={15} /> Créer l'émetteur</span>
          </button>
        </Modal>
      )}

      {/* ===== EDIT MODALS ===== */}
      {editSession && (
        <Modal title="Modifier la session" color="from-[#00A4E0] to-[#0077A8]" icon={<Calendar size={17} className="text-white" />} onClose={() => setEditSession(null)}>
          <input value={editSession.annee} onChange={(e) => setEditSession({ ...editSession, annee: e.target.value })} className={inputCls} placeholder="Année universitaire" />
          <SaveButton onClick={async () => {
            await PreinscriptionService.updateSession(editSession.id, editSession);
            setEditSession(null);
            load();
          }} />
        </Modal>
      )}

      {editPeriode && (
        <Modal title="Modifier la période" color="from-purple-500 to-indigo-600" icon={<Clock size={17} className="text-white" />} onClose={() => setEditPeriode(null)}>
          <input type="datetime-local" value={editPeriode.dateDebut} onChange={(e) => setEditPeriode({ ...editPeriode, dateDebut: e.target.value })} className={inputCls} />
          <input type="datetime-local" value={editPeriode.dateFin} onChange={(e) => setEditPeriode({ ...editPeriode, dateFin: e.target.value })} className={inputCls} />
          <SaveButton onClick={async () => {
            await PreinscriptionService.updatePeriode(editPeriode.id, editPeriode);
            setEditPeriode(null);
            load();
          }} />
        </Modal>
      )}

      {editEmetteur && (
        <Modal title="Modifier l'émetteur" color="from-orange-400 to-amber-500" icon={<UserCheck size={17} className="text-white" />} onClose={() => setEditEmetteur(null)}>
          <div className="space-y-3">
            <input
              value={editEmetteur.nom}
              onChange={(e) => setEditEmetteur({ ...editEmetteur, nom: e.target.value })}
              className={inputCls}
              placeholder="Nom de l'émetteur"
            />
            <input
              value={editEmetteur.fonction}
              onChange={(e) => setEditEmetteur({ ...editEmetteur, fonction: e.target.value })}
              className={inputCls}
              placeholder="Fonction (ex: Directeur)"
            />
            <label className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer group">
              <ImagePlus size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
              <span className="text-sm text-gray-500 group-hover:text-orange-600 truncate">
                {editEmetteur._newSignature ? editEmetteur._newSignature.name : "Nouvelle signature (optionnel)"}
              </span>
              <input type="file" className="hidden" onChange={(e) => setEditEmetteur({ ...editEmetteur, _newSignature: e.target.files?.[0] || null })} />
            </label>
          </div>
          <SaveButton onClick={async () => {
            await PreinscriptionService.updateEmetteur(editEmetteur.id, editEmetteur, editEmetteur._newSignature ?? undefined);
            setEditEmetteur(null);
            load();
          }} />
        </Modal>
      )}

      {/* ===== DELETE MODALS ===== */}
      {deleteSession !== null && (
        <ConfirmModal title="Supprimer cette session ?"
          onConfirm={async () => { await PreinscriptionService.deleteSession(deleteSession); setDeleteSession(null); load(); }}
          onClose={() => setDeleteSession(null)} />
      )}
      {deletePeriode !== null && (
        <ConfirmModal title="Supprimer cette période ?"
          onConfirm={async () => { await PreinscriptionService.deletePeriode(deletePeriode); setDeletePeriode(null); load(); }}
          onClose={() => setDeletePeriode(null)} />
      )}
      {deleteEmetteur !== null && (
        <ConfirmModal title="Supprimer cet émetteur ?"
          onConfirm={async () => { await PreinscriptionService.deleteEmetteur(deleteEmetteur); setDeleteEmetteur(null); load(); }}
          onClose={() => setDeleteEmetteur(null)} />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PreinscriptionConfigPage;

/* ================= MODAL ================= */
function Modal({ title, color, icon, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden
                      animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden flex-shrink-0">
          <div className={`absolute inset-0 bg-gradient-to-r ${color}`} />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-white/30">{icon}</div>
              <h2 className="font-bold text-white text-base">{title}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95">
              <X size={15} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ================= CONFIRM MODAL ================= */
function ConfirmModal({ title, onConfirm, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden
                      animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600" />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center ring-1 ring-white/30">
                <AlertTriangle size={17} className="text-white" />
              </div>
              <h2 className="font-bold text-white text-base">Confirmation</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all">
              <X size={15} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-5 text-center">
          <p className="text-gray-800 font-semibold">{title}</p>
          <p className="text-gray-500 text-sm">Cette action est irréversible.</p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all">
              Annuler
            </button>
            <button onClick={onConfirm}
              className="group relative flex-1 py-3 rounded-xl font-semibold text-white text-sm overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-200">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2"><Trash2 size={14} /> Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= SAVE BUTTON ================= */
function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group relative w-full py-3 rounded-xl font-semibold text-white text-sm overflow-hidden
                 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-200">
      <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="relative flex items-center justify-center gap-2"><Save size={15} /> Enregistrer</span>
    </button>
  );
}