import { useEffect, useState } from "react";
import {
  X,
  Save,
  Loader,
  Grid3x3,
  FileText,
  Sparkles,
} from "lucide-react";

import { ActiviteDetails } from "@/types/activite";
import { ActiviteService } from "@/services/activite.service";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface Props {
  activiteId: number | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ActiviteEditModal = ({
  activiteId,
  open,
  onClose,
  onSuccess,
}: Props) => {
  const [activite, setActivite] = useState<ActiviteDetails | null>(null);
  const [loading, setLoading] = useState(false);

  /* ========================= FETCH ========================= */
  useEffect(() => {
    if (!open || !activiteId) return;

    ActiviteService.getById(activiteId)
      .then(setActivite)
      .catch(console.error);
  }, [open, activiteId]);

  if (!open || !activite) return null;

  /* ========================= SUBMIT ========================= */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      await ActiviteService.update(activite.id, {
        titre: activite.titre,
        contenu: activite.contenu,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden sticky top-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

          <div className="relative flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
                <div className="relative w-11 h-11 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <Grid3x3 className="text-white drop-shadow-lg w-5 h-5 sm:w-7 sm:h-7" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-3xl font-black text-white flex items-center gap-2 sm:gap-3 drop-shadow-lg truncate">
                  Modifier l'activité
                  <Sparkles size={18} className="text-yellow-300 animate-pulse drop-shadow-lg flex-shrink-0 hidden sm:block" />
                </h2>
                <p className="text-xs sm:text-sm text-white/90 mt-0.5 sm:mt-1 font-medium drop-shadow hidden sm:block">
                  Mettez à jour les informations de l'activité
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110 active:scale-95 group flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-8 space-y-5 sm:space-y-8 bg-gradient-to-b from-gray-50 to-white">
          {/* Titre */}
          <div className="space-y-2 sm:space-y-3">
            <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-800 flex-wrap">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Grid3x3 size={14} className="text-white" />
              </div>
              Titre de l'activité
              <span className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px] sm:text-xs font-semibold">Obligatoire</span>
            </label>
            <input
              type="text"
              value={activite.titre}
              onChange={(e) =>
                setActivite({
                  ...activite,
                  titre: e.target.value,
                })
              }
              placeholder="Ex: Journée sportive inter-promotions"
              className="w-full border-2 border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-lg
                         focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500
                         transition-all hover:border-gray-300 placeholder:text-gray-400
                         shadow-sm hover:shadow-md"
            />
          </div>

          {/* Contenu */}
          <div className="space-y-2 sm:space-y-3">
            <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-gray-800 flex-wrap">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <FileText size={14} className="text-white" />
              </div>
              Contenu
              <span className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px] sm:text-xs font-semibold">Obligatoire</span>
            </label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors shadow-sm hover:shadow-md">
              <RichTextEditor
                value={activite.contenu}
                onChange={(html) =>
                  setActivite({
                    ...activite,
                    contenu: html,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-8 py-4 sm:py-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 text-sm sm:text-base
                       hover:bg-gray-100 hover:border-gray-400 hover:scale-[1.02] active:scale-95 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       shadow-lg hover:shadow-xl order-2 sm:order-1"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-white text-sm sm:text-lg
                       bg-gradient-to-r from-green-500 to-emerald-600
                       hover:from-green-600 hover:to-emerald-700
                       hover:shadow-2xl hover:shadow-green-500/50 hover:scale-[1.02] active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3
                       shadow-xl shadow-green-500/30
                       relative overflow-hidden group/save order-1 sm:order-2"
          >
            {/* Effet shine */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/save:translate-x-[200%] transition-transform duration-1000" />

            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                <span className="relative">Enregistrement...</span>
              </>
            ) : (
              <>
                <Save size={20} className="group-hover/save:scale-110 transition-transform" />
                <span className="relative">Enregistrer</span>
              </>
            )}
          </button>
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

        .animate-in {
          animation-fill-mode: both;
        }

        .fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .zoom-in-95 {
          animation: zoom-in-95 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default ActiviteEditModal;