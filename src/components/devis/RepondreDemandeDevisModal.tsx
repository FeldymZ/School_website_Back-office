import { useRef, useState, useEffect } from "react"
import {
  X,
  Send,
  Paperclip,
  CheckCircle,
  Clock,
  Shield,
  User,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Lock,
} from "lucide-react"
import { sanitizeHtml } from "@/utils/sanitize"
import {
  DemandeDevisContinue,
  DemandeDevisReponse,
} from "@/types/demande-devis-continue"

import RichTextEditor from "@/components/editor/RichTextEditor"
import DemandeDevisContinuesService from "@/services/DemandeDevisContinuesService"

interface Props {
  demande: DemandeDevisContinue | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onError?: (msg: string) => void  // ✅ FIX 3 — callback toast erreur vers page parente
}

export default function RepondreDemandeDevisModal({
  demande,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reponses, setReponses] = useState<DemandeDevisReponse[]>([])
  const [loadingReponses, setLoadingReponses] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ✅ FIX 4 — La demande est-elle déjà traitée ? */
  const isReadOnly = demande?.statut === "FERMEE"

  /* ================= LOAD REPONSES ================= */
  const loadReponses = async () => {
    if (!demande) return
    try {
      setLoadingReponses(true)
      const data = await DemandeDevisContinuesService.getReponses(demande.id)
      setReponses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingReponses(false)
    }
  }

  const handleFile = (file: File | null) => {
  if (!file) return setFile(null)

  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    setError("Fichier non supporté")
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("Fichier trop volumineux (max 5MB)")
    return
  }

  setFile(file)
}

  useEffect(() => {
  let mounted = true

  const load = async () => {
    if (!demande || !isOpen) return

    try {
      setLoadingReponses(true)

      const data = await DemandeDevisContinuesService.getReponses(demande.id)

      if (mounted) {
        setReponses(data)
      }

    } catch (err) {
      console.error(err)
    } finally {
      if (mounted) {
        setLoadingReponses(false)
      }
    }
  }

  load()

  return () => {
    mounted = false
  }

}, [isOpen, demande?.id])

  if (!isOpen || !demande) return null

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (isReadOnly) return  // ✅ FIX 4 — garde supplémentaire

    if (!message.trim()) {
      setError("Veuillez rédiger un message.")
      return
    }

    try {
      setSending(true)
      setError(null)

      const formData = new FormData()
      formData.append("message", message)
      if (file) formData.append("pieceJointe", file)

      await DemandeDevisContinuesService.repondre(demande.id, formData)

      setMessage("")
      setFile(null)

      /* ✅ FIX 1 — onSuccess ferme + recharge la liste principale (statut TRAITEE mis à jour) */
      onSuccess()

    } catch (err) {

  const message =
    err instanceof Error
      ? err.message
      : "Une erreur est survenue"

  setError(message)
  onError?.(message)

} finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setMessage("")
    setFile(null)
    setError(null)
    onClose()
  }

  /* ================= RENDER ================= */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]
                   animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className={`absolute inset-0 bg-gradient-to-r ${isReadOnly ? "from-gray-500 to-gray-600" : "from-[#00A4E0] to-[#0077A8]"}`} />
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="relative px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md" />
                <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-1 ring-white/30">
                  {/* ✅ FIX 4 — icône différente si read-only */}
                  {isReadOnly
                    ? <Lock size={20} className="text-white" />
                    : <MessageSquare size={22} className="text-white" />
                  }
                </div>
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">
                  {isReadOnly ? "Historique de la demande" : "Répondre à la demande"}
                </h2>
                <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1.5">
                  <Sparkles size={11} />
                  #{demande.id} · {new Date(demande.dateDemande).toLocaleDateString("fr-FR")}
                  {isReadOnly && (
                    <span className="ml-1 inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      <CheckCircle size={9} /> Traitée
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center
                         text-white transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* CLIENT INFO STRIP */}
        <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${isReadOnly ? "from-gray-400 to-gray-500" : "from-[#00A4E0] to-[#0077A8]"} flex items-center justify-center shadow-sm`}>
              <span className="text-white text-[10px] font-bold">{demande.nomClient.charAt(0).toUpperCase()}</span>
            </div>
            <span className="font-semibold text-gray-800">{demande.nomClient}</span>
          </div>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">{demande.email}</span>
        </div>

        {/* ✅ FIX 4 — Banner read-only */}
        {isReadOnly && (
          <div className="px-6 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2.5 flex-shrink-0">
            <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-700">
              Cette demande a déjà été traitée. La réponse n'est plus possible.
            </p>
          </div>
        )}

        {/* BODY */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {/* HISTORIQUE */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Historique</p>
              {!loadingReponses && reponses.length > 0 && (
                <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${isReadOnly ? "from-gray-400 to-gray-500" : "from-[#00A4E0] to-[#0077A8]"} flex items-center justify-center`}>
                  <span className="text-white text-[9px] font-bold">{reponses.length}</span>
                </div>
              )}
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1">
              {loadingReponses && (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                      <div className="flex-1 h-14 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>
              )}

              {!loadingReponses && reponses.length === 0 && (
                <div className="py-6 text-center text-sm text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                  Aucun message pour cette demande
                </div>
              )}

              {reponses.map((r, idx) => {
                const admin = r.envoyePar === "ADMIN"
                return (
                  <div
                    key={r.id}
                    className={`flex items-end gap-2.5 ${admin ? "flex-row-reverse" : "flex-row"}`}
                    style={{ animation: `slideUp 0.3s ease-out ${idx * 0.06}s both` }}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mb-1 shadow-sm ${
                      admin
                        ? "bg-gradient-to-br from-[#00A4E0] to-[#0077A8]"
                        : "bg-gradient-to-br from-gray-200 to-gray-300"
                    }`}>
                      {admin ? <Shield size={13} className="text-white" /> : <User size={13} className="text-gray-500" />}
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      admin
                        ? "bg-gradient-to-br from-[#00A4E0] to-[#0077A8] text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-md"
                    }`}>
                      <div className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${admin ? "text-white/60" : "text-gray-400"}`}>
                        {admin ? "Admin" : "Client"}
                      </div>
                      <div
  dangerouslySetInnerHTML={{ __html: sanitizeHtml(r.message) }}
/>
                      {r.pieceJointeUrl && (
                        <a
                          href={r.pieceJointeUrl}
                          target="_blank"
                          className={`flex items-center gap-1.5 mt-2 text-[11px] underline ${admin ? "text-white/80" : "text-[#00A4E0]"}`}
                        >
                          <Paperclip size={10} /> Pièce jointe
                        </a>
                      )}
                      <div className={`flex items-center gap-1 text-[10px] mt-2 ${admin ? "text-white/50" : "text-gray-400"}`}>
                        <Clock size={9} />
                        {new Date(r.dateEnvoi).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ✅ FIX 4 — Zone de réponse masquée si read-only */}
          {!isReadOnly && (
            <>
              {/* DIVIDER */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Nouveau message</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* EDITOR */}
              <RichTextEditor value={message} onChange={setMessage} />

              {/* FILE */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border-2 border-dashed
                            transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  file
                    ? "border-[#00A4E0] text-[#00A4E0] bg-blue-50"
                    : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500"
                }`}
              >
                <Paperclip size={14} />
                {file ? file.name : "Ajouter une pièce jointe"}
              </button>

              {/* ✅ FIX 2 — Erreur backend réelle */}
              {error && (
                <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* SUBMIT */}
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="group relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden
                           hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0077A8] to-[#00A4E0] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Envoyer la réponse
                    </>
                  )}
                </span>
              </button>
            </>
          )}

          {/* ✅ FIX 4 — Bouton fermer seul si read-only */}
          {isReadOnly && (
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm
                         hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Fermer
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}