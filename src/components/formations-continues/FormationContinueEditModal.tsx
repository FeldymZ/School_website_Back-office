import { useEffect, useState } from "react";
import {
  X,
  Upload,

  GraduationCap,
  Save,
  FileText,
  Loader,
} from "lucide-react";


import {
  FormationContinue,
  FormationContinueFormData,
} from "@/types/formation-continue";
import { resolveImageUrl } from "@/utils/image";
import { FormationContinueService } from "@/services/FormationContinueService";

interface Props {
  formationId: number | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FormationContinueEditModal = ({
  formationId,
  open,
  onClose,
  onSuccess,
}: Props) => {
  const [formation, setFormation] = useState<FormationContinue | null>(null);
  const [form, setForm] = useState<FormationContinueFormData>({
    titre: "",
    description: "",
    cover: null,
    pdf: null,
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH DETAILS
     ========================= */

  useEffect(() => {
    if (!open || !formationId) return;

    const load = async () => {
      try {
        const data = await FormationContinueService.getById(formationId);
        setFormation(data);
        setForm({
          titre: data.titre,
          description: data.description,
          cover: null,
          pdf: null,
        });
      } catch (err) {
        console.error(err);
        onClose();
      }
    };

    load();
  }, [open, formationId]);

  if (!open || !formation) return null;

  /* =========================
     INPUT HANDLERS
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
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("titre", form.titre);
      formData.append("description", form.description);

      if (form.cover) formData.append("cover", form.cover);
      if (form.pdf) formData.append("pdf", form.pdf);

      await FormationContinueService.update(formation.id, formData);

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
     ========================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">

        {/* HEADER */}
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
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* FORM */}
        <div className="p-8 space-y-6">

          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Titre
            </label>
            <input
              name="titre"
              value={form.titre}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={6}
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Cover actuelle */}
          {formation.coverUrl && !coverPreview && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Couverture actuelle
              </label>
              <img
                src={resolveImageUrl(formation.coverUrl)}
                className="w-full h-56 object-cover rounded-xl border"
              />
            </div>
          )}

          {/* Nouvelle cover */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Modifier la couverture
            </label>

            {coverPreview ? (
              <img
                src={coverPreview}
                className="w-full h-56 object-cover rounded-xl border"
              />
            ) : (
              <label className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-green-50 transition">
                <Upload className="mx-auto mb-2 text-gray-400" />
                <span className="text-gray-600">Choisir une nouvelle image</span>
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document PDF
            </label>

            {formation.pdfUrl && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <FileText size={16} />
                PDF existant
              </div>
            )}

            <label className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-green-50 transition">
              <Upload className="mx-auto mb-2 text-gray-400" />
              <span className="text-gray-600">Remplacer le PDF</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
            </label>

            {form.pdf && (
              <p className="text-sm text-gray-600 mt-2">
                📄 {form.pdf.name}
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r
                       from-green-500 to-emerald-600 text-white font-medium"
          >
            {loading ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              <>
                <Save size={18} className="inline mr-2" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormationContinueEditModal;
