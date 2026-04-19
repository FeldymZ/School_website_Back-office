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

/* ================= TYPES ================= */

interface Categorie {
  id: number
  libelle: string
}

interface SousCategorie {
  id: number
  libelle: string
  categorieId?: number
}

/* ================= STYLES ================= */

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all bg-white text-sm"

const labelCls = "text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5"

/* ================= COMPONENT ================= */

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

  /* ================= LOAD DATA ADMIN ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, sousCats] = await Promise.all([
          CatalogueAdminService.getCategories(),
          SousCategorieAdminService.getAll(),
        ])
        setCategories(cats)
        setSousCategories(sousCats)
      } catch (e) {
        console.error("Erreur chargement admin", e)
      }
    }
    loadData()
  }, [])

  /* ================= LOAD FORMATION ================= */
  useEffect(() => {
    if (!open || !formationId) return

    const load = async () => {
      try {
        const data = await FormationContinueService.getById(formationId)

        setFormation(data)

        setForm({
          libelle: data.libelle || "",
          description: data.description || "",
          objectifs: data.objectifs || "",
          competences: data.competences || "",
          prix: data.prix?.toString() || "",
          duree: data.duree?.toString() || "",
          uniteDuree: data.uniteDuree || "JOURS",
          logo: null,
        })

        setSelectedSousCategorie(data.sousCategorie?.id || null)
        setSelectedCategorie(data.sousCategorie?.categorieId || null)

      } catch (err) {
        console.error(err)
        onClose()
      }
    }

    load()
  }, [open, formationId])

  if (!open || !formation) return null

  /* ================= IMAGE ================= */
  const handleImageChange = (file: File | null) => {
    setForm({ ...form, logo: file })

    if (!file) {
      setCoverPreview(null)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (!form.libelle.trim()) return "Libellé obligatoire"
    if (!form.description.trim()) return "Description obligatoire"
    if (!selectedSousCategorie) return "Choisir une sous-catégorie"
    return null
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {

    const err = validate()
    if (err) {
      setError(err)
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
      if (form.duree) formData.append("duree", form.duree)

      formData.append("uniteDuree", form.uniteDuree)

      if (form.logo) {
        formData.append("cover", form.logo)
      }

      formData.append("sousCategorieId", selectedSousCategorie!.toString())

      await FormationContinueService.update(formation.id, formData)

      onSuccess()
      onClose()

    } catch (e) {
      console.error(e)
      setError("Erreur lors de la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  const filteredSousCategories = sousCategories.filter(
    sc => sc.categorieId === selectedCategorie
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]
                   animate-in fade-in slide-in-from-bottom-4 duration-300"
      >

        {/* ===== HEADER ===== */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600" />
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="relative px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md" />
                <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-1 ring-white/30">
                  <Pencil size={20} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Modifier la formation</h2>
                <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1.5">
                  <Sparkles size={11} />
                  {formation.libelle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center
                         text-white transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* LIBELLE */}
          <div>
            <label className={labelCls}>Libellé</label>
            <input
              value={form.libelle}
              onChange={(e) => setForm({ ...form, libelle: e.target.value })}
              className={inputCls}
              placeholder="Titre de la formation"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className={labelCls}>Description</label>
            <RichTextEditor
              value={form.description}
              onChange={(val) => setForm({ ...form, description: val })}
            />
          </div>

          {/* OBJECTIFS */}
          <div>
            <label className={labelCls}>Objectifs</label>
            <RichTextEditor
              value={form.objectifs}
              onChange={(val) => setForm({ ...form, objectifs: val })}
            />
          </div>

          {/* COMPETENCES */}
          <div>
            <label className={labelCls}>Compétences</label>
            <RichTextEditor
              value={form.competences}
              onChange={(val) => setForm({ ...form, competences: val })}
            />
          </div>

          {/* PRIX + DURÉE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Prix (FCFA)</label>
              <div className="relative group">
                <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={15} />
                <input
                  type="number"
                  placeholder="0"
                  value={form.prix}
                  onChange={(e) => setForm({ ...form, prix: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                             focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                             transition-all bg-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Durée</label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={15} />
                  <input
                    type="number"
                    placeholder="0"
                    value={form.duree}
                    onChange={(e) => setForm({ ...form, duree: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                               focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                               transition-all bg-white text-sm"
                  />
                </div>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  <select
                    value={form.uniteDuree}
                    onChange={(e) => setForm({ ...form, uniteDuree: e.target.value })}
                    className="pl-3 pr-9 py-3 rounded-xl border border-gray-200 appearance-none
                               focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                               bg-white text-sm h-full"
                  >
                    <option value="JOURS">Jours</option>
                    <option value="MOIS">Mois</option>
                    <option value="ANNEES">Années</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORIE */}
          <div>
            <label className={labelCls}>Catégorie</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <select
                value={selectedCategorie || ""}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  setSelectedCategorie(id)
                  setSelectedSousCategorie(null)
                }}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 appearance-none
                           focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                           transition-all bg-white text-sm"
              >
                <option value="">Choisir une catégorie</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.libelle}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SOUS-CATEGORIE */}
          <div>
            <label className={labelCls}>Sous-catégorie</label>
            <div className="relative">
              <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <select
                value={selectedSousCategorie || ""}
                onChange={(e) => setSelectedSousCategorie(Number(e.target.value))}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 appearance-none
                           focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500
                           transition-all bg-white text-sm"
              >
                <option value="">Choisir une sous-catégorie</option>
                {filteredSousCategories.map(sc => (
                  <option key={sc.id} value={sc.id}>{sc.libelle}</option>
                ))}
              </select>
            </div>
          </div>

          {/* IMAGE */}
          <div>
            <label className={labelCls}>Image de couverture</label>
            <label
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-dashed border-gray-200
                         hover:border-green-400 hover:bg-green-50/30 transition-all duration-200 cursor-pointer group"
            >
              <ImagePlus size={18} className="text-gray-400 group-hover:text-green-500 transition-colors flex-shrink-0" />
              <span className="text-sm text-gray-500 group-hover:text-green-600 transition-colors">
                {form.logo ? form.logo.name : "Choisir une nouvelle image"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
              />
            </label>

            {(coverPreview || formation.coverUrl) && (
              <div className="mt-3 relative rounded-2xl overflow-hidden h-44 border border-gray-100 shadow-sm">
                <img
                  src={coverPreview || resolveImageUrl(formation.coverUrl)}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
                {coverPreview && (
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-green-500/90 backdrop-blur text-white text-[11px] font-semibold">
                    Nouvelle image
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ===== FOOTER ===== */}
        <div className="px-6 pb-6 pt-3 border-t border-gray-50 flex-shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm
                       hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="group relative flex-1 py-3 rounded-xl font-semibold text-white text-sm overflow-hidden
                       hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-green-200
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Enregistrer
                </>
              )}
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}