"use client"

import { useEffect, useState } from "react"
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  XCircle,
  Sparkles,
  Tag,
  Banknote,
  EyeOff,
} from "lucide-react"

import { FormationContinue, PageResponse } from "@/types/formation-continue"
import { resolveImageUrl } from "@/utils/image"
import { FormationContinueService } from "@/services/FormationContinueService"
import { CatalogueAdminService } from "@/services/CatalogueAdminService"

import FormationContinueCreateModal from "@/components/formations-continues/FormationContinueCreateModal"
import FormationContinueEditModal from "@/components/formations-continues/FormationContinueEditModal"
import FormationContinueDetailsModal from "@/components/formations-continues/FormationContinueDetailsModal"

interface Categorie {
  id: number
  libelle: string
}

type ModalState =
  | { type: "create" }
  | { type: "edit"; id: number }
  | { type: "details"; id: number }
  | null

// ✅ Tri alphabétique A→Z insensible aux accents et à la casse
const sortAlpha = (arr: FormationContinue[]) =>
  [...arr].sort((a, b) =>
    a.libelle.localeCompare(b.libelle, "fr", { sensitivity: "base" })
  )

const FormationsContinuesPage = () => {

  const [formations, setFormations]     = useState<FormationContinue[]>([])
  const [categories, setCategories]     = useState<Categorie[]>([])
  const [loading, setLoading]           = useState(true)
  const [page, setPage]                 = useState(0)
  const [totalPages, setTotalPages]     = useState(0)
  const [modal, setModal]               = useState<ModalState>(null)
  const [deleteId, setDeleteId]         = useState<number | null>(null)
  const [deleting, setDeleting]         = useState(false)
  const [toggleTarget, setToggleTarget] = useState<FormationContinue | null>(null)
  const [toggling, setToggling]         = useState(false)

  /* ================= LOAD ================= */
  const loadFormations = async () => {
    try {
      setLoading(true)
      const data: PageResponse<FormationContinue> =
        await FormationContinueService.getAll(page, 10)
      setFormations(sortAlpha(data.content)) // ✅ tri A→Z
      setTotalPages(data.totalPages)
    } catch {
      setFormations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFormations() }, [page])

  useEffect(() => {
    const loadCategories = async () => {
      const data = await CatalogueAdminService.getCategories()
      setCategories(data)
    }
    loadCategories()
  }, [])

  const getCategorieName = (id?: number) =>
    categories.find(c => c.id === id)?.libelle

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setDeleting(true)
      await FormationContinueService.delete(deleteId)
      setDeleteId(null)
      await loadFormations()
    } catch {
    } finally {
      setDeleting(false)
    }
  }

  /* ================= TOGGLE ================= */
  const handleToggleConfirm = async () => {
    if (!toggleTarget) return
    try {
      setToggling(true)
      const updated = await FormationContinueService.toggle(toggleTarget.id)
      setFormations(prev =>
        sortAlpha( // ✅ tri maintenu après toggle
          prev.map(f => f.id === toggleTarget.id ? { ...f, enabled: updated.enabled } : f)
        )
      )
      setToggleTarget(null)
    } catch {
    } finally {
      setToggling(false)
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="w-full space-y-8 animate-pulse">
          <div className="h-24 bg-white rounded-3xl border border-gray-100" />
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-6 space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="flex gap-2">
                    {[1,2,3,4].map(j => (
                      <div key={j} className="w-9 h-9 bg-gray-100 rounded-xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="w-full space-y-6 animate-in fade-in duration-500">

        {/* ===== HEADER ===== */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50" />
                  <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Formations Continues
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#00A4E0]" />
                    {formations.length} formation{formations.length > 1 ? "s" : ""} — page {page + 1} / {totalPages}
                    {/* ✅ Indicateur de tri */}
                    <span className="ml-1 text-[10px] font-bold text-[#00A4E0] bg-[#cfe3ff]/40 px-2 py-0.5 rounded-full border border-[#00A4E0]/20">
                      A → Z
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModal({ type: "create" })}
                className="group relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden
                           hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-blue-200"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  <Plus size={18} /> Ajouter
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ===== EMPTY ===== */}
        {formations.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center space-y-4 border border-gray-100 shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Aucune formation</h3>
            <p className="text-gray-500 text-sm">Commencez par créer votre première formation continue.</p>
          </div>
        )}

        {/* ===== TABLE ===== */}
        {formations.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    {/* ✅ Badge A→Z dans l'entête */}
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        Formation
                        <span className="text-[10px] font-bold text-[#00A4E0] bg-[#cfe3ff]/50 px-1.5 py-0.5 rounded-md border border-[#00A4E0]/20">
                          A→Z
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Sous-catégorie</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Référence</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {formations.map((f, index) => (
                    <tr
                      key={f.id}
                      className="group hover:bg-blue-50/30 transition-all duration-200"
                      style={{ animation: `fadeIn 0.3s ease-out ${index * 0.04}s both` }}
                    >
                      {/* FORMATION */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                            <img
                              src={resolveImageUrl(f.coverUrl)}
                              alt={f.libelle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <p className="font-bold text-gray-900 group-hover:text-[#00A4E0] transition-colors text-sm">
                            {f.libelle}
                          </p>
                        </div>
                      </td>

                      {/* CATEGORIE */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {getCategorieName(f.sousCategorie?.categorieId) || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* SOUS-CATEGORIE */}
                      <td className="px-6 py-4">
                        {f.sousCategorie ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                            <Tag size={10} />
                            {f.sousCategorie.libelle}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>

                      {/* PRIX */}
                      <td className="px-6 py-4">
                        {f.prix != null ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                              <Banknote size={12} className="text-[#00A4E0]" />
                              {f.prix.toLocaleString()} FCFA
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                              f.afficherPrix ? "text-green-600" : "text-gray-400"
                            }`}>
                              {f.afficherPrix ? <Eye size={10} /> : <EyeOff size={10} />}
                              {f.afficherPrix ? "Visible" : "Masqué"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>

                      {/* REFERENCE */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-mono font-bold">
                          #{f.reference}
                        </span>
                      </td>

                      {/* STATUT */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          f.enabled
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${f.enabled ? "bg-green-500" : "bg-gray-400"}`} />
                          {f.enabled ? "Visible" : "Masquée"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setModal({ type: "details", id: f.id })}
                            className="p-2 rounded-xl text-gray-400 hover:text-[#00A4E0] hover:bg-blue-50
                                       transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Voir"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setModal({ type: "edit", id: f.id })}
                            className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50
                                       transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Modifier"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setToggleTarget(f)}
                            title={f.enabled ? "Désactiver" : "Activer"}
                            className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                              f.enabled
                                ? "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {f.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button
                            onClick={() => setDeleteId(f.id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50
                                       transition-all duration-200 hover:scale-110 active:scale-95"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page <span className="font-bold text-gray-900">{page + 1}</span> sur {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center
                           text-gray-500 hover:border-[#00A4E0] hover:text-[#00A4E0]
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                    page === i
                      ? "bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white shadow-md shadow-blue-200"
                      : "border border-gray-200 text-gray-600 hover:border-[#00A4E0] hover:text-[#00A4E0]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center
                           text-gray-500 hover:border-[#00A4E0] hover:text-[#00A4E0]
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ===== MODAL TOGGLE ===== */}
      {toggleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden
                         animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative overflow-hidden">
              <div className={`absolute inset-0 ${toggleTarget.enabled ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-gradient-to-r from-green-500 to-emerald-600"}`} />
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="relative px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center ring-1 ring-white/30">
                    {toggleTarget.enabled ? <ToggleRight size={20} className="text-white" /> : <ToggleLeft size={20} className="text-white" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-white">
                      {toggleTarget.enabled ? "Désactiver la formation" : "Activer la formation"}
                    </h2>
                    <p className="text-white/60 text-xs mt-0.5">Modification de la visibilité publique</p>
                  </div>
                </div>
                <button onClick={() => setToggleTarget(null)} className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all">
                  <XCircle size={15} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className={`text-sm text-gray-600 rounded-xl px-4 py-3 border ${toggleTarget.enabled ? "bg-orange-50 border-orange-100" : "bg-green-50 border-green-100"}`}>
                {toggleTarget.enabled
                  ? <>La formation <span className="font-bold">"{toggleTarget.libelle}"</span> sera masquée du catalogue public.</>
                  : <>La formation <span className="font-bold">"{toggleTarget.libelle}"</span> sera visible dans le catalogue public.</>
                }
              </p>
              <div className="flex gap-3">
                <button onClick={() => setToggleTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all">
                  Annuler
                </button>
                <button onClick={handleToggleConfirm} disabled={toggling}
                  className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all
                              hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                              disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                              ${toggleTarget.enabled ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-gradient-to-r from-green-500 to-emerald-600"}`}>
                  {toggling
                    ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> En cours...</span>
                    : toggleTarget.enabled ? "Désactiver" : "Activer"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DELETE ===== */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden
                         animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600" />
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="relative px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center ring-1 ring-white/30">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Confirmer la suppression</h2>
                    <p className="text-white/60 text-xs mt-0.5">Cette action est irréversible</p>
                  </div>
                </div>
                <button onClick={() => setDeleteId(null)} className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all">
                  <XCircle size={15} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                Voulez-vous vraiment supprimer cette formation ? Toutes les données associées seront perdues.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all">
                  Annuler
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600
                             text-white font-semibold text-sm hover:shadow-lg hover:scale-[1.02]
                             active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                  {deleting
                    ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Suppression...</span>
                    : "Supprimer"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}
      <FormationContinueCreateModal
        open={modal?.type === "create"}
        onClose={() => setModal(null)}
        onSuccess={loadFormations}
      />
      <FormationContinueEditModal
        formationId={modal?.type === "edit" ? modal.id : null}
        open={modal?.type === "edit"}
        onClose={() => setModal(null)}
        onSuccess={loadFormations}
      />
      <FormationContinueDetailsModal
        formationId={modal?.type === "details" ? modal.id : null}
        open={modal?.type === "details"}
        onClose={() => setModal(null)}
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

export default FormationsContinuesPage