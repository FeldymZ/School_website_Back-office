  import { useEffect, useState } from "react";
  import {
    X,
    FileText,
    Image as ImageIcon,
    BookOpen,
    GraduationCap,
    Download,
  } from "lucide-react";

  import { FormationDetails } from "@/types/formation";
  import { FormationService } from "@/services/formation.service";
  import { resolveImageUrl } from "@/utils/image";

  interface Props {
    formationId: number | null;
    open: boolean;
    onClose: () => void;
  }

  const FormationDetailsModal = ({ formationId, open, onClose }: Props) => {
    const [formation, setFormation] = useState<FormationDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!open || !formationId) return;

      const loadDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await FormationService.getDetails(formationId);
          setFormation(data);
        } catch (err) {
          console.error(err);
          setError("Impossible de charger les détails");
        } finally {
          setLoading(false);
        }
      };

      loadDetails();
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
        <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
            <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Détails de la formation
                </h2>
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
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 font-medium">
                  Chargement des détails...
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                <X className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {formation && (
              <>
                {/* Cover */}
                {formation.coverImageUrl && (
                  <div className="relative group overflow-hidden rounded-2xl border-2 border-gray-200">
                    <img
                      src={resolveImageUrl(formation.coverImageUrl)}
                      alt={formation.title}
                      className="w-full h-72 object-cover"
                    />
                  </div>
                )}

                {/* Title & Level */}
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {formation.title}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg">
                    <GraduationCap size={18} />
                    {formation.level}
                  </div>
                </div>

                {/* Description */}
                {formation.description && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: formation.description,
                      }}
                    />
                  </div>
                )}

                {/* Gallery */}
                {formation.galleryImages.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <ImageIcon size={20} className="text-[#00A4E0]" />
                      <h4 className="font-bold text-lg">Galerie</h4>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formation.galleryImages.map((img, index) => (
                        <div
                          key={img.id}
                          className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#00A4E0] transition-all"
                        >
                          <img
                            src={resolveImageUrl(img.url)}
                            alt={`gallery-${index}`}
                            className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PDF */}
                {formation.pdfUrl && (
                  <a
                    href={resolveImageUrl(formation.pdfUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-all"
                  >
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span className="font-medium">Document PDF</span>
                    <Download className="ml-auto text-blue-600" />
                  </a>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {formation && (
            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 hover:bg-white transition-all"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default FormationDetailsModal;
