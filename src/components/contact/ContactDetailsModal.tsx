import { useEffect, useState, useCallback, useRef } from "react";
import {
  X,
  Mail,
  CheckCircle,
  Send,
  Paperclip,
  Sparkles,
  Clock,
} from "lucide-react";
import { ContactService } from "@/services/contactService";
import type { ContactMessage } from "@/types/contact";
import ContactReplyModal from "@/components/contact/ContactReplyModal";

interface Props {
  messageId: number;
  onClose: () => void;
  onUpdated?: () => void;
}

const CLOSE_DRAG_THRESHOLD = 120; // px before a swipe-down closes the sheet

export default function ContactDetailsModal({ messageId, onClose, onUpdated }: Props) {
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const isDragging = useRef(false);

  const loadMessage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ContactService.getOne(messageId);
      setMessage(res);
    } catch (err) {
      console.error("❌ Erreur chargement message:", err);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    loadMessage();
  }, [loadMessage]);

  // Smooth close: play the exit animation, then unmount
  const handleClose = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(onClose, 200);
  }, [onClose]);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  // Lock body scroll while open (prevents background scroll-bleed on iOS)
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Focus the close button on mount, and trap Tab inside the sheet
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

  // Swipe-down-to-dismiss (mobile only, via the drag handle area)
  const onTouchStart = (e: React.TouchEvent) => {
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
        aria-labelledby="contact-modal-title"
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
        {/* Drag handle (mobile only) — swipe down to close */}
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
                  id="contact-modal-title"
                  className="text-base sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2"
                >
                  <span className="truncate">
                    {message ? `Message de ${message.senderName}` : "Détails du message"}
                  </span>
                  <Sparkles size={16} className="text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
                  Détails et réponse au message
                </p>
              </div>
            </div>

            <button
              ref={closeBtnRef}
              onClick={handleClose}
              className="p-2.5 -mr-1 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors flex-shrink-0
                         min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content (scrollable area) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 animate-pulse" aria-label="Chargement">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="h-16 sm:h-20 bg-gray-100 rounded-xl" />
                <div className="h-16 sm:h-20 bg-gray-100 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-28 sm:h-32 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ) : !message ? (
            <div className="p-4 sm:p-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 sm:p-6 text-center">
                <p className="text-red-700 font-semibold text-sm sm:text-base">Message introuvable</p>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border border-[#00A4E0]/20 rounded-xl min-w-0">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                    {message.senderEmail}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border border-[#00A4E0]/20 rounded-xl min-w-0">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Date
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {new Date(message.sentAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                  <Sparkles size={14} className="text-[#00A4E0] flex-shrink-0" />
                  Message
                </label>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                  <p className="whitespace-pre-wrap break-words text-gray-800 text-sm sm:text-base">
                    {message.message}
                  </p>
                </div>
              </div>

              {message.replied && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-green-700 font-semibold text-sm sm:text-base">
                      <CheckCircle size={18} className="flex-shrink-0" />
                      Réponse envoyée
                    </div>
                    {message.repliedAt && (
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-green-700/80 font-medium">
                        <Clock size={12} className="flex-shrink-0" />
                        {new Date(message.repliedAt).toLocaleString("fr-FR")}
                      </div>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap break-words text-gray-800 text-sm sm:text-base">
                    {message.replyMessage}
                  </p>
                  {message.attachmentUrl && (
                    <a
                      href={message.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-700 underline text-sm font-medium
                                 min-h-[44px] py-2"
                    >
                      <Paperclip size={16} className="flex-shrink-0" />
                      Télécharger la pièce jointe
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {message && !message.replied && (
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
              className="flex-1 min-h-[48px] px-5 sm:px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 text-sm sm:text-base
                         hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all"
            >
              Fermer
            </button>
            <button
              onClick={() => setReplyOpen(true)}
              className="flex-1 min-h-[48px] px-5 sm:px-6 py-3 rounded-xl font-medium text-white text-sm sm:text-base
                         bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                         hover:shadow-lg sm:hover:scale-105 active:scale-[0.98]
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Répondre
            </button>
          </div>
        )}
      </div>

      {/* Reply modal */}
      {replyOpen && message && (
        <ContactReplyModal
          messageId={message.id}
          originalMessage={{
            senderName: message.senderName,
            senderEmail: message.senderEmail,
            message: message.message,
            sentAt: message.sentAt,
          }}
          onClose={() => setReplyOpen(false)}
          onSuccess={async () => {
            setReplyOpen(false);
            await loadMessage();
            onUpdated?.();
          }}
        />
      )}

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