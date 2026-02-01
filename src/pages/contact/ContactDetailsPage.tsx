import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  CheckCircle,
  Send,
  Paperclip,
  Sparkles,
} from "lucide-react";
import { ContactService } from "@/services/contactService";
import type { ContactMessage } from "@/types/contact";
import ContactReplyModal from "@/components/contact/ContactReplyModal";

export default function ContactDetailsPage() {
  const { id } = useParams();
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD MESSAGE (UNIQUE) ================= */

  const loadMessage = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await ContactService.getOne(Number(id));
      setMessage(res);
    } catch (err) {
      console.error("❌ Erreur chargement message:", err);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMessage();
  }, [loadMessage]);

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center">
        <p className="text-[#00A4E0] font-semibold">
          Chargement du message…
        </p>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-semibold">
            Message introuvable
          </p>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 text-[#00A4E0] hover:text-[#0077A8] font-semibold"
        >
          <ArrowLeft size={20} />
          Retour aux messages
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Titre */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
            <Mail className="text-white" size={32} />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Message de {message.senderName}
              <Sparkles size={20} className="text-[#00A4E0] animate-pulse" />
            </h1>
          </div>

          {!message.replied && (
            <button
              onClick={() => setOpen(true)}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#00A4E0] to-[#0077A8]"
            >
              <span className="flex items-center gap-2">
                <Send size={18} />
                Répondre
              </span>
            </button>
          )}
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <p><strong>Email :</strong> {message.senderEmail}</p>
          <p>
            <strong>Date :</strong>{" "}
            {new Date(message.sentAt).toLocaleString("fr-FR")}
          </p>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>

        {/* Réponse */}
        {message.replied && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <CheckCircle size={20} />
              Réponse envoyée
            </div>

            <p className="whitespace-pre-wrap">{message.replyMessage}</p>

            {message.attachmentUrl && (
              <a
                href={message.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-700 underline"
              >
                <Paperclip size={16} />
                Télécharger la pièce jointe
              </a>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <ContactReplyModal
          messageId={message.id}
          onClose={() => setOpen(false)}
          onSuccess={async () => {
            setOpen(false);
            await loadMessage();
          }}
        />
      )}
    </div>
  );
}
