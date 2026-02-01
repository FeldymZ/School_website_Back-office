import { useEffect, useState } from "react";
import { Mail, AlertCircle, Sparkles } from "lucide-react";
import { ContactService } from "@/services/contactService";
import type { ContactMessage } from "@/types/contact";
import ContactTable from "@/components/contact/ContactTable";

export default function ContactUnrepliedPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchUnreplied = async () => {
      try {
        setLoading(true);
        const data = await ContactService.getUnreplied();
        if (!cancelled) {
          setMessages(data);
        }
      } catch (error) {
        console.error("❌ Erreur chargement messages non répondus:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUnreplied();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Mail className="w-10 h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-3 text-[#00A4E0]">
              <div className="w-6 h-6 border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-semibold">Chargement des messages...</span>
            </div>
            <p className="text-sm text-[#A6A6A6] mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
            <AlertCircle className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Messages non répondus
              <Sparkles size={18} className="text-red-500 animate-pulse" />
            </h1>
            <p className="text-sm text-gray-500">
              {messages.length} message{messages.length > 1 ? 's' : ''} en attente de réponse
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl">
            <span className="text-red-700 font-bold text-lg">{messages.length}</span>
            <span className="text-red-600 text-sm ml-2">à traiter</span>
          </div>
        )}
      </div>

      {/* Alert si messages */}
      {messages.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 via-rose-50 to-red-50 rounded-xl border-2 border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-red-900">Action requise</p>
              <p className="text-sm text-red-700 mt-1">
                {messages.length} message{messages.length > 1 ? 's' : ''} {messages.length > 1 ? 'nécessitent' : 'nécessite'} votre attention.
                Veuillez y répondre dès que possible pour maintenir une bonne relation avec vos clients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <ContactTable messages={messages} />

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
