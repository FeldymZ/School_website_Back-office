"use client"

import { useEffect, useState } from "react"
import {
  X,
  Pencil,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ImagePlus,
  Save,
  Tag,
  Layers,
  Banknote,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react"

import { FormationContinue } from "@/types/formation-continue"
import { resolveImageUrl } from "@/utils/image"
import { FormationContinueService } from "@/services/FormationContinueService"
import { CatalogueAdminService } from "@/services/CatalogueAdminService"
import { SousCategorieAdminService } from "@/services/SousCategorieAdminService"

import RichTextEditor from "../editor/RichTextEditor"

interface Props {
  formationId: number | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Categorie {
  id: number
  libelle: string
}

interface SousCategorie {
  id: number
  libelle: string
  categorieId?: number
}

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all bg-white text-sm"

const labelCls = "text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5"

const selectCls =
  "w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 appearance-none bg-white text-sm text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all"

export default function FormationContinueEditModal({
  formationId,
  open,
  onClose,
  onSuccess,
}: Props) {

  const [formation, setFormation] = useState<FormationContinue | null>(null)

  const [form, setForm] = useState({
    libelle: "",
    description: "",
    objectifs: "",
    competences: "",
    prix: "",
    afficherPrix: true,
    duree: "",
    uniteDuree: "JOURS",
    logo: null as File | null,
  })

  const [categories, setCategories] = useState<Categorie[]>([])
  const [sousCategories, setSousCategories] = useState<SousCategorie[]>([])

  const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null)
  const [selectedSousCategorie, setSelectedSousCategorie] = useState<number | null>(null)

  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ================= LOAD ADMIN ================= */
  useEffect(() => {
    const loadData = async () => {
      const [cats, sousCats] = await Promise.all([
        CatalogueAdminService.getCategories(),
        SousCategorieAdminService.getAll(),
      ])
      setCategories(cats)
      setSousCategories(sousCats)
    }
    loadData()
  }, [])

  /* ================= LOAD FORMATION ================= */
  useEffect(() => {
    if (!open || !formationId) return

    const load = async () => {
      const data = await FormationContinueService.getById(formationId)

      setFormation(data)

      setForm({
        libelle: data.libelle || "",
        description: data.description || "",
        objectifs: data.objectifs || "",
        competences: data.competences || "",
        prix: data.prix?.toString() || "",
        afficherPrix: data.afficherPrix ?? true,
        duree: data.duree?.toString() || "",
        uniteDuree: data.uniteDuree || "JOURS",
        logo: null,
      })

      setSelectedSousCategorie(data.sousCategorie?.id || null)
      setSelectedCategorie(data.sousCategorie?.categorieId || null)
      setCoverPreview(null)
    }

    load()
  }, [open, formationId])

  if (!open || !formation) return null

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!selectedSousCategorie) {
      setError("Veuillez sélectionner une sous-catégorie.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()

      formData.append("libelle", form.libelle)
      formData.append("description", form.description)
      formData.append("objectifs", form.objectifs)
      formData.append("competences", form.competences)

      if (form.prix) formData.append("prix", form.prix)
      formData.append("afficherPrix", form.afficherPrix.toString())
      if (form.duree) formData.append("duree", form.duree)
      formData.append("uniteDuree", form.uniteDuree)

      if (form.logo) {
        formData.append("cover", form.logo)
      }

      formData.append("sousCategorieId", selectedSousCategorie.toString())

      await FormationContinueService.update(formation.id, formData)

      onSuccess()
      onClose()
    } catch (err) {
      setError("Une erreur est survenue lors de la modification.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredSousCategories = sousCategories.filter(
    sc => sc.categorieId === selectedCategorie
  )

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm({ ...form, logo: file })
    setCoverPreview(URL.createObjectURL(file))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden
                   animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]"
      >

        {/* ===== HEADER ===== */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-white/30">
                <Pencil size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Modifier la formation</h2>
                <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{formation.libelle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ===== COVER ===== */}
          <div>
            <label className={labelCls}>Photo de couverture</label>
            <label className="relative group cursor-pointer block">
              <div className={`w-full h-36 rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-200
                ${coverPreview || formation.coverUrl
                  ? "border-[#00A4E0]/40 hover:border-[#00A4E0]"
                  : "border-gray-200 hover:border-[#00A4E0] hover:bg-blue-50/30"
                }`}>
                {coverPreview || formation.coverUrl ? (
                  <>
                    <img
                      src={coverPreview || resolveImageUrl(formation.coverUrl)}
                      alt="cover"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-2xl">
                      <div className="flex items-center gap-2 text-white text-sm font-semibold">
                        <ImagePlus size={16} />
                        Changer l'image
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                    <ImagePlus size={24} />
                    <span className="text-sm">Cliquer pour ajouter une image</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </label>
          </div>

          {/* ===== LIBELLE ===== */}
          <div>
            <label className={labelCls}>Libellé</label>
            <input
              value={form.libelle}
              onChange={(e) => setForm({ ...form, libelle: e.target.value })}
              placeholder="Titre de la formation"
              className={inputCls}
            />
          </div>

          {/* ===== CATEGORIE + SOUS-CATEGORIE ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Catégorie</label>
              <div className="relative group">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A4E0] transition-colors pointer-events-none" size={14} />
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                <select
                  value={selectedCategorie || ""}
                  onChange={(e) => {
                    setSelectedCategorie(Number(e.target.value) || null)
                    setSelectedSousCategorie(null)
                  }}
                  className={selectCls}
                >
                  <option value="">Sélectionner</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.libelle}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Sous-catégorie</label>
              <div className="relative group">
                <Layers className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                  !selectedCategorie ? "text-gray-300" : "text-gray-400 group-focus-within:text-[#00A4E0]"
                }`} size={14} />
                <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  !selectedCategorie ? "text-gray-300" : "text-gray-400"
                }`} size={13} />
                <select
                  value={selectedSousCategorie || ""}
                  onChange={(e) => setSelectedSousCategorie(Number(e.target.value) || null)}
                  disabled={!selectedCategorie}
                  className={`${selectCls} ${!selectedCategorie ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
                >
                  <option value="">Sélectionner</option>
                  {filteredSousCategories.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.libelle}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ===== PRIX + DUREE ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Prix (FCFA)</label>
              <div className="relative group">
                <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A4E0] transition-colors pointer-events-none" size={14} />
                <input
                  type="number"
                  value={form.prix}
                  onChange={(e) => setForm({ ...form, prix: e.target.value })}
                  placeholder="Ex : 150000"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all bg-white text-sm"
                />
              </div>
              {/* AFFICHER PRIX */}
              <label className="flex items-center gap-2.5 mt-2.5 cursor-pointer group w-fit">
                <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                  form.afficherPrix ? "bg-[#00A4E0]" : "bg-gray-200"
                }`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    form.afficherPrix ? "translate-x-4" : "translate-x-0.5"
                  }`} />
                  <input
                    type="checkbox"
                    checked={form.afficherPrix}
                    onChange={(e) => setForm({ ...form, afficherPrix: e.target.checked })}
                    className="sr-only"
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  {form.afficherPrix
                    ? <><Eye size={12} className="text-[#00A4E0]" /> Prix visible</>
                    : <><EyeOff size={12} className="text-gray-400" /> Prix masqué</>
                  }
                </span>
              </label>
            </div>

            <div>
              <label className={labelCls}>Durée</label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00A4E0] transition-colors pointer-events-none" size={14} />
                  <input
                    type="number"
                    value={form.duree}
                    onChange={(e) => setForm({ ...form, duree: e.target.value })}
                    placeholder="Ex : 5"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all bg-white text-sm"
                  />
                </div>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                  <select
                    value={form.uniteDuree}
                    onChange={(e) => setForm({ ...form, uniteDuree: e.target.value })}
                    className="pl-4 pr-8 py-3 rounded-xl border border-gray-200 appearance-none bg-white text-sm text-gray-700
                               focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/30 focus:border-[#00A4E0] transition-all"
                  >
                    <option value="JOURS">Jours</option>
                    <option value="SEMAINES">Semaines</option>
                    <option value="MOIS">Mois</option>
                    <option value="ANNEES">Années</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ===== DESCRIPTION ===== */}
          <div>
            <label className={labelCls}>Description</label>
            <RichTextEditor
              value={form.description}
              onChange={(val) => setForm({ ...form, description: val })}
            />
          </div>

          {/* ===== OBJECTIFS ===== */}
          <div>
            <label className={labelCls}>Objectifs</label>
            <RichTextEditor
              value={form.objectifs}
              onChange={(val) => setForm({ ...form, objectifs: val })}
            />
          </div>

          {/* ===== COMPETENCES ===== */}
          <div>
            <label className={labelCls}>Compétences acquises</label>
            <RichTextEditor
              value={form.competences}
              onChange={(val) => setForm({ ...form, competences: val })}
            />
          </div>

        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm
                       hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 group relative py-3 rounded-xl font-semibold text-sm text-white overflow-hidden
                       hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-200
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enregistrement...</>
              ) : (
                <><Save size={15} /> Enregistrer</>
              )}
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}