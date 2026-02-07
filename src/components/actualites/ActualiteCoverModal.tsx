import { useEffect, useState } from "react";
import { X, Upload, Loader, Image as ImageIcon, Sparkles, Check, Zap } from "lucide-react";
import { ActualiteService } from "@/services/actualiteService";
import { ActualiteDetails } from "@/types/actualite";
import { resolveImageUrl } from "@/utils/image";

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative bg-white rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl" />
          <div className="relative flex items-center gap-4 text-purple-600">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-lg">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop avec effet de flou */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
        {/* Header avec gradient animé */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

          <div className="relative flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="text-white drop-shadow-lg" size={28} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-lg">
                  Image de couverture
                  <Sparkles size={22} className="text-yellow-300 animate-pulse drop-shadow-lg" />
                </h2>
                <p className="text-sm text-white/90 mt-1 font-medium drop-shadow">
                  Personnalisez votre actualité avec une image percutante
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

        {/* Content */}
        <div className="p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white">
          {/* Image actuelle */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Check size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Image actuelle</h3>
            </div>
            <div className="relative group overflow-hidden rounded-2xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <img
                src={resolveImageUrl(details.coverImageUrl)}
                alt="Couverture actuelle"
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  console.error("❌ Erreur chargement image actuelle:", details.coverImageUrl);
                  e.currentTarget.src = "/placeholder.png";
                }}
                onLoad={() => {
                  console.log("✅ Image actuelle chargée");
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 text-white font-semibold drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm">Cliquez sur "Sélectionner" ci-dessous pour changer</p>
              </div>
            </div>
          </div>

          {/* Nouvelle image preview */}
          {preview && (
            <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
                  <Zap size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Nouvelle image</h3>
              </div>
              <div className="relative group overflow-hidden rounded-2xl border-3 border-purple-500 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300">
                <img
                  src={preview}
                  alt="Nouvelle couverture"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview("");
                  }}
                  className="absolute top-4 right-4 p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 group/btn"
                >
                  <X size={20} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/50">
                    <p className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                      <Sparkles size={16} className="animate-pulse" />
                      Prêt à être enregistré !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload zone */}
          {!preview && (
            <label className="group relative block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <div className="relative overflow-hidden border-3 border-dashed border-purple-500/40 rounded-2xl p-16 text-center bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-orange-50/20 hover:border-purple-500 hover:from-purple-50 hover:via-pink-50 hover:to-orange-50 transition-all duration-500 group-hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Upload className="w-10 h-10 text-white animate-bounce" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    Sélectionner une nouvelle image
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Ou glissez-déposez votre fichier ici
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-200">
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">PNG</span>
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-xs font-semibold">JPG</span>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">WEBP</span>
                    </div>
                    <span className="text-xs text-gray-500">jusqu'à 10MB</span>
                  </div>
                </div>
              </div>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-4 px-8 py-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-8 py-4 rounded-xl border-2 border-gray-300 font-semibold text-gray-700
                       hover:bg-gray-100 hover:border-gray-400 hover:scale-[1.02] active:scale-95 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       shadow-lg hover:shadow-xl"
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            disabled={!file || loading}
            className="flex-1 px-8 py-4 rounded-xl font-bold text-white text-lg
                       bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500
                       hover:from-purple-700 hover:via-pink-600 hover:to-orange-600
                       hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-300 flex items-center justify-center gap-3
                       shadow-xl shadow-purple-500/30
                       relative overflow-hidden group/save"
          >
            {/* Effet shine */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/save:translate-x-[200%] transition-transform duration-1000" />

            {loading ? (
              <>
                <Loader size={22} className="animate-spin" />
                <span className="relative">Enregistrement...</span>
              </>
            ) : (
              <>
                <Upload size={22} className="group-hover/save:scale-110 transition-transform" />
                <span className="relative">Enregistrer la nouvelle image</span>
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

        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        .slide-in-from-bottom {
          animation: slide-in-from-bottom 0.5s ease-out;
        }

        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default ActualiteCoverModal;
