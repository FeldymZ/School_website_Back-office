import { useEffect, useState } from "react";
import { Mail, ChevronLeft, ChevronRight, Sparkles, RefreshCw, Inbox, CheckCircle2, Clock } from "lucide-react";
import { ContactService } from "@/services/contactService";
import type { ContactMessage } from "@/types/contact";
import ContactTable from "@/components/contact/ContactTable";
import ContactSearchBar from "@/components/contact/ContactSearchBar";
import ContactDetailsModal from "@/components/contact/ContactDetailsModal";

type StatusFilter = "all" | "pending" | "replied";

// Maps the UI filter to the `replied` flag sent to ContactService.search.
// ASSUMPTION: ContactService.search now accepts a 3rd argument `replied?: boolean`
// (undefined = no filter, false = pending only, true = replied only).
// If your backend/service uses a different param name, adjust this mapping
// and the call below accordingly.
function toRepliedParam(filter: StatusFilter): boolean | undefined {
  if (filter === "pending") return false;
  if (filter === "replied") return true;
  return undefined;
}

export default function ContactListPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await ContactService.search(q, page, 10, toRepliedParam(statusFilter));
      setMessages(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements ?? null);
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 0 whenever the search term or the status filter changes,
  // so we don't end up requesting a page that no longer exists for the new filter.
  useEffect(() => {
    setPage(0);
  }, [q, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const res = await ContactService.search(q, page, 10, toRepliedParam(statusFilter));
        if (!cancelled) {
          setMessages(res.content);
          setTotalPages(res.totalPages);
          setTotalElements(res.totalElements ?? null);
        }
      } catch (error) {
        console.error("Erreur chargement messages:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [q, page, statusFilter]);

  const filters: { key: StatusFilter; label: string; icon: typeof Inbox }[] = [
    { key: "all", label: "Tous", icon: Inbox },
    { key: "pending", label: "En attente", icon: Clock },
    { key: "replied", label: "Répondu", icon: CheckCircle2 },
  ];

  /* ================= LOADING ================= */
  if (loading && messages.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 sm:p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Mail className="w-7 h-7 sm:w-10 sm:h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-2.5 sm:gap-3 text-[#00A4E0]">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm sm:text-lg font-semibold">Chargement des messages...</span>
            </div>
            <p className="text-xs sm:text-sm text-[#A6A6A6] mt-2.5 sm:mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="w-full space-y-4 sm:space-y-8">
        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0]/10 to-[#0077A8]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100/50 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative px-4 py-4 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6">
              <div className="space-y-3 sm:space-y-4 flex-1 min-w-0">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative group flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                      <Mail className="text-white w-5 h-5 sm:w-7 sm:h-7" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-3xl lg:text-4xl font-black text-gray-900 mb-0.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                      <span className="truncate">Messages de contact</span>
                      <Sparkles size={16} className="text-[#00A4E0] animate-pulse flex-shrink-0 hidden xs:block" />
                    </h1>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                      Tous les messages reçus via le formulaire de contact.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto">
                <ContactSearchBar value={q} onChange={setQ} />
              </div>
            </div>

            {/* ============ STATUS FILTER ============ */}
            <div className="flex gap-2 mt-4 sm:mt-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
              {filters.map(({ key, label, icon: Icon }) => {
                const active = statusFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold
                                border-2 transition-all min-h-[40px] whitespace-nowrap
                                ${
                                  active
                                    ? "bg-gradient-to-r from-[#00A4E0] to-[#0077A8] border-transparent text-white shadow-md"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= TABLE / CARDS ================= */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1 sm:px-0">
            <h2 className="text-sm sm:text-lg font-bold text-gray-900">
              {statusFilter === "all" && "Liste des messages"}
              {statusFilter === "pending" && "Messages en attente"}
              {statusFilter === "replied" && "Messages répondus"}
              {totalElements !== null && (
                <span className="ml-2 text-xs sm:text-sm font-medium text-gray-400">
                  ({totalElements})
                </span>
              )}
            </h2>
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[#00A4E0] hover:text-[#0077A8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                         min-h-[36px] -mr-2 px-2 rounded-lg active:bg-[#cfe3ff]/40"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden xs:inline">{loading ? "Actualisation..." : "Actualiser"}</span>
            </button>
          </div>

          <ContactTable messages={messages} onViewMessage={setSelectedId} />

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 sm:px-0">
              <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                Page {page + 1} sur {totalPages}
              </p>

              <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 text-sm
                             min-h-[44px]
                             hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  <ChevronLeft size={16} />
                  Précédent
                </button>

                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl font-semibold text-white text-sm
                             min-h-[44px]
                             bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                             hover:shadow-lg sm:hover:scale-105 active:scale-[0.98]
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                             transition-all duration-200"
                >
                  Suivant
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <ContactDetailsModal
          messageId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={fetchMessages}
        />
      )}
    </div>
  );
}