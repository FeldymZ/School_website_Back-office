import { useState } from "react";
import {
  X,
  Image as ImageIcon,
  Video,
  Loader,
  Check,
  Upload,
  Sparkles,
  Grid3x3,
  FileText,
  Zap,
  Film,
} from "lucide-react";

import { ActiviteService } from "@/services/activite.service";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ActiviteCreateModal = ({ open, onClose, onSuccess }: Props) => {
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");

  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  /* ========================= PHOTOS ========================= */
  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setPhotos(files);

    const previews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setPhotoPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /* ========================= VIDEO ========================= */
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setVideo(file);

    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  /* ========================= SUBMIT ========================= */
  const handleSubmit = async () => {
    if (!titre || !contenu || photos.length === 0) {
      alert("Titre, contenu et au moins une photo sont obligatoires");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("titre", titre);
      formData.append("contenu", contenu);

      photos.forEach((p) => formData.append("photos", p));
      if (video) formData.append("video", video);

      await ActiviteService.create(formData);

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création de l'activité");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden sticky top-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8] opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

          <div className="relative flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <Grid3x3 className="text-white drop-shadow-lg" size={28} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-lg">
                  Nouvelle activité
                  <Sparkles size={22} className="text-yellow-300 animate-pulse drop-shadow-lg" />
                </h2>
                <p className="text-sm text-white/90 mt-1 font-medium drop-shadow">
                  Créez et partagez des activités étudiantes
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
          {/* Titre */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-bold text-gray-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                <Grid3x3 size={16} className="text-white" />
              </div>
              Titre de l'activité
              <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-semibold">Obligatoire</span>
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Journée sportive inter-promotions"
              className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-lg
                         focus:outline-none focus:ring-4 focus:ring-[#00A4E0]/20 focus:border-[#00A4E0]
                         transition-all hover:border-gray-300 placeholder:text-gray-400
                         shadow-sm hover:shadow-md"
            />
          </div>

          {/* Contenu */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-bold text-gray-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                <FileText size={16} className="text-white" />
              </div>
              Contenu
              <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-semibold">Obligatoire</span>
            </label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors shadow-sm hover:shadow-md">
              <RichTextEditor value={contenu} onChange={setContenu} />
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-bold text-gray-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                <ImageIcon size={16} className="text-white" />
              </div>
              Photos
              <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-semibold">Au moins 1</span>
            </label>

            {photoPreviews.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <div className="overflow-hidden rounded-xl border-2 border-[#00A4E0] shadow-lg shadow-[#00A4E0]/20">
                        <img
                          src={src}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg border border-white/50">
                        <p className="text-xs font-bold text-[#00A4E0]">Photo {i + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setPhotos([]);
                    setPhotoPreviews([]);
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl
                             hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-xl
                             hover:scale-[1.02] active:scale-95 font-bold flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Supprimer toutes les photos
                </button>
              </div>
            ) : (
              <label className="group relative block cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotosChange}
                  className="sr-only"
                />
                <div className="relative overflow-hidden border-3 border-dashed border-[#00A4E0]/40 rounded-2xl p-16 text-center bg-gradient-to-br from-[#cfe3ff]/30 via-blue-50/20 to-transparent hover:border-[#00A4E0] hover:from-[#cfe3ff]/50 hover:bg-blue-50/30 transition-all duration-500 group-hover:scale-[1.01]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,164,224,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#00A4E0]/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <Upload className="w-10 h-10 text-white animate-bounce" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      Cliquez pour sélectionner des photos
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Vous pouvez sélectionner plusieurs fichiers
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-200">
                      <div className="flex gap-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">PNG</span>
                        <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs font-semibold">JPG</span>
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-xs font-semibold">WEBP</span>
                      </div>
                      <span className="text-xs text-gray-500">jusqu'à 10MB chacune</span>
                    </div>
                  </div>
                </div>
              </label>
            )}
          </div>

          {/* Vidéo */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-bold text-gray-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Film size={16} className="text-white" />
              </div>
              Vidéo
              <span className="px-2 py-0.5 bg-gray-400 text-white rounded text-xs font-semibold">Optionnel</span>
            </label>

            {videoPreview ? (
              <div className="relative group">
                <div className="overflow-hidden rounded-2xl border-3 border-purple-500 shadow-2xl shadow-purple-500/30">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-80 bg-black"
                  />
                </div>
                <button
                  onClick={() => {
                    setVideo(null);
                    setVideoPreview(null);
                  }}
                  className="absolute top-4 right-4 p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl
                             hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-2xl
                             hover:scale-110 active:scale-95 group/btn"
                >
                  <X size={20} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/50">
                    <p className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                      <Zap size={16} className="animate-pulse" />
                      Vidéo sélectionnée !
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <label className="group relative block cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="sr-only"
                />
                <div className="relative overflow-hidden border-3 border-dashed border-purple-400/40 rounded-2xl p-12 text-center bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-transparent hover:border-purple-500 hover:from-purple-50/50 hover:bg-purple-50/30 transition-all duration-500 group-hover:scale-[1.01]">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <Video className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      Ajouter une vidéo (optionnel)
                    </p>
                    <p className="text-sm text-gray-600">
                      MP4, MOV, AVI jusqu'à 50MB
                    </p>
                  </div>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-4 px-8 py-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
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
            onClick={handleSubmit}
            disabled={loading}
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

            {loading ? (
              <>
                <Loader size={22} className="animate-spin" />
                <span className="relative">Création en cours...</span>
              </>
            ) : (
              <>
                <Check size={22} className="group-hover/save:scale-110 transition-transform" />
                <span className="relative">Créer l'activité</span>
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

export default ActiviteCreateModal;
