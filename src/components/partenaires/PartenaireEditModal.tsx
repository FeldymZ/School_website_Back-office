import { useState } from "react";
import { X, Upload, Loader, Sparkles, Image as ImageIcon, Link2, Pencil } from "lucide-react";
import { Partenaire } from "@/types/partenaire";
import { PartenaireService } from "@/services/partenaireService";
import { resolveImageUrl } from "@/utils/image";

interface Props {
  partenaire: Partenaire;
  onClose: () => void;
  onUpdated: () => void;
}

export default function PartenaireEditModal({ partenaire, onClose, onUpdated }: Props) {
  const [name, setName] = useState(partenaire.name);
  const [websiteUrl, setWebsiteUrl] = useState(partenaire.websiteUrl ?? "");
  const [enabled, setEnabled] = useState(partenaire.enabled);

  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await PartenaireService.update(partenaire.id, {
        name,
        websiteUrl: websiteUrl || null,
        enabled,
      });

      if (logo) {
        await PartenaireService.updateLogo(partenaire.id, logo);
      }

      onUpdated();
      onClose();
    } catch (error) {
      console.error("❌ Erreur modification partenaire:", error);
      alert("Erreur lors de la modification");
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
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 relative overflow-hidden bg-white rounded-t-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <Pencil className="text-white" size={26} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Modifier Partenaire
                  <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Modifiez les informations du partenaire
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

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Nom */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Sparkles size={16} className="text-[#00A4E0]" />
              Nom du partenaire
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Microsoft"
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Site web */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Link2 size={16} className="text-[#00A4E0]" />
              Site web
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Logo */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <ImageIcon size={16} className="text-[#00A4E0]" />
              Logo du partenaire
            </label>

            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-[#cfe3ff]/20 to-white border-2 border-[#00A4E0]/20 rounded-xl p-3 shadow-lg flex items-center justify-center">
                  <img
                    src={preview || resolveImageUrl(partenaire.logoUrl)}
                    alt={partenaire.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                </div>
              </div>

              <label className="group flex-1 cursor-pointer">
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogo(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <div className="border-2 border-dashed border-[#00A4E0]/30 rounded-xl p-6 text-center hover:border-[#00A4E0] hover:bg-[#cfe3ff]/10 transition-all">
                  <Upload className="w-8 h-8 text-[#00A4E0] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold text-gray-900">Changer le logo</p>
                  <p className="text-xs text-[#A6A6A6] mt-1">PNG, JPG, SVG jusqu'à 5MB</p>
                </div>
              </label>
            </div>
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
                  Activer le partenaire
                </span>
                <p className="text-xs text-[#A6A6A6]">
                  Le partenaire sera visible sur le site
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
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
                <Loader size={18} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Pencil size={18} />
                Enregistrer
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
