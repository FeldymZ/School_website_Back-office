import { ReactNode } from "react";
import { Loader2, X } from "lucide-react";

interface Props {
  open:         boolean;
  loading:      boolean;
  title:        string;
  message:      string;
  confirmLabel: string;
  confirmClass: string;
  icon:         ReactNode;
  iconBg:       string;
  onCancel:     () => void;
  onConfirm:    () => void;
}

const ConfirmActionModal = ({
  open,
  loading,
  title,
  message,
  confirmLabel,
  confirmClass,
  icon,
  iconBg,
  onCancel,
  onConfirm,
}: Props) => {

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onCancel()}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md
                      animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">

        {/* Bouton fermer */}
        <button
          onClick={() => !loading && onCancel()}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200
                     flex items-center justify-center transition-all duration-200
                     disabled:opacity-40 z-10"
        >
          <X size={15} className="text-gray-500" />
        </button>

        <div className="p-8 space-y-6">

          {/* Icône */}
          <div className="flex justify-center">
            <div className={`relative w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center`}>
              <div className={`absolute inset-0 ${iconBg} rounded-2xl blur-xl opacity-50`} />
              <span className="relative">{icon}</span>
            </div>
          </div>

          {/* Texte */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">

            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-200
                         text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300
                         disabled:opacity-50 transition-all duration-200 text-sm"
            >
              Annuler
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-5 py-3 rounded-xl font-semibold text-sm
                         flex items-center justify-center gap-2
                         hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:hover:scale-100
                         transition-all duration-200 shadow-md ${confirmClass}`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Traitement...
                </>
              ) : (
                confirmLabel
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;