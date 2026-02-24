import { useState } from "react";
import {
  X,

  Image as ImageIcon,
  GraduationCap,
  Sparkles,

  FileText,
} from "lucide-react";


import { FormationContinueFormData } from "@/types/formation-continue";
import { FormationContinueService } from "@/services/FormationContinueService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FormationContinueCreateModal = ({
  open,
  onClose,
  onSuccess,
}: Props) => {
  const [form, setForm] = useState<FormationContinueFormData>({
    titre: "",
    description: "",
    cover: null,
    pdf: null,
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  /* =========================
     HANDLE INPUT
     ========================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setForm({ ...form, cover: file });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm({ ...form, pdf: file });
  };

  /* =========================
     SUBMIT
     ========================= */

  const handleSubmit = async () => {
    if (!form.titre || !form.description) {
      alert("Titre et description obligatoires");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("titre", form.titre);
      formData.append("description", form.description);

      if (form.cover) formData.append("cover", form.cover);
      if (form.pdf) formData.append("pdf", form.pdf);

      await FormationContinueService.create(formData);

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
     ========================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">

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
                  Nouvelle Formation Continue
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Sparkles size={12} className="text-[#00A4E0]" />
                  Créez une formation professionnelle
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

          {/* Titre */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              name="titre"
              value={form.titre}
              onChange={handleChange}
              placeholder="Ex: Formation en Cybersécurité"
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={6}
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0]"
            />
          </div>

          {/* Cover */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Image de couverture
            </label>

            {coverPreview ? (
              <div className="relative">
                <img
                  src={coverPreview}
                  className="w-full h-56 object-cover rounded-xl border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, cover: null });
                    setCoverPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-[#00A4E0] hover:bg-blue-50 transition-all">
                  <div className="flex flex-col items-center gap-3">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                    <span className="font-medium text-gray-600">
                      Sélectionner une image
                    </span>
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

          {/* PDF */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Document PDF (optionnel)
            </label>

            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 hover:bg-orange-50 transition">
                <div className="flex flex-col items-center gap-3">
                  <FileText className="w-8 h-8 text-orange-500" />
                  <span className="font-medium text-gray-600">
                    Sélectionner un PDF
                  </span>
                </div>
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
            </label>

            {form.pdf && (
              <p className="text-sm text-gray-600">
                📄 {form.pdf.name}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium"
            >
              Annuler
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl text-white font-medium
                         bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                         hover:scale-105 transition-all"
            >
              {loading ? "Création..." : "Créer la formation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationContinueCreateModal;
