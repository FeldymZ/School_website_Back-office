import { useEffect, useState } from "react";
import { X, Save, Loader, Newspaper, FileText, Hash, Eye, EyeOff, Sparkles } from "lucide-react";
import { ActualiteService } from "@/services/actualiteService";
import RichTextEditor from "../editor/RichTextEditor";
import { normalizeHtml } from "@/utils/html";

interface Props {
  id: number;
  onClose: () => void;
  onUpdated: () => void;
}

// Interface pour typer la réponse de l'API
interface ActualiteEditData {
  title: string;
  content: string;
  displayOrder?: number;
  publishedAt?: string | null;
}

const ActualiteEditModal = ({ id, onClose, onUpdated }: Props) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const data = await ActualiteService.getById(id) as ActualiteEditData;

      if (!cancelled) {
        setTitle(data.title);
        setContent(data.content);
        setDisplayOrder(data.displayOrder ?? 0);
        setEnabled(!!data.publishedAt);
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async () => {
    setSaving(true);

    await ActualiteService.update(id, {
      title,
      content: normalizeHtml(content),
      displayOrder,
      enabled,
    });

    onUpdated();
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 text-[#00A4E0]">
            <div className="w-6 h-6 border-2 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Chargement de l'actualité...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <Newspaper className="text-white" size={26} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Modifier l'actualité
                  <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Mettez à jour les informations de l'actualité
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Titre */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Newspaper size={16} className="text-[#00A4E0]" />
              Titre de l'actualité
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Nouvelle rentrée académique 2024"
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Contenu */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText size={16} className="text-[#00A4E0]" />
              Contenu
              <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ordre d'affichage */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Hash size={16} className="text-[#00A4E0]" />
                Ordre d'affichage
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  min="0"
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                             focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                             transition-all hover:border-gray-300"
                />
              </div>
              <p className="text-xs text-gray-500">
                Plus le nombre est petit, plus l'actualité est prioritaire
              </p>
            </div>

            {/* Statut Publication */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Eye size={16} className="text-[#00A4E0]" />
                Statut de publication
              </label>
              <div className="relative overflow-hidden rounded-xl border-2 border-[#cfe3ff] bg-gradient-to-r from-[#cfe3ff]/20 to-transparent p-4 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow transition-all ${
                      enabled
                        ? "bg-gradient-to-br from-[#00A4E0] to-[#0077A8]"
                        : "bg-gradient-to-br from-[#A6A6A6] to-gray-500"
                    }`}>
                      {enabled ? (
                        <Eye size={18} className="text-white" />
                      ) : (
                        <EyeOff size={18} className="text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {enabled ? "Publié" : "Brouillon"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {enabled
                          ? "Visible pour tous"
                          : "Visible uniquement pour vous"}
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A4E0]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00A4E0] peer-checked:to-[#0077A8]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 py-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700
                       hover:bg-gray-100 hover:border-gray-300 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:shadow-lg hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader size={18} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} />
                Enregistrer les modifications
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
          animation: zoom-in-95 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ActualiteEditModal;
