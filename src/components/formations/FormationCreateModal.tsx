import { useState } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  GraduationCap,
  Sparkles,
  Check,
  FileText,
} from "lucide-react";

import { FormationService } from "@/services/formation.service";
import { FormationLevel } from "@/types/formation";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { normalizeHtml } from "@/utils/html";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FormationCreateModal = ({ open, onClose, onSuccess }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<FormationLevel>(FormationLevel.LICENCE);
  const [displayOrder] = useState<number>(0);
  const [enabled] = useState<boolean>(true);
  const [cover, setCover] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null); // ✅ AJOUT de setPdf
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  if (!open) return null;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCover(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  };

  // ✅ NOUVELLE FONCTION pour gérer le PDF
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPdf(file);
  };

  const handleSubmit = async () => {
    if (!name || !cover) {
      alert("Nom et image de couverture obligatoires");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", normalizeHtml(description));
      formData.append("level", level);
      formData.append("displayOrder", String(displayOrder));
      formData.append("enabled", String(enabled));
      formData.append("coverImage", cover);
      if (pdf) formData.append("pdf", pdf);

      await FormationService.create(formData);

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création");
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Nouvelle Formation
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Sparkles size={12} className="text-[#00A4E0]" />
                  Créez une formation exceptionnelle
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Master en Intelligence Artificielle"
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
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
                value={level}
                onChange={(e) => setLevel(e.target.value as FormationLevel)}
                className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
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
                value={description}
                onChange={setDescription}
              />
            </div>
          </div>

          {/* Image de couverture */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Image de couverture <span className="text-red-500">*</span>
            </label>

            {coverPreview ? (
              <div className="relative group">
                <img
                  src={coverPreview}
                  alt="Preview"
                  className="w-full h-56 object-cover rounded-xl border-2 border-gray-200"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCover(null);
                      setCoverPreview(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Supprimer
                  </button>
                  <label className="px-4 py-2 bg-[#00A4E0] text-white rounded-lg hover:bg-[#008cc0] transition-colors cursor-pointer flex items-center gap-2">
                    <Upload size={16} />
                    Changer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-[#00A4E0] hover:bg-blue-50/50 transition-all">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl flex items-center justify-center shadow-lg">
                      <ImageIcon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        Cliquez pour sélectionner une image
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        PNG, JPG ou WEBP (max. 5MB)
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* ✅ NOUVEAU : Section PDF */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Document PDF (optionnel)
            </label>

            {pdf ? (
              <div className="flex items-center gap-3 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{pdf.name}</p>
                  <p className="text-sm text-gray-600">
                    {(pdf.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPdf(null)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-orange-500 hover:bg-orange-50/50 transition-all">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Ajouter un document PDF
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Cliquez pour sélectionner un fichier
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
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
                         bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                         hover:shadow-lg hover:scale-105 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Créer la formation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationCreateModal;
