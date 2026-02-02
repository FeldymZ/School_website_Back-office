import { useEffect, useState } from "react";
import { X, Upload, Image as ImageIcon, Loader, Plus, Trash2 } from "lucide-react";

import { FormationDetails } from "@/types/formation";
import { FormationService } from "@/services/formation.service";
import { resolveImageUrl } from "@/utils/image";

interface Props {
  formationId: number | null;
  open: boolean;
  onClose: () => void;
}

const FormationGalleryModal = ({ formationId, open, onClose }: Props) => {
  const [formation, setFormation] = useState<FormationDetails | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null); // ✅ AJOUT pour la suppression
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !formationId) return;

    FormationService.getDetails(formationId)
      .then(setFormation)
      .catch(console.error);
  }, [open, formationId]);

  if (!open || !formation) return null;

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles(selectedFiles);

    // Generate previews
    const newPreviews: string[] = [];
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === selectedFiles.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!files.length) return;

    try {
      setLoading(true);
      await FormationService.addImages(formation.id, files);

      const updated = await FormationService.getDetails(formation.id);
      setFormation(updated);
      setFiles([]);
      setPreviews([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOUVELLE FONCTION pour supprimer une image
  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette image ?")) return;

    try {
      setDeletingId(imageId);
      await FormationService.deleteImage(imageId);

      // Recharger les détails
      const updated = await FormationService.getDetails(formation.id);
      setFormation(updated);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de l'image");
    } finally {
      setDeletingId(null);
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
      <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Galerie d'images
                </h2>
                <p className="text-sm text-gray-500">
                  {formation.title}
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
          {/* Upload Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-500 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {files.length > 0 ? `${files.length} fichier(s) sélectionné(s)` : 'Sélectionner des images'}
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG ou WEBP
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilesChange}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={loading || files.length === 0}
                className="px-6 py-4 rounded-xl font-medium text-white
                           bg-gradient-to-r from-purple-500 to-pink-600
                           hover:shadow-lg hover:scale-105 active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                           transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Ajouter
                  </>
                )}
              </button>
            </div>

            {/* Preview Selected Files */}
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${idx}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-purple-200"
                    />
                    <div className="absolute inset-0 bg-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gallery Grid */}
          {formation.galleryImages.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <ImageIcon className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Aucune image dans la galerie
                </h3>
                <p className="text-gray-500 mt-1">
                  Commencez par ajouter vos premières images
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <ImageIcon size={20} className="text-purple-500" />
                  Images de la galerie
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                    {formation.galleryImages.length}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formation.galleryImages.map((img, index) => {
                  // ✅ Extraire l'ID de l'image depuis l'URL
                  // Format attendu: "/uploads/formations/gallery/123_filename.jpg"
                  const imageId = parseInt(img.split('/').pop()?.split('_')[0] || '0');

                  return (
                    <div
                      key={img}
                      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all cursor-pointer"
                    >
                      <img
                        src={resolveImageUrl(img)}
                        alt={`Galerie ${index + 1}`}
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-sm">
                          <span className="font-medium">Image {index + 1}</span>

                          {/* ✅ BOUTON DE SUPPRESSION */}
                          <button
                            onClick={() => handleDeleteImage(imageId)}
                            disabled={deletingId === imageId}
                            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       hover:scale-110 active:scale-95"
                            title="Supprimer cette image"
                          >
                            {deletingId === imageId ? (
                              <Loader size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700
                       hover:bg-white hover:border-gray-300 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormationGalleryModal;
