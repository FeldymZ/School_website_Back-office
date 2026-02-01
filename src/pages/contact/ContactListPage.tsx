import { useEffect, useState } from "react";
import { Mail, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ContactService } from "@/services/contactService";
import type { ContactMessage } from "@/types/contact";
import ContactTable from "@/components/contact/ContactTable";
import ContactSearchBar from "@/components/contact/ContactSearchBar";

export default function ContactListPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await ContactService.search(q, page);
        if (!cancelled) {
          setMessages(res.content);
          setTotalPages(res.totalPages);
        }
      } catch (error) {
        console.error("❌ Erreur chargement messages:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [q, page]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
            <Mail className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Messages de contact
              <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
            </h1>
            <p className="text-sm text-gray-500">
              Tous les messages reçus
            </p>
          </div>
        </div>

        <ContactSearchBar value={q} onChange={setQ} />
      </div>

      {/* Table */}
      <ContactTable messages={messages} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page + 1} sur {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 font-semibold text-gray-700
                         hover:bg-gray-100 hover:border-gray-300 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              <ChevronLeft size={18} />
              Précédent
            </button>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                         hover:shadow-lg hover:scale-105 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-200"
            >
              Suivant
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

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
