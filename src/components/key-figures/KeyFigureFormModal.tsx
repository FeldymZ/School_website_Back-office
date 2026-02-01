import { useEffect, useState } from "react";
import { X, Save, Loader, Sparkles, Hash, Type } from "lucide-react";
import toast from "react-hot-toast";
import { KeyFigureService } from "@/services/keyFigureService";
import type { KeyFigure } from "@/types/keyFigure";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: KeyFigure | null;
}

export default function KeyFigureFormModal({ open, onClose, onSuccess, initialData }: Props) {
  const isEdit = Boolean(initialData);

  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label);
      setValue(initialData.value);
      setEnabled(initialData.enabled);
    } else {
      setLabel("");
      setValue("");
      setEnabled(true);
    }
  }, [initialData]);

  if (!open) return null;

  const submit = async () => {
    if (!label.trim() || !value.trim()) {
      toast.error("Label et valeur sont obligatoires");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && initialData) {
        await KeyFigureService.update(initialData.id, {
          label,
          value,
          enabled,
        });
        toast.success("Chiffre clé mis à jour");
      } else {
        const all = await KeyFigureService.getAll();
        const maxOrder = all.length > 0 ? Math.max(...all.map((k) => k.displayOrder)) : 0;

        await KeyFigureService.create({
          label,
          value,
          displayOrder: maxOrder + 1,
          enabled,
        });

        toast.success("Chiffre clé ajouté");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Erreur enregistrement:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <Hash className="text-white" size={26} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {isEdit ? "Modifier" : "Nouveau"} Chiffre Clé
                  <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isEdit ? "Modifiez les informations" : "Ajoutez un nouveau chiffre"}
                </p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Label */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Type size={16} className="text-[#00A4E0]" />
              Label
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Étudiants, Formations, etc."
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Valeur */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Hash size={16} className="text-[#00A4E0]" />
              Valeur
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ex: 2500+, 15 ans, 95%"
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Statut */}
          <div className="relative overflow-hidden rounded-xl border-2 border-[#00A4E0]/20 bg-gradient-to-br from-[#cfe3ff]/20 to-white p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-[#00A4E0] peer-checked:to-[#0077A8] transition-all shadow-inner"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-md"></div>
              </div>
              <div className="flex-1">
                <span className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00A4E0]" />
                  Activer le chiffre clé
                </span>
                <p className="text-xs text-[#A6A6A6]">
                  Le chiffre sera visible sur le site
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700
                       hover:bg-gray-100 hover:border-gray-300 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={!label.trim() || !value.trim() || loading}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:shadow-lg hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEdit ? "Mettre à jour" : "Créer"}
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
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
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
}
