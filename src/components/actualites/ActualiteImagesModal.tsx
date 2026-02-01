import { useEffect, useState } from "react";
import { X, Upload, Loader, Image as ImageIcon, Sparkles, Trash2 } from "lucide-react";
import { ActualiteService } from "@/services/actualiteService";
import { ActualiteDetails } from "@/types/actualite";
import { resolveImageUrl } from "@/utils/image"; // 🎯 IMPORT

interface Props {
  id: number;
  onClose: () => void;
}

const ActualiteImagesModal = ({ id, onClose }: Props) => {
  const [details, setDetails] = useState<ActualiteDetails | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await ActualiteService.getDetails(id);
        if (!cancelled) {
          console.log(`📸 ${data.galleryImages.length} image(s) dans la galerie`);
          setDetails(data);
        }
      } catch (error) {
        console.error("❌ Erreur chargement galerie:", error);
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

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);

    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleAdd = async () => {
    if (!files.length) return;

    try {
      setLoading(true);
      await ActualiteService.addImages(id, files);
      setFiles([]);
      setPreviews([]);

      const data = await ActualiteService.getDetails(id);
      setDetails(data);

      console.log("✅ Images ajoutées avec succès");
    } catch (error) {
      console.error("❌ Erreur ajout images:", error);
      alert("Erreur lors de l'ajout des images");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePreview = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  if (!details) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 text-[#00A4E0]">
            <div className="w-6 h-6 border-2 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Chargement de la galerie...</span>
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
      <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ImageIcon className="text-white" size={26} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Galerie d'images
                  <Sparkles size={18} className="text-blue-500 animate-pulse" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {details.galleryImages.length} image{details.galleryImages.length > 1 ? 's' : ''} dans la galerie
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
        <div className="p-8 space-y-8">
          {/* Existing Images */}
          {details.galleryImages.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900">Images existantes</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {details.galleryImages.map((url, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-lg"
                  >
                    {/* 🎯 UTILISATION DE resolveImageUrl */}
                    <img
                      src={resolveImageUrl(url)}
                      alt={`Image ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        console.error(`❌ Erreur chargement image ${i + 1}:`, url);
                        e.currentTarget.src = "/placeholder.png";
                      }}
                      onLoad={() => {
                        console.log(`✅ Image ${i + 1} chargée`);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#cfe3ff] to-white rounded-2xl p-12 text-center border-2 border-blue-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ImageIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Aucune image dans la galerie
              </h3>
              <p className="text-gray-600 text-sm">
                Ajoutez des images pour créer votre galerie
              </p>
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload size={18} className="text-blue-500" />
              <h3 className="text-lg font-bold text-gray-900">Ajouter des images</h3>
            </div>

            {/* File Input */}
            <label className="group relative block cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <div className="relative overflow-hidden border-2 border-dashed border-blue-500/30 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50/50 to-transparent hover:border-blue-500 hover:bg-blue-50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Cliquez pour sélectionner des images
                  </p>
                  <p className="text-sm text-gray-500">
                    Ou glissez-déposez vos fichiers ici
                  </p>
                  <p className="text-xs text-[#A6A6A6] mt-2">
                    PNG, JPG, WEBP jusqu'à 10MB
                  </p>
                </div>
              </div>
            </label>

            {/* Preview selected files */}
            {previews.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  {previews.length} image{previews.length > 1 ? 's' : ''} sélectionnée{previews.length > 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemovePreview(index);
                          }}
                          className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={18} className="text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && (
              <button
                onClick={handleAdd}
                disabled={loading}
                className="w-full px-6 py-4 rounded-xl font-medium text-white
                           bg-gradient-to-r from-blue-500 to-indigo-600
                           hover:shadow-lg hover:scale-105 active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                           transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Ajouter {files.length} image{files.length > 1 ? 's' : ''} à la galerie
                  </>
                )}
              </button>
            )}
          </div>
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

export default ActualiteImagesModal;
