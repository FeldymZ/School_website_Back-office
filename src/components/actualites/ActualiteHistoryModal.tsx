import { useEffect, useState } from "react";
import { X, Eye, EyeOff, Clock, Calendar, Sparkles } from "lucide-react";
import { ActualiteService } from "@/services/actualiteService";
import { ActualitePublicationHistory } from "@/types/actualite";

interface Props {
  id: number;
  title: string;
  onClose: () => void;
}

const ActualiteHistoryModal = ({ id, title, onClose }: Props) => {
  const [history, setHistory] = useState<ActualitePublicationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const data = await ActualiteService.getHistory(id);
      if (!cancelled) {
        setHistory(data);
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-10" />
          <div className="relative px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="text-white" size={26} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Historique
                    <Sparkles size={18} className="text-orange-500 animate-pulse" />
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {title}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-orange-500">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Chargement de l'historique...</span>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-gradient-to-br from-[#cfe3ff] to-white rounded-2xl p-12 text-center border-2 border-[#00A4E0]/20">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Aucun historique
              </h3>
              <p className="text-gray-600 text-sm">
                Aucune action enregistrée pour cette actualité
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-transparent rounded-xl p-4 border border-gray-200 hover:border-orange-300 transition-all hover:shadow-md"
                  style={{
                    animation: `slideUp 0.4s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        h.action === "PUBLISHED"
                          ? "bg-gradient-to-br from-green-500 to-emerald-500"
                          : "bg-gradient-to-br from-[#A6A6A6] to-gray-500"
                      }`}>
                        {h.action === "PUBLISHED" ? (
                          <Eye size={20} className="text-white" />
                        ) : (
                          <EyeOff size={20} className="text-white" />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {h.action === "PUBLISHED" ? "Publication" : "Mise en brouillon"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-[#A6A6A6]">
                          <Calendar size={14} />
                          <span>
                            {new Date(h.actionDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      h.action === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-[#A6A6A6]"
                    }`}>
                      {h.action === "PUBLISHED" ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
          animation: zoom-in-95 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ActualiteHistoryModal;
