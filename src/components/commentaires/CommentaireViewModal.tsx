import { X, Calendar, User } from "lucide-react";
import { Commentaire } from "@/types/commentaire";
import { resolveImageUrl } from "@/utils/image";
interface Props {
  commentaire: Commentaire;
  onClose: () => void;
}

export default function CommentaireViewModal({
  commentaire,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#00A4E0] to-[#0080b3] p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Détail du commentaire
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="text-white" size={24} />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-2">
            Aperçu complet du témoignage client
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-6">
          {/* AUTHOR */}
          <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-[#cfe3ff] to-white rounded-2xl border-2 border-[#00A4E0]/20">
            <div className="relative">
              <img
                src={resolveImageUrl(commentaire.authorImageUrl)}
                alt={commentaire.authorName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/placeholder.png";
                }}
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#00A4E0] to-[#0080b3] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <User size={14} className="text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {commentaire.authorName}
              </h3>
              <div className="flex items-center gap-2 text-[#A6A6A6]">
                <Calendar size={16} />
                <span className="text-sm font-medium">
                  {commentaire.displayDate}
                </span>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-[#00A4E0] to-[#0080b3] rounded-full" />
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Témoignage
              </h4>
            </div>

            <div className="relative">
              <div className="absolute -top-2 -left-2 text-6xl text-[#cfe3ff] font-serif leading-none">
                "
              </div>

              <div className="relative bg-white border-2 border-[#cfe3ff] rounded-2xl p-6 shadow-inner">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {commentaire.content}
                </p>
              </div>

              <div className="absolute -bottom-6 -right-2 text-6xl text-[#cfe3ff] font-serif leading-none">
                "
              </div>
            </div>
          </div>

          {/* METADATA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-200">
              <p className="text-xs font-semibold text-[#A6A6A6] uppercase tracking-wide mb-1">
                Ordre d'affichage
              </p>
              <p className="text-2xl font-bold text-[#00A4E0]">
                #{commentaire.displayOrder ?? "N/A"}
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                commentaire.enabled
                  ? "bg-gradient-to-br from-green-50 to-white border-green-200"
                  : "bg-gradient-to-br from-gray-50 to-white border-gray-200"
              }`}
            >
              <p className="text-xs font-semibold text-[#A6A6A6] uppercase tracking-wide mb-1">
                Statut
              </p>
              <p
                className={`text-lg font-bold ${
                  commentaire.enabled
                    ? "text-green-600"
                    : "text-[#A6A6A6]"
                }`}
              >
                {commentaire.enabled ? "✓ Actif" : "✗ Inactif"}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00A4E0] to-[#0080b3] text-white font-semibold shadow-lg hover:shadow-xl transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
