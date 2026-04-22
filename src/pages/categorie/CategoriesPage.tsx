import { useEffect, useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Sparkles,
  Check,
  X,
  InboxIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

import { CatalogueAdminService } from "@/services/CatalogueAdminService"

type Categorie = {
  id: number
  libelle: string
}

// ✅ Tri alphabétique A→Z insensible aux accents et à la casse
const sortAlpha = (arr: Categorie[]) =>
  [...arr].sort((a, b) =>
    a.libelle.localeCompare(b.libelle, "fr", { sensitivity: "base" })
  )

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)

  const [newLibelle, setNewLibelle] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")

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
      const data = await CatalogueAdminService.getCategories()
      setCategories(sortAlpha(data)) // ✅ tri A→Z
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    if (!newLibelle.trim()) return
    await CatalogueAdminService.createCategorie(newLibelle)
    setNewLibelle("")
    showToast("Catégorie créée", "success")
    load()
  }

  /* ================= UPDATE ================= */
  const handleUpdate = async (id: number) => {
    if (!editingValue.trim()) return
    await CatalogueAdminService.updateCategorie(id, editingValue)
    setEditingId(null)
    setEditingValue("")
    showToast("Catégorie modifiée", "success")
    load()
  }

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await CatalogueAdminService.deleteCategorie(deleteId)
      setDeleteId(null)
      showToast("Catégorie supprimée", "success")
      load()
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Impossible de supprimer"
      showToast(msg, "error")
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="w-full space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 border">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="h-5 bg-gray-200 rounded-lg animate-pulse w-1/3" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse" />
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

        {/* HEADER */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] rounded-3xl opacity-5 blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
                  <Tag className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Catégories
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00A4E0]" />
                  {categories.length} catégorie{categories.length > 1 ? "s" : ""} au total
                  {/* ✅ Indicateur de tri */}
                  <span className="text-[10px] font-bold text-[#00A4E0] bg-[#cfe3ff]/40 px-2 py-0.5 rounded-full border border-[#00A4E0]/20">
                    A → Z
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CREATE */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-lg">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Ajouter une catégorie
          </p>
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00A4E0] transition-colors" />
              <input
                value={newLibelle}
                onChange={(e) => setNewLibelle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Nom de la nouvelle catégorie..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all bg-white/50"
              />
            </div>
            <button
              onClick={handleCreate}
              className="group relative px-5 py-3 rounded-xl font-medium text-white overflow-hidden
                         hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <Plus size={18} />
                Ajouter
              </span>
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {categories.length === 0 && (
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
              <h3 className="text-2xl font-bold text-gray-900">Aucune catégorie</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Commencez par créer votre première catégorie ci-dessus.
              </p>
            </div>
          </div>
        )}

        {/* LIST */}
        {categories.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              {/* ✅ Badge A→Z dans l'entête */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Libellé</span>
                <span className="text-[10px] font-bold text-[#00A4E0] bg-[#cfe3ff]/50 px-1.5 py-0.5 rounded-md border border-[#00A4E0]/20">
                  A→Z
                </span>
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</span>
            </div>

            <div className="divide-y divide-gray-100">
              {categories.map((c, index) => (
                <div
                  key={c.id}
                  className="group flex items-center justify-between px-6 py-4
                             hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent
                             transition-all duration-200"
                  style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                >
                  <div className="flex items-center gap-3 flex-1 mr-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-sm flex-shrink-0">
                      <Tag size={13} className="text-white" />
                    </div>

                    {editingId === c.id ? (
                      <input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(c.id)}
                        autoFocus
                        className="flex-1 px-3 py-2 rounded-xl border border-[#00A4E0] bg-blue-50/50
                                   focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30
                                   text-sm font-medium transition-all"
                      />
                    ) : (
                      <span className="font-semibold text-gray-800 group-hover:text-[#00A4E0] transition-colors">
                        {c.libelle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingId === c.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(c.id)}
                          className="p-2.5 rounded-xl text-gray-600 hover:text-green-600
                                     hover:bg-green-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Confirmer"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingValue("") }}
                          className="p-2.5 rounded-xl text-gray-600 hover:text-gray-800
                                     hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Annuler"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(c.id); setEditingValue(c.libelle) }}
                          className="p-2.5 rounded-xl text-gray-600 hover:text-[#00A4E0]
                                     hover:bg-blue-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-2.5 rounded-xl text-gray-600 hover:text-red-600
                                     hover:bg-red-50 transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DELETE */}
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
                Voulez-vous vraiment supprimer cette catégorie ?
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

      {/* TOAST */}
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