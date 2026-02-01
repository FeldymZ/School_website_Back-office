import { useState } from "react";
import { X, Save } from "lucide-react";

import { Commentaire } from "@/types/commentaire";
import { CommentaireService } from "@/services/commentaireService";

interface Props {
  commentaire: Commentaire;
  onClose: () => void;
  onUpdated: () => void;
}

export default function CommentaireEditModal({
  commentaire,
  onClose,
  onUpdated,
}: Props) {
  /* ================= FORM STATE ================= */
  const [authorName, setAuthorName] = useState(commentaire.authorName);
  const [content, setContent] = useState(commentaire.content);
  const [displayDate, setDisplayDate] = useState(commentaire.displayDate);

  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined);

  const [loading, setLoading] = useState(false);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      await CommentaireService.update(commentaire.id, {
        authorName,
        content,
        displayDate,
        displayOrder,
        enabled,
      });

      onUpdated();
      onClose();
    } catch {
      alert("Erreur lors de la modification du commentaire");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#00A4E0] to-[#0080b3] p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Modifier le commentaire
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="text-white" size={24} />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-2">
            Éditez les informations du témoignage
          </p>
        </div>

        {/* FORM */}
        <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Nom de l'auteur */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom de l'auteur
            </label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00A4E0] focus:ring-4 focus:ring-[#cfe3ff] transition-all"
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contenu du témoignage
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00A4E0] focus:ring-4 focus:ring-[#cfe3ff] transition-all resize-none"
            />
            <p className="text-xs text-[#A6A6A6] mt-1">
              {content.length} caractères
            </p>
          </div>

          {/* Date affichée */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date affichée
            </label>
            <input
              value={displayDate}
              onChange={(e) => setDisplayDate(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00A4E0] focus:ring-4 focus:ring-[#cfe3ff] transition-all"
            />
          </div>

          {/* Ordre d'affichage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ordre d'affichage
              <span className="text-[#A6A6A6] font-normal ml-2">(optionnel)</span>
            </label>
            <input
              type="number"
              placeholder="Laisser vide pour ne pas modifier"
              onChange={(e) =>
                setDisplayOrder(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00A4E0] focus:ring-4 focus:ring-[#cfe3ff] transition-all"
            />
          </div>

          {/* Statut */}
          <div className="bg-gradient-to-br from-[#cfe3ff] to-white p-5 rounded-2xl border-2 border-[#00A4E0]/20">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-5 h-5 text-[#00A4E0] rounded focus:ring-2 focus:ring-[#00A4E0]"
              />
              <div>
                <span className="font-semibold text-gray-900">
                  Activer le commentaire
                </span>
                <p className="text-xs text-[#A6A6A6]">
                  Modifier le statut de visibilité
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00A4E0] to-[#0080b3] text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
