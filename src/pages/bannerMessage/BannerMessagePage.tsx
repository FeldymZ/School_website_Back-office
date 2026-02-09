// BannerMessagePage.tsx
import { useEffect, useState } from "react";
import { Plus, Image, Sparkles, Info,  RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import type { BannerMessage } from "@/types/bannerMessage";
import { BannerMessageService } from "@/services/bannerMessage.service";

import BannerMessageList from "@/components/bannerMessage/BannerMessageList";
import BannerMessageCreateModal from "@/components/bannerMessage/BannerMessageCreateModal";
import BannerMessageEditModal from "@/components/bannerMessage/BannerMessageEditModal";
import BannerMessagePreview from "@/components/bannerMessage/BannerMessagePreview";

export default function BannerMessagePage() {
  const [messages, setMessages] = useState<BannerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editMessage, setEditMessage] = useState<BannerMessage | null>(null);

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      setLoading(true);
      const data = await BannerMessageService.getAll();
      setMessages(data);
    } catch {
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setLoading(false);
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    load();
  }, []);

  const activeMessage = messages.find((m) => m.active) ?? null;


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 lg:p-6 xl:p-8">
      <div className="w-full space-y-8">
        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0]/10 to-[#0077A8]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100/50 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative px-6 py-8 lg:px-8 lg:py-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Titre et description */}
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                      <Image className="text-white" size={28} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2">
                      Messages de bannière
                    </h1>
                    <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                      Gérez les messages affichés publiquement en bas du site.
                       Un seul message peut être actif à la fois.
                    </p>
                  </div>
                </div>


              </div>

              {/* Bouton créer */}
              <button
                onClick={() => setCreateOpen(true)}
                className="
                  group relative inline-flex items-center justify-center gap-2
                  px-6 py-4 rounded-xl
                  font-bold text-white text-sm lg:text-base
                  bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                  shadow-lg shadow-[#00A4E0]/30
                  hover:shadow-xl hover:shadow-[#00A4E0]/40
                  hover:scale-105 active:scale-95
                  transition-all duration-300
                  overflow-hidden
                "
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Plus size={20} className="relative z-10" />
                <span className="relative z-10">Nouveau message</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= INFO BOX ================= */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Info size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-900 mb-1">
              À propos des bannières
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Les messages de bannière apparaissent en bas du site pour informer
              les visiteurs. Seul le message actif sera visible publiquement.
              Désactivez le message actuel avant d'en activer un nouveau.
            </p>
          </div>
        </div>

        {/* ================= PREVIEW ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-[#00A4E0]" />
              <h2 className="text-lg font-bold text-gray-900">
                Aperçu public
              </h2>
            </div>

            {activeMessage && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">
                  Message actif
                </span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-[#00A4E0]/30 border-t-[#00A4E0] rounded-full animate-spin" />
                <p className="text-sm text-gray-500 font-medium">
                  Chargement de l'aperçu...
                </p>
              </div>
            ) : (
              <BannerMessagePreview message={activeMessage} />
            )}
          </div>
        </div>

        {/* ================= LIST ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Tous les messages
            </h2>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-medium text-[#00A4E0] hover:text-[#0077A8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Actualisation..." : "Actualiser"}
            </button>
          </div>

          <BannerMessageList
            messages={messages}
            onEdit={setEditMessage}
            onRefresh={load}
          />
        </div>
      </div>

      {/* ================= MODALS ================= */}
      <BannerMessageCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          load();
        }}
      />

      <BannerMessageEditModal
        message={editMessage}
        onClose={() => setEditMessage(null)}
        onUpdated={() => {
          setEditMessage(null);
          load();
        }}
      />
    </div>
  );
}
