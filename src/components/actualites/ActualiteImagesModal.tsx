import { useEffect, useState } from "react";
import {
  X,
  Upload,
  Loader,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Plus,
  ImagePlus,
} from "lucide-react";

import { ActualiteService } from "@/services/actualiteService";
import { ActualiteDetails } from "@/types/actualite";
import { resolveImageUrl } from "@/utils/image";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { getUserFromToken } from "@/utils/auth";
import { UserRole } from "@/types/user";

/* =========================
   PROPS
   ========================= */
interface Props {
  id: number;
  onClose: () => void;
  onUpdated?: () => void;
}

const ActualiteImagesModal = ({ id, onClose, onUpdated }: Props) => {
  const [details, setDetails] = useState<ActualiteDetails | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔴 Suppression image
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  /* =========================
     DROITS (SOURCE UNIQUE)
     ========================= */
  const user = getUserFromToken();

  const canDelete =
    user?.role === UserRole.ADMIN ||
    user?.role === UserRole.SUPERADMIN;

  /* =========================
     CHARGEMENT GALERIE
     ========================= */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await ActualiteService.getDetails(id);
        if (!cancelled) setDetails(data);
      } catch (e) {
        console.error("❌ Erreur chargement galerie :", e);
        if (!cancelled) onClose();
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, onClose]);

  /* =========================
     CLEAN PREVIEWS
     ========================= */
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  /* =========================
     UPLOAD IMAGES
     ========================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const handleAdd = async () => {
    if (!files.length) return;

    try {
      setLoading(true);
      await ActualiteService.addImages(id, files);

      setFiles([]);
      setPreviews([]);

      const refreshed = await ActualiteService.getDetails(id);
      setDetails(refreshed);
      onUpdated?.();
    } catch (e) {
      console.error("❌ Erreur ajout images :", e);
      alert("Erreur lors de l'ajout des images");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SUPPRESSION IMAGE
     ========================= */
  const openDeleteModal = (imageId: number) => {
    if (!canDelete) return;
    setImageToDelete(imageId);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!imageToDelete || deleteLoading) return;

    try {
      setDeleteLoading(true);
      await ActualiteService.deleteImage(imageToDelete);

      const refreshed = await ActualiteService.getDetails(id);
      setDetails(refreshed);
      onUpdated?.();

      setDeleteOpen(false);
      setImageToDelete(null);
    } catch (e) {
      console.error("❌ Erreur suppression image :", e);
      alert("Suppression refusée");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!details) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative bg-white rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl" />
          <div className="relative flex items-center gap-4 text-pink-600">
            <div className="w-8 h-8 border-3 border-pink-600 border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-lg">Chargement de la galerie...</span>
          </div>
        </div>
      </div>
    );
  }

  const galleryImagesAdmin = details.galleryImagesAdmin ?? [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        <div className="relative bg-white w-full max-w-6xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto">
          {/* HEADER */}
          <div className="relative overflow-hidden sticky top-0 z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-95" />
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
                    Galerie d'images
                    <Sparkles size={22} className="text-yellow-300 animate-pulse drop-shadow-lg" />
                  </h2>
                  <p className="text-sm text-white/90 mt-1 font-medium drop-shadow">
                    {galleryImagesAdmin.length} image{galleryImagesAdmin.length > 1 ? 's' : ''} dans la galerie
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
            {/* Images existantes */}
            {galleryImagesAdmin.length > 0 ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Images de la galerie</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {galleryImagesAdmin.map((img, index) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-pink-500 shadow-lg hover:shadow-2xl transition-all duration-300"
                      style={{
                        animation: `zoomIn 0.4s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <img
                        src={resolveImageUrl(img.url)}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {canDelete && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => openDeleteModal(img.id)}
                            className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 group/btn"
                          >
                            <Trash2 className="text-white group-hover/btn:scale-110 transition-transform" size={20} />
                          </button>
                        </div>
                      )}

                      {/* Numéro de l'image */}
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-3xl shadow-xl border-2 border-pink-100 p-16">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZWM0ODk5IiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

                <div className="relative text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                      <ImageIcon className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  <h3 className="mt-8 text-2xl font-bold text-gray-900">
                    Aucune image dans la galerie
                  </h3>
                  <p className="mt-3 text-gray-600 max-w-md mx-auto">
                    Commencez par ajouter des images à votre galerie en utilisant le formulaire ci-dessous
                  </p>
                </div>
              </div>
            )}

            {/* Preview des images à uploader */}
            {previews.length > 0 && (
              <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
                      <Plus size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {previews.length} nouvelle{previews.length > 1 ? 's' : ''} image{previews.length > 1 ? 's' : ''}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      setFiles([]);
                      setPreviews([]);
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <X size={16} />
                    Annuler
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-2xl overflow-hidden border-3 border-green-500 shadow-2xl shadow-green-500/30"
                      style={{
                        animation: `zoomIn 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Nouvelle image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Plus size={12} />
                        Nouveau
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UPLOAD ZONE */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Upload size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Ajouter des images</h3>
              </div>

              <label className="group relative block cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <div className="relative overflow-hidden border-3 border-dashed border-pink-500/40 rounded-2xl p-16 text-center bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-indigo-50/20 hover:border-pink-500 hover:from-pink-50 hover:via-purple-50 hover:to-indigo-50 transition-all duration-500 group-hover:scale-[1.01]">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-pink-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <ImagePlus className="w-10 h-10 text-white animate-bounce" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      Cliquez pour sélectionner des images
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Ou glissez-déposez vos fichiers ici
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-200">
                      <div className="flex gap-1">
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-xs font-semibold">PNG</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">JPG</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">WEBP</span>
                      </div>
                      <span className="text-xs text-gray-500">jusqu'à 10MB chacune</span>
                    </div>
                  </div>
                </div>
              </label>

              {files.length > 0 && (
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className="w-full px-8 py-5 rounded-xl font-bold text-white text-lg
                             bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600
                             hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700
                             hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-[1.02] active:scale-95
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                             transition-all duration-300 flex items-center justify-center gap-3
                             shadow-xl shadow-pink-500/30
                             relative overflow-hidden group/add"
                >
                  {/* Effet shine */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/add:translate-x-[200%] transition-transform duration-1000" />

                  {loading ? (
                    <>
                      <Loader size={22} className="animate-spin" />
                      <span className="relative">Ajout en cours...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={22} className="group-hover/add:scale-110 transition-transform" />
                      <span className="relative">Ajouter {files.length} image{files.length > 1 ? 's' : ''} à la galerie</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Supprimer l'image"
        message="Cette action est irréversible. Voulez-vous continuer ?"
        loading={deleteLoading}
        canConfirm={canDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setImageToDelete(null);
          setDeleteLoading(false);
        }}
        onConfirm={confirmDelete}
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

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
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
    </>
  );
};

export default ActualiteImagesModal;
