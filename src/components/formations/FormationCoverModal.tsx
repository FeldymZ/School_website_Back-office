import { useEffect, useState } from "react";
import {
  X,
  Image as ImageIcon,
  Upload,
  Loader,
  AlertCircle,
} from "lucide-react";

import { FormationDetails } from "@/types/formation";
import { FormationService } from "@/services/formation.service";
import { resolveImageUrl } from "@/utils/image";

interface Props {
  formationId: number | null;
  open: boolean;
  onClose: () => void;
}

const FormationCoverModal = ({ formationId, open, onClose }: Props) => {
  const [formation, setFormation] = useState<FormationDetails | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH
     ========================= */
  useEffect(() => {
    if (!open || !formationId) return;

    FormationService.getDetails(formationId)
      .then(setFormation)
      .catch(() => onClose());
  }, [open, formationId, onClose]);

  if (!open || !formation) return null;

  /* =========================
     FILE SELECT
     ========================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);

    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  /* =========================
     UPLOAD
     ========================= */
  const handleUpload = async () => {
    if (!file || !formationId) return;

    try {
      setLoading(true);
      await FormationService.updateCover(formationId, file);

      const refreshed = await FormationService.getDetails(formationId);
      setFormation(refreshed);

      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la couverture");
    } finally {
      setLoading(false);
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
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Image de couverture</h2>
              <p className="text-sm text-gray-500">{formation.title}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cover actuelle */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Couverture actuelle
            </p>
            <img
              src={resolveImageUrl(formation.coverImageUrl)}
              className="w-full h-56 object-cover rounded-xl border"
            />
          </div>

          {/* Nouvelle image */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Nouvelle image
            </p>

            {preview ? (
              <img
                src={preview}
                className="w-full h-56 object-cover rounded-xl border"
              />
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 hover:bg-blue-50 transition">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-8 h-8 text-blue-500" />
                    <span className="font-medium">
                      Sélectionner une image
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Actions */}
          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r
                         from-blue-500 to-indigo-600 text-white font-medium"
            >
              {loading ? (
                <Loader className="animate-spin mx-auto" />
              ) : (
                "Mettre à jour la couverture"
              )}
            </button>
          )}

          {!file && (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <AlertCircle size={16} />
              Formats recommandés : JPG / PNG / WEBP
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormationCoverModal;
