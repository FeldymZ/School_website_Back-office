import { useEffect, useState } from "react"
import { Clock, Paperclip, User, Shield, InboxIcon } from "lucide-react"

import { DemandeDevisReponse } from "@/types/demande-devis-continue"

import EnvoyeParBadge from "../common/EnvoyeParBadge"
import DemandeDevisContinuesService from "@/services/DemandeDevisContinuesService"

interface Props {
  demandeId: number
}

export default function HistoriqueReponsesDemandeDevis({ demandeId }: Props) {
  const [reponses, setReponses] = useState<DemandeDevisReponse[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const data = await DemandeDevisContinuesService.getReponses(demandeId)
      setReponses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [demandeId])

  /* ===== Loading ===== */
  if (loading) {
    return (
      <div className="space-y-3 p-1">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* ===== Empty ===== */
  if (reponses.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-gray-100">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <InboxIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl opacity-20 blur-xl" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-gray-700 text-sm">Aucun message</p>
          <p className="text-xs text-gray-400">Aucun message envoyé pour cette demande.</p>
        </div>
      </div>
    )
  }

  /* ===== List ===== */
  return (
    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
      {reponses.map((r, idx) => {
        const isAdmin = r.envoyePar === "ADMIN"

        return (
          <div
            key={r.id}
            className={`flex items-end gap-2.5 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
            style={{ animation: `slideUp 0.3s ease-out ${idx * 0.07}s both` }}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-1 shadow-sm ${
                isAdmin
                  ? "bg-gradient-to-br from-[#00A4E0] to-[#0077A8]"
                  : "bg-gradient-to-br from-gray-200 to-gray-300"
              }`}
            >
              {isAdmin
                ? <Shield size={14} className="text-white" />
                : <User size={14} className="text-gray-500" />
              }
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                isAdmin
                  ? "bg-gradient-to-br from-[#00A4E0] to-[#0077A8] text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-md"
              }`}
            >
              {/* 🔥 BADGE PROPRE */}
              <div className="mb-2">
                <EnvoyeParBadge envoyePar={r.envoyePar} />
              </div>

              {/* Message */}
              <div
                className="prose prose-sm max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: r.message }}
              />

              {/* Attachment */}
              {r.pieceJointeUrl && (
                <a
                  href={r.pieceJointeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1.5 mt-2.5 text-[11px] font-medium underline ${
                    isAdmin ? "text-white/80 hover:text-white" : "text-[#00A4E0]"
                  }`}
                >
                  <Paperclip size={11} />
                  Télécharger la pièce jointe
                </a>
              )}

              {/* Timestamp */}
              <div
                className={`flex items-center gap-1 text-[10px] mt-2 ${
                  isAdmin ? "text-white/50" : "text-gray-400"
                }`}
              >
                <Clock size={9} />
                {new Date(r.dateEnvoi).toLocaleString("fr-FR")}
              </div>
            </div>
          </div>
        )
      })}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}