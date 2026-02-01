import { useState } from "react";
import { Upload, X, Loader, Image as ImageIcon, Video, Sparkles } from "lucide-react";
import { BannerService } from "@/services/bannerService";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const BannerCreateModal = ({ onClose, onCreated }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview("");
    }
  };

  const submit = async () => {
    if (!file || !title) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append("title", title);
      form.append("displayOrder", "1");
      form.append("media", file);

      await BannerService.create(form);
      onCreated();
      onClose();
    } catch (error) {
      console.error("❌ Erreur création banner:", error);
      alert("Erreur lors de la création du banner");
    } finally {
      setLoading(false);
    }
  };

  const isVideo = file?.type.startsWith("video/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

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
                  <ImageIcon className="text-white" size={26} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Nouveau Banner
                  <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Créez un nouveau banner pour votre site
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
              <Sparkles size={16} className="text-[#00A4E0]" />
              Titre du banner
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Promotion d'été 2024"
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Media Preview */}
          {preview && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={16} className="text-[#00A4E0]" />
                Aperçu du média
              </h3>
              <div className="relative group overflow-hidden rounded-xl border-2 border-[#00A4E0] shadow-lg">
                {isVideo ? (
                  <video
                    src={preview}
                    className="w-full h-64 object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Aperçu"
                    className="w-full h-64 object-cover"
                  />
                )}
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview("");
                  }}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* File Input */}
          {!preview && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                {isVideo ? <Video size={16} className="text-[#00A4E0]" /> : <ImageIcon size={16} className="text-[#00A4E0]" />}
                Média (Image ou Vidéo)
                <span className="text-red-500">*</span>
              </label>
              <label className="group relative block cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
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
                      Cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-sm text-gray-500">
                      Ou glissez-déposez votre fichier ici
                    </p>
                    <p className="text-xs text-[#A6A6A6] mt-2">
                      PNG, JPG, WEBP, MP4, WEBM jusqu'à 50MB
                    </p>
                  </div>
                </div>
              </label>
            </div>
          )}
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
            onClick={submit}
            disabled={!file || !title || loading}
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
                <Upload size={18} />
                Créer le banner
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

export default BannerCreateModal;
