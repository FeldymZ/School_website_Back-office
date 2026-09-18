import { useEffect, useRef, useState } from "react";
import { X, Send, Loader, Sparkles, Paperclip, Mail, MessageSquareQuote } from "lucide-react";
import toast from "react-hot-toast";
import { ContactService } from "@/services/contactService";
import type { ContactMessage } from "@/types/contact";

interface Props {
  messageId: number;
  onClose: () => void;
  onSuccess: () => void;
  originalMessage?: Pick<ContactMessage, "senderName" | "senderEmail" | "message" | "sentAt">;
}

const CLOSE_DRAG_THRESHOLD = 120; // px before a swipe-down closes the sheet
const MAX_ATTACHMENT_MB = 10;

export default function ContactReplyModal({ messageId, onClose, onSuccess, originalMessage }: Props) {
  const [replyMessage, setReplyMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const isDragging = useRef(false);

  const handleClose = () => {
    if (loading) return; // don't allow dismiss mid-submit
    setIsClosing(true);
    window.setTimeout(onClose, 200);
  };

  const submit = async () => {
    if (!replyMessage.trim()) {
      toast.error("La réponse est obligatoire");
      return;
    }

    try {
      setLoading(true);
      await ContactService.reply(messageId, replyMessage, attachment ?? undefined);
      toast.success("Réponse envoyée avec succès");
      onSuccess();
    } catch (error) {
      console.error("❌ Erreur envoi réponse:", error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file && file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      toast.error(`Le fichier dépasse ${MAX_ATTACHMENT_MB} Mo`);
      return;
    }
    setAttachment(file);
  };

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Lock body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Focus trap
  useEffect(() => {
    closeBtnRef.current?.focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, []);

  // Swipe-down-to-dismiss (mobile only, via the drag handle / header)
  const onTouchStart = (e: React.TouchEvent) => {
    if (loading) return;
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    dragStartY.current = null;
    if (dragY > CLOSE_DRAG_THRESHOLD) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4
                  transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reply-modal-title"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: isDragging.current ? "none" : "transform 0.25s cubic-bezier(0.32,0.72,0,1)",
        }}
        className={`relative bg-white w-full sm:max-w-2xl
                   h-[92vh] sm:h-auto sm:max-h-[90vh]
                   overflow-y-auto overscroll-contain
                   rounded-t-2xl sm:rounded-2xl
                   shadow-2xl flex flex-col
                   ${isClosing ? "animate-out-down sm:animate-out-fade" : "animate-in-up sm:animate-in-zoom"}`}
      >
        {/* Drag handle (mobile only) */}
        <div
          className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div
          className="relative overflow-hidden flex-shrink-0 touch-none sm:touch-auto"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between gap-3 px-4 sm:px-8 py-3.5 sm:py-6 border-b border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative group flex-shrink-0 hidden sm:block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="text-white" size={26} />
                </div>
              </div>
              <div className="min-w-0">
                <h2
                  id="reply-modal-title"
                  className="text-base sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 truncate"
                >
                  Répondre au message
                  <Sparkles size={16} className="text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
                  Envoyez votre réponse par email
                </p>
              </div>
            </div>

            <button
              ref={closeBtnRef}
              onClick={handleClose}
              disabled={loading}
              className="p-2.5 -mr-1 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors flex-shrink-0
                         min-w-[44px] min-h-[44px] flex items-center justify-center
                         disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
            {/* Message original */}
            {originalMessage && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                  <MessageSquareQuote size={14} className="text-[#00A4E0] flex-shrink-0" />
                  Message auquel vous répondez
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 space-y-2">
                  <div className="flex items-start justify-between flex-wrap gap-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                      {originalMessage.senderName}
                      <span className="font-normal text-gray-500 ml-1.5 sm:ml-2 block sm:inline text-[11px] sm:text-sm break-all">
                        &lt;{originalMessage.senderEmail}&gt;
                      </span>
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#A6A6A6] flex-shrink-0">
                      {new Date(originalMessage.sentAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words border-l-2 border-[#00A4E0]/30 pl-3">
                    {originalMessage.message}
                  </p>
                </div>
              </div>
            )}

            {/* Réponse */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <Sparkles size={14} className="text-[#00A4E0] flex-shrink-0" />
                Votre réponse
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
                placeholder="Écrivez votre réponse ici..."
                className="w-full border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300 resize-none"
              />
              <p className="text-[11px] sm:text-xs text-[#A6A6A6]">{replyMessage.length} caractères</p>
            </div>

            {/* Attachment */}
            <div className="space-y-2.5 sm:space-y-3">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <Paperclip size={14} className="text-[#00A4E0] flex-shrink-0" />
                Pièce jointe (optionnelle)
              </label>

              {attachment ? (
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border-2 border-[#00A4E0]/20 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {attachment.name}
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#A6A6A6]">
                      {(attachment.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setAttachment(null)}
                    className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:scale-95 transition-all
                               min-w-[40px] min-h-[40px] flex items-center justify-center flex-shrink-0"
                    aria-label="Retirer la pièce jointe"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="group relative block cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                  <div className="border-2 border-dashed border-[#00A4E0]/30 rounded-xl p-5 sm:p-8 text-center hover:border-[#00A4E0] hover:bg-[#cfe3ff]/10 active:bg-[#cfe3ff]/20 transition-all">
                    <Paperclip className="w-6 h-6 sm:w-8 sm:h-8 text-[#00A4E0] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">Ajouter une pièce jointe</p>
                    <p className="text-[11px] sm:text-xs text-[#A6A6A6] mt-1">
                      PDF, DOC, images jusqu'à {MAX_ATTACHMENT_MB}MB
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3
                     px-4 sm:px-8 py-4 sm:py-6
                     border-t border-gray-100 bg-white/95 backdrop-blur-sm
                     flex-shrink-0
                     pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-6
                     sticky bottom-0"
        >
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 min-h-[48px] px-5 sm:px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 text-sm sm:text-base
                       hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={!replyMessage.trim() || loading}
            className="flex-1 min-h-[48px] px-5 sm:px-6 py-3 rounded-xl font-medium text-white text-sm sm:text-base
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:shadow-lg sm:hover:scale-105 active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send size={18} />
                Envoyer la réponse
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes in-up {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes out-down {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(60px); }
        }
        @keyframes in-zoom {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes out-fade {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.97); }
        }
        .animate-in-up { animation: in-up 0.28s cubic-bezier(0.32,0.72,0,1) both; }
        .animate-out-down { animation: out-down 0.2s cubic-bezier(0.32,0.72,0,1) both; }
        .animate-in-zoom { animation: in-zoom 0.2s ease-out both; }
        .animate-out-fade { animation: out-fade 0.18s ease-in both; }
      `}</style>
    </div>
  );
}