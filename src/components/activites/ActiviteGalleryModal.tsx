import { useEffect, useState } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Loader,
  Plus,
  Sparkles,
  Zap,
  Film,
} from "lucide-react";

import {
  ActiviteDetails,
  ActiviteMediaType,
} from "@/types/activite";
import { ActiviteService } from "@/services/activite.service";
import { resolveImageUrl } from "@/utils/image";
import { getUserFromToken } from "@/utils/auth";
import { UserRole } from "@/types/user";

import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

interface Props {
  activiteId: number | null;
  open: boolean;
  onClose: () => void;
}

const ActiviteGalleryModal = ({
  activiteId,
  open,
  onClose,
}: Props) => {
  const [activite, setActivite] = useState<ActiviteDetails | null>(null);

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  /* ===== DELETE STATE ===== */
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const user = getUserFromToken();
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  /* ========================= FETCH ========================= */
  useEffect(() => {
    if (!open || !activiteId) return;

    ActiviteService.getById(activiteId)
      .then(setActivite)
      .catch(console.error);
  }, [open, activiteId]);

  if (!open || !activite) return null;

  const images = activite.medias.filter((m) => m.type === ActiviteMediaType.IMAGE);
  const videoMedia = activite.medias.find((m) => m.type === ActiviteMediaType.VIDEO);

  /* ========================= PHOTOS SELECT ========================= */
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

  /* ========================= VIDEO SELECT ========================= */
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setVideo(file);

    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  /* ========================= UPLOAD ========================= */
  const handleUpload = async () => {
    if (!photos.length && !video) return;

    try {
      setLoading(true);

      const formData = new FormData();
      photos.forEach((p) => formData.append("photos", p));
      if (video) formData.append("video", video);

      await ActiviteService.addMedias(activite.id, formData);

      const refreshed = await ActiviteService.getById(activite.id);
      setActivite(refreshed);

      setPhotos([]);
      setPhotoPreviews([]);
      setVideo(null);
      setVideoPreview(null);
    } finally {
      setLoading(false);
    }
  };

  /* ========================= DELETE MEDIA ========================= */
  const handleConfirmDelete = async () => {
    if (!selectedMediaId) return;

    try {
      setDeleting(true);
      await ActiviteService.deleteMedia(selectedMediaId);

      setActivite({
        ...activite,
        medias: activite.medias.filter((m) => m.id !== selectedMediaId),
      });

      setOpenDelete(false);
      setSelectedMediaId(null);
    } finally {
      setDeleting(false);
    }
  };

  /* ========================= UI ========================= */
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-600 opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

          <div className="relative flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30">
                  <ImageIcon className="text-white drop-shadow-lg" size={28} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-lg">
                  Galerie
                  <Sparkles size={22} className="text-yellow-300 animate-pulse drop-shadow-lg" />
                </h2>
                <p className="text-sm text-white/90 mt-1 font-medium drop-shadow">
                  {activite.titre}
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
          {/* Upload Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-8 border-3 border-dashed border-purple-300 hover:border-purple-500 transition-all duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)] opacity-0 hover:opacity-100 transition-opacity duration-500" />

            <div className="relative space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Photos */}
                <label className="flex-1 cursor-pointer group/label">
                  <div className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-lg hover:shadow-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 group-hover/label:scale-[1.02]">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover/label:scale-110 transition-transform">
                      <Plus className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">
                        {photos.length
                          ? `${photos.length} image(s)`
                          : "Ajouter des images"}
                      </p>
                      <p className="text-sm text-gray-600">Photos</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotosChange}
                  />
                </label>

                {/* Video */}
                <label className="flex-1 cursor-pointer group/label">
                  <div className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-lg hover:shadow-xl border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 group-hover/label:scale-[1.02]">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg group-hover/label:scale-110 transition-transform">
                      <Video className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">
                        {video ? "Vidéo sélectionnée" : "Ajouter vidéo"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {videoMedia ? "Remplacer" : "Facultatif"}
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                </label>

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={loading || (!photos.length && !video)}
                  className="px-8 py-5 rounded-xl font-bold text-white text-lg
                             bg-gradient-to-r from-purple-500 to-pink-600
                             hover:from-purple-600 hover:to-pink-700
                             hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105
                             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:scale-100 transition-all duration-300
                             flex items-center justify-center gap-3 shadow-xl shadow-purple-500/30
                             relative overflow-hidden group/upload min-w-[180px]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/upload:translate-x-[200%] transition-transform duration-1000" />

                  {loading ? (
                    <>
                      <Loader size={22} className="animate-spin" />
                      <span className="relative">Envoi...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={22} className="group-hover/upload:scale-110 transition-transform" />
                      <span className="relative">Ajouter</span>
                    </>
                  )}
                </button>
              </div>

              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold">
                    <Zap size={18} className="animate-pulse" />
                    <span>Aperçu des images à ajouter</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative group/preview">
                        <div className="overflow-hidden rounded-xl border-2 border-purple-300 shadow-lg">
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-24 object-cover group-hover/preview:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg border border-white/50">
                          <p className="text-xs font-bold text-purple-600">#{i + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Preview */}
              {videoPreview && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-pink-700 font-bold">
                    <Film size={18} className="animate-pulse" />
                    <span>Aperçu de la vidéo à ajouter</span>
                  </div>
                  <div className="relative group/video-preview overflow-hidden rounded-2xl border-3 border-pink-400 shadow-2xl">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-h-64 bg-black"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images Gallery */}
          {images.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl items-center justify-center shadow-lg mb-4">
                <ImageIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Aucune image
              </h3>
              <p className="text-gray-600">
                Commencez par ajouter des images
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <ImageIcon size={16} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">
                    Images
                  </h3>
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-sm font-bold shadow-lg">
                    {images.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/30"
                  >
                    <img
                      src={resolveImageUrl(img.url)}
                      alt={`Image ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-xl border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs font-bold text-purple-600">
                        Image {index + 1}
                      </p>
                    </div>

                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setSelectedMediaId(img.id);
                          setOpenDelete(true);
                        }}
                        className="absolute top-2 right-2 p-2.5 bg-gradient-to-br from-red-500 to-red-600
                                   text-white rounded-xl shadow-2xl
                                   opacity-0 group-hover:opacity-100 transition-all duration-300
                                   hover:scale-110 active:scale-95
                                   border border-white/50"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Gallery */}
          {videoMedia && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <Film size={16} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Vidéo</h3>
              </div>

              <div className="relative group overflow-hidden rounded-2xl border-3 border-pink-500 shadow-2xl shadow-pink-500/30">
                <video
                  src={resolveImageUrl(videoMedia.url)}
                  controls
                  className="w-full max-h-[500px] bg-black"
                />

                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-pink-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setSelectedMediaId(videoMedia.id);
                      setOpenDelete(true);
                    }}
                    className="absolute top-4 right-4 p-3 bg-gradient-to-br from-red-500 to-red-600
                               text-white rounded-xl shadow-2xl
                               hover:scale-110 active:scale-95 transition-all duration-300
                               border border-white/50"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-8 py-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={onClose}
            className="w-full px-8 py-4 rounded-xl border-2 border-gray-300 font-bold text-gray-700 text-lg
                       hover:bg-gray-100 hover:border-gray-400 hover:scale-[1.02] active:scale-95
                       transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        open={openDelete}
        title="Supprimer le média"
        message="Ce média sera supprimé définitivement. Voulez-vous continuer ?"
        loading={deleting}
        canConfirm={isSuperAdmin}
        onCancel={() => {
          setOpenDelete(false);
          setSelectedMediaId(null);
        }}
        onConfirm={handleConfirmDelete}
      />

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

export default ActiviteGalleryModal;
