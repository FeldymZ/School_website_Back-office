import { useEffect, useState } from "react";
import {
  X,
  Image as ImageIcon,
  Video,
  FileText,
  Grid3x3,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";

import {
  ActiviteDetails,
  ActiviteMediaType,
} from "@/types/activite";
import { ActiviteService } from "@/services/activite.service";
import { resolveImageUrl } from "@/utils/image";

interface Props {
  activiteId: number | null;
  open: boolean;
  onClose: () => void;
}

const ActiviteDetailsModal = ({
  activiteId,
  open,
  onClose,
}: Props) => {
  const [activite, setActivite] = useState<ActiviteDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ========================= FETCH ========================= */
  useEffect(() => {
    if (!open || !activiteId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ActiviteService.getById(activiteId);
        setActivite(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les détails");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, activiteId]);

  if (!open) return null;

  const images = activite?.medias.filter((m) => m.type === ActiviteMediaType.IMAGE) || [];
  const videoMedia = activite?.medias.find((m) => m.type === ActiviteMediaType.VIDEO);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden sticky top-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8] opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

          <div className="relative flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30">
                  <Grid3x3 className="text-white drop-shadow-lg" size={28} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-lg">
                  Détails de l'activité
                  <Sparkles size={22} className="text-yellow-300 animate-pulse drop-shadow-lg" />
                </h2>
                <p className="text-sm text-white/90 mt-1 font-medium drop-shadow">
                  Toutes les informations sur cette activité
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
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative w-20 h-20 border-4 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-xl font-bold text-gray-700">
                Chargement des détails...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-6 text-sm font-medium text-red-600 bg-red-50 border-2 border-red-200 rounded-xl shadow-lg">
              <X className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Activité Details */}
          {!loading && !error && activite && (
            <>
              {/* Titre & Slug */}
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-gray-900">
                  {activite.titre}
                </h3>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 font-bold shadow-lg">
                  <LinkIcon size={18} />
                  <span className="text-sm">Slug : {activite.slug}</span>
                </div>
              </div>

              {/* Contenu */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                    <FileText size={16} className="text-white" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900">Contenu</h4>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50/20 rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
                  <div
                    className="prose prose-lg max-w-none text-gray-700
                               prose-headings:text-gray-900 prose-headings:font-bold
                               prose-p:text-gray-700 prose-ul:text-gray-700
                               prose-li:marker:text-[#00A4E0]"
                    dangerouslySetInnerHTML={{
                      __html: activite.contenu,
                    }}
                  />
                </div>
              </div>

              {/* Images */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
                      <ImageIcon size={16} className="text-white" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900">
                      Galerie photos
                    </h4>
                    <span className="px-3 py-1 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white rounded-full text-sm font-bold shadow-lg">
                      {images.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <div
                        key={img.id}
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#00A4E0] transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#00A4E0]/30"
                      >
                        <img
                          src={resolveImageUrl(img.url)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-xl border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-xs font-bold text-[#00A4E0]">
                            Photo {index + 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vidéo */}
              {videoMedia && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <Video size={16} className="text-white" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900">Vidéo</h4>
                  </div>

                  <div className="relative group overflow-hidden rounded-2xl border-3 border-purple-500 shadow-2xl shadow-purple-500/30">
                    <video
                      src={resolveImageUrl(videoMedia.url)}
                      controls
                      className="w-full max-h-[500px] bg-black"
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && activite && (
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
        )}
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

export default ActiviteDetailsModal;
