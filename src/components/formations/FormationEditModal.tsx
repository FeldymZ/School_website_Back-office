import { useEffect, useState } from "react";
import { X, GraduationCap, Save, Loader } from "lucide-react";

import { FormationService } from "@/services/formation.service";
import { FormationDetails, FormationLevel } from "@/types/formation";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { normalizeHtml } from "@/utils/html";

interface Props {
  formationId: number | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FormationEditModal = ({ formationId, open, onClose, onSuccess }: Props) => {
  const [formation, setFormation] = useState<FormationDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !formationId) return;

    FormationService.getDetails(formationId)
      .then(setFormation)
      .catch(console.error);
  }, [open, formationId]);

  if (!open || !formationId || !formation) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await FormationService.update(formation.id, {
        name: formation.title.replace(`${formation.level} `, ""),
        description: normalizeHtml(formation.description ?? ""),
        level: formation.level,
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Modifier la formation
                </h2>
                <p className="text-sm text-gray-500">
                  Mettez à jour les informations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          {/* Nom */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Nom de la formation <span className="text-red-500">*</span>
            </label>
            <input
              value={formation.title.replace(`${formation.level} `, "")}
              onChange={(e) =>
                setFormation({
                  ...formation,
                  title: `${formation.level} ${e.target.value}`,
                })
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Niveau */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Niveau <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={formation.level}
                onChange={(e) =>
                  setFormation({
                    ...formation,
                    level: e.target.value as FormationLevel,
                  })
                }
                className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                           transition-all hover:border-gray-300 appearance-none cursor-pointer"
              >
                <option value={FormationLevel.LICENCE}>Licence</option>
                <option value={FormationLevel.MASTER}>Master</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
              <RichTextEditor
                value={formation.description ?? ""}
                onChange={(html) =>
                  setFormation({
                    ...formation,
                    description: html,
                  })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700
                         hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl font-medium text-white
                         bg-gradient-to-r from-green-500 to-emerald-600
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
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationEditModal;
