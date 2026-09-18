import { useState } from "react";
import { X, Save, Loader, Newspaper, FileText, Hash, Eye, EyeOff, Upload, Sparkles, Image as ImageIcon, Zap } from "lucide-react";
import { ActualiteService } from "@/services/actualiteService";
import RichTextEditor from "../editor/RichTextEditor";
import { normalizeHtml } from "@/utils/html";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const ActualiteCreateModal = ({ onClose, onCreated }: Props) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [enabled, setEnabled] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async () => {
    if (!title || !content || !coverImage) {
      alert("Tous les champs obligatoires doivent être remplis");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", normalizeHtml(content));
    formData.append("displayOrder", String(displayOrder));
    formData.append("enabled", String(enabled));
    formData.append("coverImage", coverImage);

    try {
      setLoading(true);
      await ActualiteService.create(formData);
      onCreated();
      onClose();
    } catch {
      alert("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden sticky top-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8] opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

          <div className="relative flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
                <div className="relative w-11 h-11 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <Newspaper className="text-white drop-shadow-lg w-5 h-5 sm:w-7 sm:h-7" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-3xl font-black text-white flex items-center gap-2 sm:gap-3 drop-shadow-lg truncate">
                  Nouvelle actualité
                  <Sparkles size={18} className="text-yellow-300 animate-pulse drop-shadow-lg flex-shrink-0 hidden sm:block" />
                </h2>
                <p className="text-xs sm:text-sm text-white/90 mt-0.5 sm:mt-1 font-medium drop-shadow hidden sm:block">
                  Créez et partagez des actualités percutantes
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110 active:scale-95 group flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8 space-y-5 sm:space-y-8 bg-gradient-to-b from-gray-50 to-white">
          {/* Titre */}
          <div className="space-y-2 sm:space-y-3">
            <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-800 flex-wrap">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0">
                <Newspaper size={14} className="text-white" />
              </div>
              Titre de l'actualité
              <span className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px] sm:text-xs font-semibold">Obligatoire</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Rentrée académique 2024-2025"
              className="w-full border-2 border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-lg
                         focus:outline-none focus:ring-4 focus:ring-[#00A4E0]/20 focus:border-[#00A4E0]
                         transition-all hover:border-gray-300 placeholder:text-gray-400
                         shadow-sm hover:shadow-md"
            />
          </div>

          {/* Contenu */}
          <div className="space-y-2 sm:space-y-3">
            <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-800 flex-wrap">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0">
                <FileText size={14} className="text-white" />
              </div>
              Contenu
              <span className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px] sm:text-xs font-semibold">Obligatoire</span>
            </label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors shadow-sm hover:shadow-md">
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* Image de couverture */}
          <div className="space-y-2 sm:space-y-3">
            <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-800 flex-wrap">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0">
                <ImageIcon size={14} className="text-white" />
              </div>
              Image de couverture
              <span className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px] sm:text-xs font-semibold">Obligatoire</span>
            </label>

            {preview ? (
              <div className="relative group">
                <div className="overflow-hidden rounded-xl sm:rounded-2xl border-2 sm:border-3 border-[#00A4E0] shadow-2xl shadow-[#00A4E0]/30">
                  <img
                    src={preview}
                    alt="Aperçu"
                    className="w-full h-44 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                </div>
                <button
                  onClick={() => {
                    setCoverImage(null);
                    setPreview("");
                  }}
                  className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 group/btn"
                >
                  <X size={16} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                </button>
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl border border-white/50">
                    <p className="text-xs sm:text-sm font-semibold text-[#00A4E0] flex items-center gap-1.5 sm:gap-2">
                      <Zap size={14} className="animate-pulse flex-shrink-0" />
                      Image sélectionnée !
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <label className="group relative block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <div className="relative overflow-hidden border-2 sm:border-3 border-dashed border-[#00A4E0]/40 rounded-xl sm:rounded-2xl p-6 sm:p-16 text-center bg-gradient-to-br from-[#cfe3ff]/30 via-blue-50/20 to-transparent hover:border-[#00A4E0] hover:from-[#cfe3ff]/50 hover:bg-blue-50/30 transition-all duration-500 group-hover:scale-[1.01]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,164,224,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl shadow-[#00A4E0]/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <Upload className="w-7 h-7 sm:w-10 sm:h-10 text-white animate-bounce" />
                    </div>
                    <p className="text-base sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                      Cliquez pour sélectionner une image
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3">
                      Ou glissez-déposez votre fichier ici
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-lg border border-gray-200 flex-wrap justify-center">
                      <div className="flex gap-1">
                        <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] sm:text-xs font-semibold">PNG</span>
                        <span className="px-1.5 sm:px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px] sm:text-xs font-semibold">JPG</span>
                        <span className="px-1.5 sm:px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-[10px] sm:text-xs font-semibold">WEBP</span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-500">jusqu'à 10MB</span>
                    </div>
                  </div>
                </div>
              </label>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            {/* Ordre d'affichage */}
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-800 flex-wrap">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0">
                  <Hash size={14} className="text-white" />
                </div>
                Ordre d'affichage
              </label>
              <div className="relative">
                <Hash className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  min="0"
                  className="w-full border-2 border-gray-200 rounded-xl pl-11 sm:pl-14 pr-4 sm:pr-5 py-3 sm:py-4 text-sm sm:text-lg
                             focus:outline-none focus:ring-4 focus:ring-[#00A4E0]/20 focus:border-[#00A4E0]
                             transition-all hover:border-gray-300 shadow-sm hover:shadow-md"
                />
              </div>
              <p className="text-[11px] sm:text-xs text-gray-600 flex items-start sm:items-center gap-2 bg-blue-50 p-2.5 sm:p-3 rounded-lg">
                <Sparkles size={13} className="text-[#00A4E0] flex-shrink-0 mt-0.5 sm:mt-0" />
                Plus le nombre est petit, plus l'actualité est prioritaire
              </p>
            </div>

            {/* Statut Publication */}
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-800 flex-wrap">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0">
                  <Eye size={14} className="text-white" />
                </div>
                Publication
              </label>
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 sm:border-3 border-[#cfe3ff] bg-gradient-to-br from-[#cfe3ff]/20 to-transparent p-3 sm:p-5 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0 ${
                      enabled
                        ? "bg-gradient-to-br from-[#00A4E0] to-[#0077A8] sm:scale-110"
                        : "bg-gradient-to-br from-[#A6A6A6] to-gray-500"
                    }`}>
                      {enabled ? (
                        <Eye size={16} className="text-white" />
                      ) : (
                        <EyeOff size={16} className="text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        {enabled ? "Publier immédiatement" : "Enregistrer en brouillon"}
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                        {enabled ? "Visible dès la création" : "Visible uniquement pour vous"}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                    />
                    <div className="w-12 h-6 sm:w-14 sm:h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00A4E0]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00A4E0] peer-checked:to-[#0077A8] shadow-inner"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-8 py-4 sm:py-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 text-sm sm:text-base
                       hover:bg-gray-100 hover:border-gray-400 hover:scale-[1.02] active:scale-95 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       shadow-lg hover:shadow-xl order-2 sm:order-1"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-white text-sm sm:text-lg
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:from-[#0088CC] hover:to-[#006699]
                       hover:shadow-2xl hover:shadow-[#00A4E0]/50 hover:scale-[1.02] active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3
                       shadow-xl shadow-[#00A4E0]/30
                       relative overflow-hidden group/save order-1 sm:order-2"
          >
            {/* Effet shine */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/save:translate-x-[200%] transition-transform duration-1000" />

            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                <span className="relative">Création en cours...</span>
              </>
            ) : (
              <>
                <Save size={20} className="group-hover/save:scale-110 transition-transform" />
                <span className="relative">Créer l'actualité</span>
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

export default ActualiteCreateModal;