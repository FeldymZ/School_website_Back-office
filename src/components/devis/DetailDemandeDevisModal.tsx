import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  ClipboardList,
  Users,
  Timer,
  Banknote,
  Sparkles,
  AlertCircle,
  LockKeyhole,
} from "lucide-react"

import { DemandeDevisContinue } from "@/types/demande-devis-continue"
import DemandeDevisContinuesService from "@/services/DemandeDevisContinuesService"
import { useState } from "react"

/* ================= PROPS ================= */

interface Props {
  demande: DemandeDevisContinue | null
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
}

/* ================= INFO ROW ================= */

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | number
}) => (
  <div className="flex items-center gap-3.5 py-3 border-b border-gray-100 last:border-0">
    <div className="w-9 h-9 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon size={15} className="text-[#00A4E0]" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="font-semibold text-gray-800 text-sm truncate mt-0.5">
        {value || "—"}
      </p>
    </div>
  </div>
)

/* ================= COMPONENT ================= */

export default function DetailDemandeDevisModal({
  demande,
  isOpen,
  onClose,
  onRefresh,
}: Props) {
  const [cloturing, setCloturing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!isOpen || !demande) return null

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("fr-FR") : "—"

  const total = demande.lignes?.reduce(
    (sum, l) => sum + (l.prix ?? 0) * l.nombreParticipants,
    0
  )

  const handleCloturer = async () => {
    try {
      setCloturing(true)
      await DemandeDevisContinuesService.cloturer(demande.id)
      setConfirmOpen(false)
      onClose()
      onRefresh?.()
    } catch (e) {
      alert("Erreur lors de la clôture")
    } finally {
      setCloturing(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden
                   animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ===== HEADER FIXE ===== */}
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
                  <ClipboardList size={22} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Détail de la demande</h2>
                <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1.5">
                  <Sparkles size={11} />
                  #{demande.id}
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

        {/* ===== CONTENU SCROLL ===== */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">

          {/* INFOS CLIENT */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl px-4 py-1 border border-gray-100">
            <InfoRow icon={User}     label="Nom"       value={demande.nomClient} />
            <InfoRow icon={Mail}     label="Email"     value={demande.email} />
            <InfoRow icon={Phone}    label="Téléphone" value={demande.telephone} />
            {demande.nomStructure && (
              <InfoRow icon={Building2} label="Structure" value={demande.nomStructure} />
            )}
            <InfoRow icon={Calendar} label="Date"      value={formatDate(demande.dateDemande)} />
          </div>

          {/* FORMATIONS */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-lg flex items-center justify-center">
                <ClipboardList size={13} className="text-white" />
              </div>
              Formations choisies
            </h3>

            {demande.lignes && demande.lignes.length > 0 ? (
              <div className="space-y-2.5">
                {demande.lignes.map((ligne, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm
                               hover:border-blue-100 hover:shadow-md transition-all duration-200"
                    style={{ animation: `fadeIn 0.2s ease-out ${index * 0.06}s both` }}
                  >
                    <p className="font-bold text-gray-900 text-sm">{ligne.formationLibelle}</p>

                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        <Users size={11} />
                        {ligne.nombreParticipants} participant{ligne.nombreParticipants > 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                        <Timer size={11} />
                        {ligne.duree} {ligne.uniteDuree}
                      </span>
                      {ligne.prix && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                          <Banknote size={11} />
                          {ligne.prix.toLocaleString()} FCFA
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                Aucune formation sélectionnée
              </p>
            )}
          </div>

          {/* TOTAL */}
          {total > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl px-5 py-4 border border-blue-100 flex justify-between items-center">
              <span className="font-bold text-gray-800 text-sm">Total estimé</span>
              <span className="font-black text-xl text-[#00A4E0]">
                {total.toLocaleString()}
                <span className="text-sm font-semibold text-gray-500 ml-1">FCFA</span>
              </span>
            </div>
          )}

        </div>

        {/* ===== FOOTER FIXE ===== */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-50 flex-shrink-0 flex gap-3">

          {/* Bouton Clôturer — uniquement si pas FERMEE */}
          {demande.statut !== "FERMEE" && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="group relative flex-1 py-3 rounded-xl font-semibold text-white text-sm overflow-hidden
                         hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md shadow-red-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                <LockKeyhole size={15} />
                Clôturer
              </span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm
                       hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                       hover:scale-[1.01] active:scale-[0.99]"
          >
            Fermer
          </button>

        </div>
      </div>

      {/* ===== CONFIRM MODAL CLÔTURE ===== */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden
                       animate-in fade-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header rouge */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600" />
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
              />
              <div className="relative px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-white/30">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Confirmer la clôture</h2>
                    <p className="text-white/60 text-xs mt-0.5">Cette action est irréversible</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                Voulez-vous vraiment clôturer cette demande ? Elle ne pourra plus recevoir de réponse.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm
                             hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCloturer}
                  disabled={cloturing}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600
                             text-white font-semibold text-sm hover:shadow-lg hover:scale-[1.02]
                             active:scale-[0.98] transition-all duration-200
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {cloturing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Clôture...
                    </span>
                  ) : (
                    "Confirmer la clôture"
                  )}
                </button>
              </div>
            </div>
          </div>
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