import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  loading: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  icon: ReactNode;
  iconBg: string;
  onCancel: () => void;
  onConfirm: () => void;
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !loading && onCancel()}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md
                      animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-8 space-y-6">

          {/* Icon */}
          <div className="flex justify-center">
            <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center`}>
              {icon}
            </div>
          </div>

          {/* Texte */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-5 py-3 rounded-xl border border-gray-200
                         text-gray-700 font-medium hover:bg-gray-50
                         disabled:opacity-50 transition-all"
            >
              Annuler
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-5 py-3 rounded-xl font-medium
                         flex items-center justify-center gap-2
                         hover:scale-105 active:scale-95
                         disabled:opacity-50 disabled:scale-100
                         transition-all duration-200 ${confirmClass}`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
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