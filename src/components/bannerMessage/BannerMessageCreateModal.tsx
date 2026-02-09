// BannerMessageCreateModal.tsx
import { useState, useEffect, useCallback } from "react";
import { X, FileText, MessageSquare, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { BannerMessageService } from "@/services/bannerMessage.service";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function BannerMessageCreateModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const submit = async () => {
    if (!content.trim()) {
      toast.error("Le contenu est obligatoire");
      return;
    }

    const fd = new FormData();
    if (title.trim()) fd.append("title", title);
    fd.append("content", content);
    fd.append("active", String(active));

    try {
      setLoading(true);
      await BannerMessageService.create(fd);
      toast.success("Message créé avec succès");
      onCreated();
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const isValid = content.trim().length > 0;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0]/10 to-transparent" />
          <div className="relative flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-lg flex items-center justify-center shadow-lg">
                  <MessageSquare className="text-white" size={20} />
                </div>
              </div>
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                Nouveau message
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A4E0]"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Titre */}
          <div className="space-y-2">
            <label
              htmlFor="banner-title"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FileText size={16} className="text-[#00A4E0]" />
              Titre du message (optionnel)
            </label>
            <input
              id="banner-title"
              type="text"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                         focus:border-[#00A4E0] focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/20
                         transition-all duration-200 placeholder:text-gray-400"
              placeholder="Ex: Information importante"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Titre visible sur la bannière</span>
              <span>{title.length}/100</span>
            </div>
          </div>

          {/* Contenu */}
          <div className="space-y-2">
            <label
              htmlFor="banner-content"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <MessageSquare size={16} className="text-[#00A4E0]" />
              Contenu du message *
            </label>
            <textarea
              id="banner-content"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                         focus:border-[#00A4E0] focus:outline-none focus:ring-2 focus:ring-[#00A4E0]/20
                         transition-all duration-200 placeholder:text-gray-400 resize-none"
              placeholder="Décrivez votre message en détail..."
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Message détaillé</span>
              <span>{content.length}/500</span>
            </div>
          </div>

          {/* Statut actif */}
          <div className="bg-gradient-to-r from-[#00A4E0]/5 to-transparent rounded-xl p-4 border border-[#00A4E0]/20">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                {active ? (
                  <Eye size={20} className="text-[#00A4E0]" />
                ) : (
                  <EyeOff size={20} className="text-gray-400" />
                )}
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Actif immédiatement
                  </div>
                  <div className="text-xs text-gray-600">
                    {active
                      ? "Le message sera visible immédiatement"
                      : "Le message sera enregistré comme brouillon"}
                  </div>
                </div>
              </div>

              <div className="relative">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-[#00A4E0] peer-checked:to-[#0077A8] transition-all duration-300 shadow-inner" />
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-7" />
              </div>
            </label>
          </div>

          {/* Validation message */}
          {!isValid && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 text-xs font-bold">!</span>
              </div>
              <p className="text-xs text-amber-800">
                Le contenu du message est obligatoire
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-medium
                       hover:bg-gray-100 hover:border-gray-400 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                       transition-all duration-200"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={!isValid || loading}
            className={`px-6 py-2.5 rounded-xl font-bold text-white
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:ring-offset-2
                       ${
                         isValid && !loading
                           ? "bg-gradient-to-r from-[#00A4E0] to-[#0077A8] hover:shadow-lg hover:scale-105 active:scale-95"
                           : "bg-gray-300 cursor-not-allowed"
                       }`}
          >
            {loading ? "Création..." : "Créer le message"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoom-in-95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .zoom-in-95 {
          animation: zoom-in-95 0.2s ease-out;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </div>
  );
}
