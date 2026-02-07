import { useEffect, useState } from "react";
import {
  X,
  FileText,
  Trash2,
  Upload,
  Download,
  Loader,
  AlertCircle,
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

const FormationPdfModal = ({ formationId, open, onClose }: Props) => {
  const [formation, setFormation] = useState<FormationDetails | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const user = getUserFromToken();
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;

  /* =========================
     FETCH
     ========================= */
  useEffect(() => {
    if (!open || !formationId) return;

    FormationService.getDetails(formationId)
      .then(setFormation)
      .catch((err) => {
        console.error(err);
        onClose();
      });
  }, [open, formationId, onClose]);

  if (!open || !formation) return null;

  /* =========================
     UPLOAD / REPLACE
     ========================= */
  const handleUpload = async () => {
    if (!file || !formationId) return;

    try {
      setLoading(true);
      await FormationService.uploadPdf(formationId, file);
      setFormation(await FormationService.getDetails(formationId));
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi du PDF");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE (SUPERADMIN ONLY)
     ========================= */
  const handleDelete = async () => {
    if (!formationId) return;
    if (!confirm("Supprimer définitivement le PDF ?")) return;

    try {
      setLoading(true);
      await FormationService.deletePdf(formationId);
      setFormation(await FormationService.getDetails(formationId));
    } catch (err) {
      console.error(err);
      alert("Suppression refusée");
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
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Document PDF</h2>
              <p className="text-sm text-gray-500">{formation.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* ===== AUCUN PDF ===== */}
          {!formation.pdfUrl && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>

              <div>
                <h3 className="font-semibold text-lg">Aucun PDF associé</h3>
                <p className="text-gray-500 text-sm">
                  Vous pouvez ajouter le document plus tard
                </p>
              </div>

              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 hover:bg-orange-50 transition">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-8 h-8 text-orange-500" />
                    <span className="font-medium">Sélectionner un PDF</span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    setFile(e.target.files?.[0] ?? null)
                  }
                />
              </label>

              {file && (
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium"
                >
                  {loading ? "Upload..." : "Ajouter le PDF"}
                </button>
              )}
            </div>
          )}

          {/* ===== PDF EXISTANT ===== */}
          {formation.pdfUrl && (
            <div className="space-y-4">
              {/* Preview */}
              <iframe
                src={resolveImageUrl(formation.pdfUrl)}
                className="w-full h-[400px] rounded-xl border"
                title="Preview PDF"
              />

              {/* Open / Download */}
              <a
                href={resolveImageUrl(formation.pdfUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 transition"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold">Ouvrir le PDF</p>
                  <p className="text-sm text-gray-500">
                    Visualiser ou télécharger
                  </p>
                </div>

                <Download />
              </a>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <div className="px-4 py-3 text-center border-2 border-dashed border-orange-300 rounded-xl hover:bg-orange-50 transition">
                    <Upload size={18} className="mx-auto mb-1" />
                    Remplacer
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      setFile(e.target.files?.[0] ?? null)
                    }
                  />
                </label>

                {isSuperAdmin && (
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-3 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={18} className="mx-auto mb-1" />
                    Supprimer
                  </button>
                )}
              </div>

              {file && (
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium"
                >
                  {loading ? (
                    <Loader className="animate-spin mx-auto" />
                  ) : (
                    "Confirmer le remplacement"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormationPdfModal;
