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
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

          <div className="relative flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <Grid3x3 className="text-white drop-shadow-lg" size={28} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-lg">
                  Modifier l'activité
                  <Sparkles size={22} className="text-yellow-300 animate-pulse drop-shadow-lg" />
                </h2>
                <p className="text-sm text-white/90 mt-1 font-medium drop-shadow">
                  Mettez à jour les informations de l'activité
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

        {/* Form */}
        <div className="p-8 space-y-8 bg-gradient-to-b from-gray-50 to-white">
          {/* Titre */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-bold text-gray-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Grid3x3 size={16} className="text-white" />
              </div>
              Titre de l'activité
              <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-semibold">Obligatoire</span>
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
              className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-lg
                         focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500
                         transition-all hover:border-gray-300 placeholder:text-gray-400
                         shadow-sm hover:shadow-md"
            />
          </div>

          {/* Contenu */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm font-bold text-gray-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <FileText size={16} className="text-white" />
              </div>
              Contenu
              <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-semibold">Obligatoire</span>
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
        <div className="sticky bottom-0 flex gap-4 px-8 py-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-8 py-4 rounded-xl border-2 border-gray-300 font-semibold text-gray-700
                       hover:bg-gray-100 hover:border-gray-400 hover:scale-[1.02] active:scale-95 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       shadow-lg hover:shadow-xl"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-8 py-4 rounded-xl font-bold text-white text-lg
                       bg-gradient-to-r from-green-500 to-emerald-600
                       hover:from-green-600 hover:to-emerald-700
                       hover:shadow-2xl hover:shadow-green-500/50 hover:scale-[1.02] active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-300 flex items-center justify-center gap-3
                       shadow-xl shadow-green-500/30
                       relative overflow-hidden group/save"
          >
            {/* Effet shine */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/save:translate-x-[200%] transition-transform duration-1000" />

            {loading ? (
              <>
                <Loader size={22} className="animate-spin" />
                <span className="relative">Enregistrement...</span>
              </>
            ) : (
              <>
                <Save size={22} className="group-hover/save:scale-110 transition-transform" />
                <span className="relative">Enregistrer les modifications</span>
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
