import { useEffect, useState } from "react";
import {
  X,
  GraduationCap,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";


import { FormationContinue } from "@/types/formation-continue";
import { resolveImageUrl } from "@/utils/image";
import { FormationContinueService } from "@/services/FormationContinueService";

interface Props {
  formationId: number | null;
  open: boolean;
  onClose: () => void;
}

const FormationContinueDetailsModal = ({
  formationId,
  open,
  onClose,
}: Props) => {
  const [formation, setFormation] = useState<FormationContinue | null>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH
     ========================= */

  useEffect(() => {
    if (!open || !formationId) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await FormationContinueService.getById(formationId);
        setFormation(data);
      } catch (err) {
        console.error(err);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, formationId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">

        {/* HEADER */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Détails de la formation
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-6">

          {loading && (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-[#00A4E0]" size={40} />
            </div>
          )}

          {formation && (
            <>
              {/* Cover */}
              {formation.coverUrl && (
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <img
                    src={resolveImageUrl(formation.coverUrl)}
                    alt={formation.titre}
                    className="w-full h-72 object-cover"
                  />
                </div>
              )}

              {/* Title + Status */}
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-gray-900">
                  {formation.titre}
                </h3>

                <div className="flex items-center gap-3">
                  {formation.enabled ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 font-medium">
                      <CheckCircle size={16} />
                      Active
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-medium">
                      <XCircle size={16} />
                      Inactive
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                  {formation.description}
                </div>
              </div>

              {/* PDF */}
              {formation.pdfUrl && (
                <a
                  href={resolveImageUrl(formation.pdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">Document PDF</p>
                    <p className="text-sm text-gray-500">
                      Ouvrir ou télécharger
                    </p>
                  </div>

                  <Download className="text-blue-600" />
                </a>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        {formation && (
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 hover:bg-white transition"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormationContinueDetailsModal;
