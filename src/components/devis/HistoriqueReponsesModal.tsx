import { useEffect, useState } from "react"
import { X, Clock, FileText, InboxIcon, History, Sparkles, ChevronRight } from "lucide-react"

import {
  DemandeDevisContinue,
  DemandeDevisReponse,
} from "@/types/demande-devis-continue"
import DemandeDevisContinuesService from "@/services/DemandeDevisContinuesService"

interface Props {
  demande: DemandeDevisContinue | null
  isOpen: boolean
  onClose: () => void
}

export default function HistoriqueReponsesModal({
  demande,
  isOpen,
  onClose,
}: Props) {
  const [reponses, setReponses] = useState<DemandeDevisReponse[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!demande || !isOpen) return
    const load = async () => {
      try {
        setLoading(true)
        const data = await DemandeDevisContinuesService.getReponses(demande.id)
        setReponses(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [demande, isOpen])

  if (!isOpen || !demande) return null

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col border border-gray-100 overflow-hidden
                   animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
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
                  <History size={22} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Historique des réponses</h2>
                <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1.5">
                  <Sparkles size={11} />
                  {demande.nomClient} · {demande.email}
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

        {/* COUNTER STRIP */}
        {!loading && reponses.length > 0 && (
          <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">{reponses.length}</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              message{reponses.length > 1 ? "s" : ""} envoyé{reponses.length > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                    <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && reponses.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center space-y-5 border border-gray-100">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                    <InboxIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl opacity-20 blur-2xl" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">Aucune réponse</h3>
                <p className="text-gray-500 text-sm">Aucune réponse envoyée pour le moment.</p>
              </div>
            </div>
          )}

          {/* Liste */}
          {!loading && reponses.length > 0 && reponses.map((r, idx) => (
            <div
              key={r.id}
              className="group bg-white border border-gray-100 rounded-2xl p-4 space-y-3
                         hover:border-[#00A4E0]/30 hover:shadow-lg transition-all duration-300
                         hover:-translate-y-0.5"
              style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.07}s both` }}
            >
              {/* Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-sm">
                    <span className="text-white text-[10px] font-bold">{String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  <span className="text-xs font-bold text-[#0077A8] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {r.envoyePar}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Clock size={10} />
                  {formatDate(r.dateEnvoi)}
                </span>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-700 leading-relaxed pl-11">{r.message}</p>

              {/* Pièce jointe */}
              {r.pieceJointeUrl && (
                <a
                  href={r.pieceJointeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00A4E0]
                             hover:text-[#0077A8] pl-11 group/link"
                >
                  <FileText size={12} />
                  <span className="group-hover/link:underline">Voir la pièce jointe</span>
                  <ChevronRight size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="px-6 pb-6 pt-2 flex-shrink-0 border-t border-gray-50">
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

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}