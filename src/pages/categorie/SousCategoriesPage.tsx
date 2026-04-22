"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  Trash2,
  Layers,
  Sparkles,
  InboxIcon,
  Tag,
  ChevronDown,
  Pencil,
  Check,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

import { SousCategorieAdminService } from "@/services/SousCategorieAdminService"
import { CatalogueAdminService } from "@/services/CatalogueAdminService"

/* ================= TYPES ================= */

type Categorie = {
  id: number
  libelle: string
}

type SousCategorie = {
  id: number
  libelle: string
  categorieId: number
}

/* ================= HELPERS ================= */

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent transition-all bg-white/50 text-sm"

const selectCls = `${inputCls} appearance-none pr-10`

// ✅ Tri alphabétique A→Z insensible aux accents et à la casse
const sortAlpha = (arr: SousCategorie[]) =>
  [...arr].sort((a, b) =>
    a.libelle.localeCompare(b.libelle, "fr", { sensitivity: "base" })
  )

/* ================= COMPONENT ================= */

export default function SousCategoriesPage() {

  const [categories, setCategories]         = useState<Categorie[]>([])
  const [sousCategories, setSousCategories] = useState<SousCategorie[]>([])
  const [loading, setLoading]               = useState(true)

  const [libelle, setLibelle]         = useState("")
  const [categorieId, setCategorieId] = useState<number | "">("")

  const [editingId, setEditingId]             = useState<number | null>(null)
  const [editLibelle, setEditLibelle]         = useState("")
  const [editCategorieId, setEditCategorieId] = useState<number | "">("")

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  /* ================= LOAD ================= */

  const load = async () => {
    try {
      setLoading(true)
      const [cats, subs] = await Promise.all([
        CatalogueAdminService.getCategories(),
        SousCategorieAdminService.getAll(),
      ])
      setCategories(cats)
      setSousCategories(sortAlpha(subs)) // ✅ tri A→Z
    } catch {
      showToast("Erreur chargement", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    if (!libelle.trim() || !categorieId) {
      showToast("Champs obligatoires", "error")
      return
    }
    try {
      await SousCategorieAdminService.create({
        libelle,
        categorieId: Number(categorieId),
      })
      setLibelle("")
      setCategorieId("")
      showToast("Créée avec succès", "success")
      load()
    } catch {
      showToast("Erreur création", "error")
    }
  }

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    if (!editingId || !editLibelle || !editCategorieId) return
    try {
      await SousCategorieAdminService.update(editingId, {
        libelle: editLibelle,
        categorieId: Number(editCategorieId),
      })
      setEditingId(null)
      showToast("Modifiée avec succès", "success")
      load()
    } catch {
      showToast("Erreur modification", "error")
    }
  }

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await SousCategorieAdminService.delete(deleteId)
      showToast("Supprimée", "success")
      setDeleteId(null)
      load()
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Impossible de supprimer"
      showToast(msg, "error")
    }
  }

  /* ================= HELP ================= */

  const getCategorieName = (id: number) =>
    categories.find((c) => c.id === id)?.libelle || "-"

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="w-full space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 border">
            <div className="grid md:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />)}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="space-y-1.5">
                    <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-40" />
                    <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-24" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-9 h-9 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="w-9 h-9 bg-gray-200 rounded-xl animate-pulse" />
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
      <div className="w-full space-y-8 animate-in fade-in duration-500">

        {/* ===== HEADER ===== */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
                  <Layers className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Sous-catégories
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00A4E0]" />
                  {sousCategories.length} sous-catégorie{sousCategories.length > 1 ? "s" : ""} au total
                  {/* ✅ Indicateur de tri */}
                  <span className="text-[10px] font-bold text-[#00A4E0] bg-[#cfe3ff]/40 px-2 py-0.5 rounded-full border border-[#00A4E0]/20">
                    A → Z
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CREATE ===== */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-lg">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Ajouter une sous-catégorie
          </p>
          <div className="grid md:grid-cols-3 gap-3">

            <div className="relative group">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00A4E0] transition-colors pointer-events-none" />
              <input
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Libellé de la sous-catégorie..."
                className={`${inputCls} pl-11`}
              />
            </div>

            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={categorieId}
                onChange={(e) => setCategorieId(Number(e.target.value))}
                className={`${selectCls} pl-11`}
              >
                <option value="">Choisir une catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.libelle}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreate}
              className="group relative px-5 py-3 rounded-xl font-medium text-white overflow-hidden
                         hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                <Plus size={18} />
                Ajouter
              </span>
            </button>
          </div>
        </div>

        {/* ===== EMPTY STATE ===== */}
        {sousCategories.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center space-y-6 border border-gray-100 shadow-xl">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                  <InboxIcon className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl opacity-20 blur-2xl" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">Aucune sous-catégorie</h3>
              <p className="text-gray-600 max-w-sm mx-auto">Commencez par en créer une ci-dessus.</p>
            </div>
          </div>
        )}

        {/* ===== LIST ===== */}
        {sousCategories.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 grid grid-cols-[1fr_1fr_auto] gap-4">
              {/* ✅ Badge A→Z dans l'entête */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Libellé</span>
                <span className="text-[10px] font-bold text-[#00A4E0] bg-[#cfe3ff]/50 px-1.5 py-0.5 rounded-md border border-[#00A4E0]/20">
                  A→Z
                </span>
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Catégorie parente</span>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</span>
            </div>

            <div className="divide-y divide-gray-100">
              {sousCategories.map((sc, index) => (
                <div
                  key={sc.id}
                  className="group px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
                  style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                >
                  {editingId === sc.id ? (
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                      <div className="relative">
                        <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00A4E0] pointer-events-none" />
                        <input
                          value={editLibelle}
                          onChange={(e) => setEditLibelle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                          autoFocus
                          className={`${inputCls} pl-10 border-[#00A4E0] bg-blue-50/50`}
                        />
                      </div>
                      <div className="relative">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00A4E0] pointer-events-none" />
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          value={editCategorieId}
                          onChange={(e) => setEditCategorieId(Number(e.target.value))}
                          className={`${selectCls} pl-10 border-[#00A4E0] bg-blue-50/50`}
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.libelle}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleUpdate}
                          className="p-2.5 rounded-xl text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Confirmer">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="p-2.5 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Annuler">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-sm flex-shrink-0">
                          <Layers size={13} className="text-white" />
                        </div>
                        <span className="font-semibold text-gray-800 group-hover:text-[#00A4E0] transition-colors">
                          {sc.libelle}
                        </span>
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                          <Tag size={11} />
                          {getCategorieName(sc.categorieId)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(sc.id)
                            setEditLibelle(sc.libelle)
                            setEditCategorieId(sc.categorieId)
                          }}
                          className="p-2.5 rounded-xl text-gray-600 hover:text-[#00A4E0] hover:bg-blue-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Modifier">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteId(sc.id)}
                          className="p-2.5 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-white/30">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Confirmer la suppression</h2>
                    <p className="text-white/60 text-xs mt-0.5">Cette action est irréversible</p>
                  </div>
                </div>
                <button onClick={() => setDeleteId(null)}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all">
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                Voulez-vous vraiment supprimer cette sous-catégorie ?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm
                             hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                  Annuler
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600
                             text-white font-semibold text-sm hover:shadow-lg hover:scale-[1.02]
                             active:scale-[0.98] transition-all duration-200">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border
                        animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "error"
            ? "bg-red-50 border-red-100 text-red-700"
            : "bg-white border-gray-100 text-gray-800"
        }`}>
          {toast.type === "error"
            ? <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            : <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
          }
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}