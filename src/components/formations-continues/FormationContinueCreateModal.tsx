import { useEffect, useState } from "react"
import {
  X,
  Image as ImageIcon,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Tag,
  Layers,
  ChevronDown,
  Plus,
} from "lucide-react"

import { FormationContinueService } from "@/services/FormationContinueService"
import { CatalogueAdminService } from "@/services/CatalogueAdminService"
import { SousCategorieAdminService } from "@/services/SousCategorieAdminService"
import { Categorie, SousCategorie } from "@/types/catalogue"
import RichTextEditor from "@/components/editor/RichTextEditor"

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

/* ============================
   HELPERS
   ============================ */
const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
)

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent transition-all bg-white/50 text-sm"

const selectCls = `${inputCls} appearance-none pr-10`

/* ============================
   COMPONENT
   ============================ */
const FormationContinueCreateModal = ({ open, onClose, onSuccess }: Props) => {

  const [categories, setCategories] = useState<Categorie[]>([])
  const [sousCategories, setSousCategories] = useState<SousCategorie[]>([])

  const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null)
  const [selectedSousCategorie, setSelectedSousCategorie] = useState<number | null>(null)

  const [libelle, setLibelle] = useState("")
  const [description, setDescription] = useState("")
  const [objectifs, setObjectifs] = useState("")
  const [competences, setCompetences] = useState("")
  const [prix, setPrix] = useState("")
  const [duree, setDuree] = useState("")
  const [uniteDuree, setUniteDuree] = useState("JOURS")

  const [cover, setCover] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!open) return

    const load = async () => {
      try {
        const cats = await CatalogueAdminService.getCategories()
        const subs = await SousCategorieAdminService.getAll()

        console.log("CATEGORIES :", cats)
        console.log("SOUS CATEGORIES :", subs)

        setCategories(cats)
        setSousCategories(subs)

      } catch (err) {
        console.error(err)
        setError("Erreur chargement catalogue")
      }
    }

    load()
  }, [open])

  /* ================= FILTER ================= */
  const filteredSousCategories =
    selectedCategorie === null
      ? []
      : sousCategories.filter(
          (sc) =>
            sc.categorieId !== undefined &&
            sc.categorieId === selectedCategorie
        )

  console.log("SELECTED :", selectedCategorie)
  console.log("FILTERED :", filteredSousCategories)

  /* ================= IMAGE ================= */
  const handleImageChange = (file: File | null) => {
    setCover(file)
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
    if (!selectedCategorie) return "Choisir une catégorie"
    if (!selectedSousCategorie) return "Choisir une sous-catégorie"
    if (!libelle.trim()) return "Le libellé est obligatoire"
    if (!description.trim() || description === "<p></p>") return "La description est obligatoire"
    if (prix && isNaN(Number(prix))) return "Prix invalide"
    if (duree && isNaN(Number(duree))) return "Durée invalide"
    return null
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("libelle", libelle)
      formData.append("description", description)
      formData.append("objectifs", objectifs)
      formData.append("competences", competences)

      if (prix) formData.append("prix", Number(prix).toString())
      if (duree) formData.append("duree", Number(duree).toString())

      formData.append("uniteDuree", uniteDuree)

      if (cover) formData.append("cover", cover)

      await FormationContinueService.create(selectedSousCategorie!, formData)

      onSuccess()
      onClose()

    } catch (err) {
      console.error(err)
      setError("Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  /* ================= RENDER ================= */
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]
                   animate-in fade-in slide-in-from-bottom-4 duration-300"
      >

        {/* ===== HEADER ===== */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="relative px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md" />
                <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-1 ring-white/30">
                  <GraduationCap size={22} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Nouvelle formation</h2>
                <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1.5">
                  <Sparkles size={11} />
                  Formation continue
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

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* CATEGORIE */}
          <FieldGroup label="Catégorie">
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedCategorie ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  const parsed = value ? Number(value) : null
                  console.log("SELECT CAT :", parsed)
                  setSelectedCategorie(parsed)
                  setSelectedSousCategorie(null)
                }}
                className={`${selectCls} pl-10`}
              >
                <option value="">Choisir une catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.libelle}</option>
                ))}
              </select>
            </div>
          </FieldGroup>

          {/* SOUS-CATEGORIE */}
          <FieldGroup label="Sous-catégorie">
            <div className="relative">
              <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={selectedSousCategorie ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setSelectedSousCategorie(value ? Number(value) : null)
                }}
                disabled={!selectedCategorie}
                className={`${selectCls} pl-10 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Choisir une sous-catégorie</option>
                {filteredSousCategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>{sc.libelle}</option>
                ))}
              </select>
            </div>
          </FieldGroup>

          {/* LIBELLE */}
          <FieldGroup label="Libellé *">
            <input
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              placeholder="Nom de la formation"
              className={inputCls}
            />
          </FieldGroup>

          {/* DESCRIPTION */}
          <FieldGroup label="Description *">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Rédigez une description complète de la formation..."
            />
          </FieldGroup>

          {/* OBJECTIFS */}
          <FieldGroup label="Objectifs">
            <RichTextEditor
              value={objectifs}
              onChange={setObjectifs}
              placeholder="Décrivez les objectifs pédagogiques..."
            />
          </FieldGroup>

          {/* COMPETENCES */}
          <FieldGroup label="Compétences">
            <RichTextEditor
              value={competences}
              onChange={setCompetences}
              placeholder="Listez les compétences développées..."
            />
          </FieldGroup>

          {/* PRIX & DUREE */}
          <div className="grid grid-cols-3 gap-3">
            <FieldGroup label="Prix">
              <input
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </FieldGroup>
            <FieldGroup label="Durée">
              <input
                value={duree}
                onChange={(e) => setDuree(e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </FieldGroup>
            <FieldGroup label="Unité">
              <div className="relative">
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={uniteDuree}
                  onChange={(e) => setUniteDuree(e.target.value)}
                  className={selectCls}
                >
                  <option value="JOURS">Jours</option>
                  <option value="MOIS">Mois</option>
                  <option value="ANNEES">Années</option>
                </select>
              </div>
            </FieldGroup>
          </div>

          {/* COVER */}
          <FieldGroup label="Image de couverture">
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={coverPreview} className="w-full h-44 object-cover" />
                <button
                  onClick={() => handleImageChange(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-[#00A4E0] hover:bg-blue-50/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                  <ImageIcon size={22} className="text-gray-400 group-hover:text-[#00A4E0] transition-colors" />
                </div>
                <p className="text-sm font-medium text-gray-500 group-hover:text-[#00A4E0] transition-colors">
                  Cliquer pour choisir une image
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                />
              </label>
            )}
          </FieldGroup>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="group relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden
                       hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Créer la formation
                </>
              )}
            </span>
          </button>

        </div>
      </div>
    </div>
  )
}   

export default FormationContinueCreateModal