import { useEffect, useState } from "react";
import {
  X,
  FileText,
  Trash2,
  Download,
  AlertCircle,
  Loader,
} from "lucide-react";

import { FormationDetails } from "@/types/formation";
import { FormationService } from "@/services/formation.service";

interface Props {
  formationId: number | null;
  open: boolean;
  onClose: () => void;
}

const FormationPdfModal = ({ formationId, open, onClose }: Props) => {
  const [formation, setFormation] = useState<FormationDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !formationId) return;

    FormationService.getDetails(formationId)
      .then(setFormation)
      .catch(console.error);
  }, [open, formationId]);

  if (!open || !formation) return null;

  const handleDelete = async () => {
    if (!formationId) return;

    try {
      setLoading(true);
      await FormationService.deletePdf(formationId);

      const updated = await FormationService.getDetails(formationId);
      setFormation(updated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Document PDF
                </h2>
                <p className="text-sm text-gray-500">{formation.title}</p>
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

        <div className="p-8">
          {!formation.pdfUrl ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Aucun document PDF
                </h3>
                <p className="text-gray-500 mt-1">
                  Aucun document PDF n'est associé à cette formation
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      Document de formation
                    </p>
                    <p className="text-sm text-gray-600">
                      Fichier PDF disponible
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={formation.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white border-2 border-orange-300 text-orange-600
                               hover:bg-orange-100 hover:border-orange-400 transition-all group"
                    title="Télécharger"
                  >
                    <Download
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                  </a>

                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="p-3 rounded-xl bg-white border-2 border-red-300 text-red-600
                               hover:bg-red-100 hover:border-red-400 transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Supprimer"
                  >
                    {loading ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <Trash2
                        size={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                    )}
                  </button>
                </div>
              </div>

              <a
                href={formation.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-4 rounded-xl font-medium text-white text-center
                           bg-gradient-to-r from-orange-500 to-red-600
                           hover:shadow-lg hover:scale-105 active:scale-95
                           transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                Ouvrir le document PDF
              </a>
            </div>
          )}
        </div>

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

export default FormationPdfModal;
