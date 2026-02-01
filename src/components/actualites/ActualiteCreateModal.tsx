import { useState } from "react";
import { X, Save, Loader, Newspaper, FileText, Hash, Eye, EyeOff, Upload, Sparkles, Image as ImageIcon } from "lucide-react";
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
                  Nouvelle actualité
                  <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Créez une nouvelle actualité pour votre établissement
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
              placeholder="Ex: Rentrée académique 2024-2025"
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

          {/* Image de couverture */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <ImageIcon size={16} className="text-[#00A4E0]" />
              Image de couverture
              <span className="text-red-500">*</span>
            </label>

            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="w-full h-64 object-cover rounded-xl border-2 border-[#00A4E0]"
                />
                <button
                  onClick={() => {
                    setCoverImage(null);
                    setPreview("");
                  }}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label className="group relative block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <div className="relative overflow-hidden border-2 border-dashed border-[#00A4E0]/30 rounded-xl p-12 text-center bg-gradient-to-br from-[#cfe3ff]/20 to-transparent hover:border-[#00A4E0] hover:bg-[#cfe3ff]/30 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Cliquez pour sélectionner une image
                    </p>
                    <p className="text-sm text-gray-500">
                      Ou glissez-déposez votre fichier ici
                    </p>
                    <p className="text-xs text-[#A6A6A6] mt-2">
                      PNG, JPG, WEBP jusqu'à 10MB
                    </p>
                  </div>
                </div>
              </label>
            )}
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
                Publication
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
                        {enabled ? "Publier immédiatement" : "Enregistrer en brouillon"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {enabled ? "Visible dès la création" : "Visible uniquement pour vous"}
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
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700
                       hover:bg-gray-100 hover:border-gray-300 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:shadow-lg hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Save size={18} />
                Créer l'actualité
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

export default ActualiteCreateModal;
