import { useState } from "react";
import { X, Send, Loader, Sparkles, Paperclip, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { ContactService } from "@/services/contactService";

interface Props {
  messageId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContactReplyModal({ messageId, onClose, onSuccess }: Props) {
  const [replyMessage, setReplyMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="text-white" size={26} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Répondre au message
                  <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">Envoyez votre réponse par email</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Message */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Sparkles size={16} className="text-[#00A4E0]" />
              Votre réponse
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={8}
              placeholder="Écrivez votre réponse ici..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300 resize-none"
            />
            <p className="text-xs text-[#A6A6A6]">{replyMessage.length} caractères</p>
          </div>

          {/* Attachment */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Paperclip size={16} className="text-[#00A4E0]" />
              Pièce jointe (optionnelle)
            </label>

            {attachment ? (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border-2 border-[#00A4E0]/20 rounded-xl">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{attachment.name}</p>
                  <p className="text-xs text-[#A6A6A6]">
                    {(attachment.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setAttachment(null)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label className="group relative block cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  className="sr-only"
                />
                <div className="border-2 border-dashed border-[#00A4E0]/30 rounded-xl p-8 text-center hover:border-[#00A4E0] hover:bg-[#cfe3ff]/10 transition-all">
                  <Paperclip className="w-8 h-8 text-[#00A4E0] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold text-gray-900">Ajouter une pièce jointe</p>
                  <p className="text-xs text-[#A6A6A6] mt-1">PDF, DOC, images jusqu'à 10MB</p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700
                       hover:bg-gray-100 hover:border-gray-300 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={!replyMessage.trim() || loading}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:shadow-lg hover:scale-105 active:scale-95
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
