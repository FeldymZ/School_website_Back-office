import { useEffect, useState, useCallback } from "react";
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

export default function ContactDetailsModal({ messageId, onClose, onUpdated }: Props) {
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="text-white" size={26} />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 truncate">
                  <span className="truncate">
                    {message ? `Message de ${message.senderName}` : "Détails du message"}
                  </span>
                  <Sparkles size={18} className="text-[#00A4E0] animate-pulse flex-shrink-0" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">Détails et réponse au message</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 mx-auto mb-4 border-4 border-[#00A4E0]/30 border-t-[#00A4E0] rounded-full animate-spin" />
            <p className="text-[#00A4E0] font-semibold">Chargement du message…</p>
          </div>
        ) : !message ? (
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 font-semibold">Message introuvable</p>
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border border-[#00A4E0]/20 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium text-gray-900">{message.senderEmail}</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border border-[#00A4E0]/20 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(message.sentAt).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Sparkles size={16} className="text-[#00A4E0]" />
                Message
              </label>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="whitespace-pre-wrap text-gray-800">{message.message}</p>
              </div>
            </div>

            {message.replied && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <CheckCircle size={20} />
                    Réponse envoyée
                  </div>
                  {message.repliedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-green-700/80 font-medium">
                      <Clock size={13} />
                      {new Date(message.repliedAt).toLocaleString("fr-FR")}
                    </div>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-gray-800">{message.replyMessage}</p>
                {message.attachmentUrl && (
                  <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-700 underline text-sm font-medium"
                  >
                    <Paperclip size={16} />
                    Télécharger la pièce jointe
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {message && !message.replied && (
          <div className="flex gap-3 px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700
                         hover:bg-gray-100 hover:border-gray-300 transition-all"
            >
              Fermer
            </button>
            <button
              onClick={() => setReplyOpen(true)}
              className="flex-1 px-6 py-3 rounded-xl font-medium text-white
                         bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                         hover:shadow-lg hover:scale-105 active:scale-95
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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .zoom-in-95 {
          animation: zoom-in-95 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}