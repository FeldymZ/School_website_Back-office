import { AlertCircle, Trash2, X } from "lucide-react";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const AgendaDeleteConfirm = ({ open, onConfirm, onCancel }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-10" />
          <div className="relative px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Supprimer l'événement
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est
            <span className="font-semibold text-red-600"> irréversible</span> et
            l'événement sera définitivement supprimé.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700
                         hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
            >
              <X size={18} />
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-xl font-medium text-white
                         bg-gradient-to-r from-red-500 to-pink-600
                         hover:shadow-lg hover:scale-105 active:scale-95
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaDeleteConfirm;
