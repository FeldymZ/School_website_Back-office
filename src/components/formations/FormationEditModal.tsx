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
        name: formation.title.replace(`${formation.level} `, ""), // ✅ name
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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Modifier la formation
              </h2>
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
          <input
            value={formation.title.replace(`${formation.level} `, "")}
            onChange={(e) =>
              setFormation({
                ...formation,
                title: `${formation.level} ${e.target.value}`,
              })
            }
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500"
          />

          <select
            value={formation.level}
            onChange={(e) =>
              setFormation({
                ...formation,
                level: e.target.value as FormationLevel,
              })
            }
            className="w-full border border-gray-200 rounded-xl px-4 py-3"
          >
            <option value={FormationLevel.LICENCE}>Licence</option>
            <option value={FormationLevel.MASTER}>Master</option>
          </select>

          <RichTextEditor
            value={formation.description ?? ""}
            onChange={(html) =>
              setFormation({ ...formation, description: html })
            }
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium"
          >
            {loading ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              <>
                <Save size={18} /> Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormationEditModal;
