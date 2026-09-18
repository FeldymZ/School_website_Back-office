import { AlertCircle, Trash2, X } from "lucide-react";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const AgendaDeleteConfirm = ({ open, onConfirm, onCancel }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-rose-500 to-pink-600" />
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 85% 30%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
          <div className="relative px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-white/30 rounded-xl blur-md" />
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/30">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white truncate">
                  Supprimer l'événement
                </h3>
              </div>
              <button
                onClick={onCancel}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-sm sm:text-base text-gray-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est
            <span className="font-semibold text-red-600"> irréversible</span> et
            l'événement sera définitivement supprimé.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 text-sm sm:text-base
                         hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 order-2 sm:order-1"
            >
              <X size={16} />
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-xl font-medium text-white text-sm sm:text-base
                         bg-gradient-to-r from-red-500 to-pink-600
                         hover:shadow-lg hover:scale-[1.02] active:scale-95
                         transition-all duration-200 flex items-center justify-center gap-2 order-1 sm:order-2
                         shadow-md shadow-red-200"
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaDeleteConfirm;