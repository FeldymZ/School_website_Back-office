import { useEffect, useState } from "react"
import {
  X,
  GraduationCap,
  CheckCircle,
  XCircle,
  Sparkles,
  Layers,
  Banknote,
  Clock,
  FileText,
  Target,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react"

import { FormationContinue } from "@/types/formation-continue"
import { resolveImageUrl } from "@/utils/image"
import { FormationContinueService } from "@/services/FormationContinueService"

interface Props {
  formationId: number | null
  open: boolean
  onClose: () => void
}

/* ================= INFO BADGE ================= */

const InfoBadge = ({
  icon: Icon,
  label,
  value,
  color = "blue",
}: {
  icon: React.ElementType
  label: string
  value: string
  color?: "blue" | "purple" | "green" | "orange"
}) => {
  const styles = {
    blue:   "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    green:  "bg-green-50 text-green-700 border-green-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  }
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${styles[color]}`}>
      <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
        <p className="text-sm font-bold mt-0.5">{value}</p>
      </div>
    </div>
  )
}

/* ================= SECTION BLOCK ================= */

const SectionBlock = ({
  icon: Icon,
  label,
  html,
}: {
  icon: React.ElementType
  label: string
  html: string
}) => (
  <div>
    <div className="flex items-center gap-2 mb-2.5">
      <div className="w-6 h-6 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-lg flex items-center justify-center">
        <Icon size={12} className="text-white" />
      </div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
    <div
      className="prose prose-sm max-w-none text-gray-700 leading-relaxed
                 bg-gradient-to-br from-gray-50 to-white rounded-2xl px-5 py-4
                 border border-gray-100 shadow-sm
                 prose-headings:text-gray-900 prose-headings:font-bold
                 prose-p:text-gray-600 prose-li:text-gray-600
                 prose-a:text-[#00A4E0] prose-blockquote:border-[#00A4E0]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  </div>
)

/* ================= COMPONENT ================= */

const FormationContinueDetailsModal = ({ formationId, open, onClose }: Props) => {

  const [formation, setFormation] = useState<FormationContinue | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !formationId) return
    const load = async () => {
      try {
        setLoading(true)
        const data = await FormationContinueService.getById(formationId)
        setFormation(data)
      } catch (err) {
        console.error(err)
        onClose()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, formationId])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]
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
                <h2 className="font-bold text-white text-lg">Détails formation</h2>
                <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1.5">
                  <Sparkles size={11} />
                  {formation ? formation.libelle : "Chargement..."}
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
        <div className="overflow-y-auto flex-1">

          {/* Loading skeleton */}
          {loading && (
            <div className="p-6 space-y-4">
              <div className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
              <div className="h-7 bg-gray-200 rounded-xl animate-pulse w-3/4" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}
              </div>
            </div>
          )}

          {formation && !loading && (
            <>
              {/* COVER IMAGE */}
              {formation.coverUrl && (
                <div className="relative">
                  <img
                    src={resolveImageUrl(formation.coverUrl)}
                    alt={formation.libelle}
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    {formation.enabled ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/90 backdrop-blur text-white text-xs font-semibold shadow-md">
                        <CheckCircle size={12} /> Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700/80 backdrop-blur text-white text-xs font-semibold">
                        <XCircle size={12} /> Inactive
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">

                {/* TITLE + STATUS */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">{formation.libelle}</h3>
                  {!formation.coverUrl && (
                    formation.enabled ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-semibold border border-green-100 flex-shrink-0">
                        <CheckCircle size={12} /> Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold flex-shrink-0">
                        <XCircle size={12} /> Inactive
                      </div>
                    )
                  )}
                </div>

                {/* CATEGORIE */}
                {formation.sousCategorie && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
                      <Layers size={11} />
                      {formation.sousCategorie.libelle}
                    </span>
                  </div>
                )}

                {/* INFOS GRID */}
                <div className="grid grid-cols-2 gap-3">
                  <InfoBadge
                    icon={Banknote}
                    label="Prix"
                    value={formation.prix != null ? `${formation.prix.toLocaleString()} FCFA` : "Non défini"}
                    color="green"
                  />
                  <InfoBadge
                    icon={Clock}
                    label="Durée"
                    value={formation.duree != null ? `${formation.duree} ${formation.uniteDuree ?? ""}` : "Non définie"}
                    color="orange"
                  />
                </div>

                {/* AFFICHER PRIX */}
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
                  formation.afficherPrix
                    ? "bg-blue-50 text-blue-700 border-blue-100"
                    : "bg-gray-50 text-gray-500 border-gray-200"
                }`}>
                  {formation.afficherPrix
                    ? <><Eye size={12} /> Prix affiché publiquement</>
                    : <><EyeOff size={12} /> Prix masqué publiquement</>
                  }
                </div>

                {/* DESCRIPTION */}
                {formation.description && (
                  <SectionBlock icon={FileText} label="Description" html={formation.description} />
                )}

                {/* OBJECTIFS */}
                {formation.objectifs && (
                  <SectionBlock icon={Target} label="Objectifs" html={formation.objectifs} />
                )}

                {/* COMPETENCES */}
                {formation.competences && (
                  <SectionBlock icon={Zap} label="Compétences acquises" html={formation.competences} />
                )}

              </div>
            </>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="px-6 pb-6 pt-2 border-t border-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm
                       hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                       hover:scale-[1.01] active:scale-[0.99]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default FormationContinueDetailsModal