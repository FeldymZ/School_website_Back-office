import { useEffect, useState } from "react";
import { X, Upload, Loader, Image as ImageIcon, Sparkles, Check } from "lucide-react";
import { ActualiteService } from "@/services/actualiteService";
import { ActualiteDetails } from "@/types/actualite";
import { resolveImageUrl } from "@/utils/image"; // 🎯 IMPORT

interface Props {
  id: number;
  onClose: () => void;
  onUpdated: () => void;
}

const ActualiteCoverModal = ({ id, onClose, onUpdated }: Props) => {
  const [details, setDetails] = useState<ActualiteDetails | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await ActualiteService.getDetails(id);
        if (!cancelled) {
          console.log("📸 Image de couverture chargée:", data.coverImageUrl);
          setDetails(data);
        }
      } catch (error) {
        console.error("❌ Erreur chargement détails:", error);
        if (!cancelled) {
          onClose();
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id, onClose]);

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

  const handleSave = async () => {
    if (!file) return;

    try {
      setLoading(true);
      await ActualiteService.updateCover(id, file);
      onUpdated();
      onClose();
    } catch (error) {
      console.error("❌ Erreur mise à jour couverture:", error);
      alert("Erreur lors de la mise à jour de l'image");
    } finally {
      setLoading(false);
    }
  };

  if (!details) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 text-[#00A4E0]">
            <div className="w-6 h-6 border-2 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Chargement...</span>
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
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ImageIcon className="text-white" size={26} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Image de couverture
                  <Sparkles size={18} className="text-purple-500 animate-pulse" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Modifiez l'image principale de l'actualité
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
          {/* Current Cover */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Check size={16} className="text-green-500" />
              Image actuelle
            </h3>
            <div className="relative group overflow-hidden rounded-xl border-2 border-gray-200">
              {/* 🎯 UTILISATION DE resolveImageUrl */}
              <img
                src={resolveImageUrl(details.coverImageUrl)}
                alt="Couverture actuelle"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.error("❌ Erreur chargement image actuelle:", details.coverImageUrl);
                  e.currentTarget.src = "/placeholder.png";
                }}
                onLoad={() => {
                  console.log("✅ Image actuelle chargée");
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* New Cover Preview */}
          {preview && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={16} className="text-purple-500" />
                Nouvelle image
              </h3>
              <div className="relative group overflow-hidden rounded-xl border-2 border-purple-500 shadow-lg">
                <img
                  src={preview}
                  alt="Nouvelle couverture"
                  className="w-full h-64 object-cover"
                />
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
            <label className="group relative block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <div className="relative overflow-hidden border-2 border-dashed border-purple-500/30 rounded-xl p-12 text-center bg-gradient-to-br from-purple-50/50 to-transparent hover:border-purple-500 hover:bg-purple-50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Sélectionner une nouvelle image
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
            onClick={handleSave}
            disabled={!file || loading}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white
                       bg-gradient-to-r from-purple-500 to-pink-500
                       hover:shadow-lg hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Upload size={18} />
                Enregistrer la nouvelle image
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

export default ActualiteCoverModal;
