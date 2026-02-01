import { AlertTriangle, Lock } from "lucide-react";

interface Props {
  open: boolean;
  title?: string;
  message: string;
  loading?: boolean;
  canConfirm?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal = ({
  open,
  title = "Confirmation",
  message,
  loading = false,
  canConfirm = true,
  onConfirm,
  onCancel,
}: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center gap-3 px-6 py-4 border-b">
          <AlertTriangle className="text-red-500" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          <p className="text-gray-700">{message}</p>

          {!canConfirm && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <Lock size={16} />
              Action réservée au SUPERADMIN
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg border"
            >
              Annuler
            </button>

            <button
              onClick={onConfirm}
              disabled={loading || !canConfirm}
              className={`
                px-4 py-2 rounded-lg text-white
                ${canConfirm
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"}
              `}
            >
              {loading ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
