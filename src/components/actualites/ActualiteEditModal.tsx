import { useEffect, useState } from "react";
import {
  X,
  Save,
  Loader,
  Newspaper,
  FileText,
  Hash,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

import { ActualiteService } from "@/services/actualiteService";
import { ActualiteDetails } from "@/types/actualite";
import RichTextEditor from "../editor/RichTextEditor";
import { normalizeHtml } from "@/utils/html";

interface Props {
  id: number;
  onClose: () => void;
  onUpdated: () => void;
}

const ActualiteEditModal = ({ id, onClose, onUpdated }: Props) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [enabled, setEnabled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================
     LOAD DATA
     ========================= */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data: ActualiteDetails =
          await ActualiteService.getDetails(id);

        if (!cancelled) {
          setTitle(data.title);
          setContent(data.content);
          setDisplayOrder(data.displayOrder ?? 0);
          setEnabled(!!data.publishedAt);
          setLoading(false);
        }
      } catch (e) {
        console.error("Erreur chargement actualité", e);
        onClose();
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, onClose]);

  /* =========================
     SAVE
     ========================= */
  const handleSave = async () => {
    try {
      setSaving(true);

      await ActualiteService.update(id, {
        title,
        content: normalizeHtml(content),
        displayOrder,
        enabled,
      });

      onUpdated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     LOADING
     ========================= */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative bg-white rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0]/10 to-[#0077A8]/10 rounded-2xl" />
          <div className="relative flex items-center gap-4 text-[#00A4E0]">
            <div className="w-8 h-8 border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-lg">Chargement de l'actualité...</span>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="relative overflow-hidden sticky top-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8] opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

          <div className="relative flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <Newspaper className="text-white drop-shadow-lg" size={28} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-lg">
                  Modifier l'actualité
                  <Sparkles size={22} className="text-yellow-300 animate-pulse drop-shadow-lg" />
                </h2>
                <p className="text-sm text-white/90 mt-1 font-medium drop-shadow">
                  Mise à jour des informations de l'actualité
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110 active:scale-95 group"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white">
          {/* TITLE */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-bold text-gray-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                <Newspaper size={16} className="text-white" />
              </div>
              Titre de l'actualité
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Rentrée académique 2024-2025"
              className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-lg
                         focus:outline-none focus:ring-4 focus:ring-[#00A4E0]/20 focus:border-[#00A4E0]
                         transition-all hover:border-gray-300 placeholder:text-gray-400
                         shadow-sm hover:shadow-md"
            />
          </div>

          {/* CONTENT */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-bold text-gray-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                <FileText size={16} className="text-white" />
              </div>
              Contenu
            </label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors shadow-sm hover:shadow-md">
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ordre d'affichage */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-bold text-gray-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                  <Hash size={16} className="text-white" />
                </div>
                Ordre d'affichage
              </label>
              <div className="relative">
                <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  min="0"
                  className="w-full border-2 border-gray-200 rounded-xl pl-14 pr-5 py-4 text-lg
                             focus:outline-none focus:ring-4 focus:ring-[#00A4E0]/20 focus:border-[#00A4E0]
                             transition-all hover:border-gray-300 shadow-sm hover:shadow-md"
                />
              </div>
              <p className="text-xs text-gray-600 flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <Sparkles size={14} className="text-[#00A4E0]" />
                Plus le nombre est petit, plus l'actualité est prioritaire
              </p>
            </div>

            {/* Statut Publication */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-bold text-gray-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                  <Eye size={16} className="text-white" />
                </div>
                Publication
              </label>
              <div className="relative overflow-hidden rounded-2xl border-3 border-[#cfe3ff] bg-gradient-to-br from-[#cfe3ff]/20 to-transparent p-5 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                      enabled
                        ? "bg-gradient-to-br from-[#00A4E0] to-[#0077A8] scale-110"
                        : "bg-gradient-to-br from-[#A6A6A6] to-gray-500"
                    }`}>
                      {enabled ? (
                        <Eye size={20} className="text-white" />
                      ) : (
                        <EyeOff size={20} className="text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">
                        {enabled ? "Publié" : "Brouillon"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {enabled ? "Visible par tous" : "Visible uniquement pour vous"}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A4E0]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00A4E0] peer-checked:to-[#0077A8] shadow-inner"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 flex gap-4 px-8 py-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-8 py-4 rounded-xl border-2 border-gray-300 font-semibold text-gray-700
                       hover:bg-gray-100 hover:border-gray-400 hover:scale-[1.02] active:scale-95 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       shadow-lg hover:shadow-xl"
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-8 py-4 rounded-xl font-bold text-white text-lg
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:from-[#0088CC] hover:to-[#006699]
                       hover:shadow-2xl hover:shadow-[#00A4E0]/50 hover:scale-[1.02] active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-300 flex items-center justify-center gap-3
                       shadow-xl shadow-[#00A4E0]/30
                       relative overflow-hidden group/save"
          >
            {/* Effet shine */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/save:translate-x-[200%] transition-transform duration-1000" />

            {saving ? (
              <>
                <Loader size={22} className="animate-spin" />
                <span className="relative">Enregistrement...</span>
              </>
            ) : (
              <>
                <Save size={22} className="group-hover/save:scale-110 transition-transform" />
                <span className="relative">Enregistrer les modifications</span>
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
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .zoom-in-95 {
          animation: zoom-in-95 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default ActualiteEditModal;
