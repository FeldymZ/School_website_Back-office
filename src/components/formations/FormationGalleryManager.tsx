import { useEffect, useState } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader,
  Plus,
  Trash2,
} from "lucide-react";

import { FormationDetails } from "@/types/formation";
import { FormationService } from "@/services/formation.service";
import { resolveImageUrl } from "@/utils/image";
import { getUserFromToken } from "@/utils/auth";
import { UserRole } from "@/types/user";

interface Props {
  formationId: number | null;
  open: boolean;
  onClose: () => void;
}

const FormationGalleryModal = ({ formationId, open, onClose }: Props) => {
  const [formation, setFormation] = useState<FormationDetails | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const user = getUserFromToken();
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  /* =========================
     FETCH
     ========================= */
  useEffect(() => {
    if (!open || !formationId) return;

    FormationService.getDetails(formationId)
      .then(setFormation)
      .catch(console.error);
  }, [open, formationId]);

  if (!open || !formation) return null;

  const images = formation.galleryImages ?? [];

  /* =========================
     FILE SELECTION
     ========================= */
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles(selected);

    const previewsTmp: string[] = [];
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewsTmp.push(reader.result as string);
        if (previewsTmp.length === selected.length) {
          setPreviews(previewsTmp);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /* =========================
     UPLOAD
     ========================= */
  const handleUpload = async () => {
    if (!files.length) return;

    try {
      setLoading(true);
      await FormationService.addImages(formation.id, files);

      const refreshed = await FormationService.getDetails(formation.id);
      setFormation(refreshed);

      setFiles([]);
      setPreviews([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE IMAGE (SUPERADMIN)
     ========================= */
  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Supprimer définitivement cette image ?")) return;

    try {
      setDeletingId(imageId);
      await FormationService.deleteImage(imageId);

      const refreshed = await FormationService.getDetails(formation.id);
      setFormation(refreshed);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================
     UI
     ========================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Galerie d’images</h2>
              <p className="text-sm text-gray-500">{formation.title}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Upload */}
          <div className="bg-purple-50 rounded-xl p-6 border-2 border-dashed border-purple-300">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                  <Plus />
                  <span>
                    {files.length
                      ? `${files.length} image(s) sélectionnée(s)`
                      : "Sélectionner des images"}
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFilesChange}
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={!files.length || loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600
                           text-white disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader className="animate-spin" /> : <Upload />}
                Ajouter
              </button>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="h-24 object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Gallery */}
          {images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucune image dans la galerie
            </div>
          ) : (
            <div>
              <h3 className="font-bold mb-4">
                Images ({images.length})
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className="group relative rounded-xl overflow-hidden border"
                  >
                    <img
                      src={resolveImageUrl(img.url)}
                      alt={`Galerie ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />

                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={deletingId === img.id}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg
                                   opacity-0 group-hover:opacity-100 transition"
                      >
                        {deletingId === img.id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl border hover:bg-white"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormationGalleryModal;
