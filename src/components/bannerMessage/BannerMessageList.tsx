// BannerMessageList.tsx
import { Pencil, Trash2, CheckCircle, XCircle, Clock, MessageSquare, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import type { BannerMessage } from "@/types/bannerMessage";
import { BannerMessageService } from "@/services/bannerMessage.service";

interface Props {
  messages: BannerMessage[];
  onEdit: (m: BannerMessage) => void;
  onRefresh: () => void;
}

export default function BannerMessageList({
  messages,
  onEdit,
  onRefresh,
}: Props) {
  const toggle = async (m: BannerMessage) => {
    try {
      await BannerMessageService.toggleActive(m.id, !m.active);
      toast.success(
        m.active ? "Message désactivé" : "Message activé",
        {
          icon: m.active ? "⏸️" : "▶️",
        }
      );
      onRefresh();
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;

    try {
      await BannerMessageService.delete(id);
      toast.success("Message supprimé avec succès");
      onRefresh();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <MessageSquare size={36} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Aucun message
            </h3>
            <p className="text-sm text-gray-500">
              Commencez par créer votre premier message de bannière
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((m, index) => (
        <div
          key={m.id}
          className="group relative bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl hover:border-[#00A4E0]/30 transition-all duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Active indicator bar */}
          {m.active && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-t-xl" />
          )}

          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Header with title and status */}
                <div className="flex items-start gap-3 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-base leading-tight flex-1 min-w-0">
                    {m.title || "Sans titre"}
                  </h3>

                  {/* Status badge */}
                  {m.active ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-full">
                      <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                      <span className="text-xs font-bold text-emerald-700">
                        Actif
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full">
                      <XCircle size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-500">
                        Inactif
                      </span>
                    </div>
                  )}
                </div>

                {/* Content preview */}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {m.content}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>
                      Créé le{" "}
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>

                  {m.updatedAt && m.updatedAt !== m.createdAt && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>
                        Modifié le{" "}
                        {new Date(m.updatedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle active */}
                <button
                  onClick={() => toggle(m)}
                  className={`
                    group/btn relative p-2.5 rounded-lg border-2 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95
                    ${
                      m.active
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 focus:ring-emerald-500"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300 focus:ring-gray-500"
                    }
                  `}
                  aria-label={m.active ? "Désactiver" : "Activer"}
                >
                  {m.active ? (
                    <ToggleRight size={16} />
                  ) : (
                    <ToggleLeft size={16} />
                  )}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {m.active ? "Désactiver" : "Activer"}
                  </span>
                </button>

                {/* Edit */}
                <button
                  onClick={() => onEdit(m)}
                  className="
                    group/btn relative p-2.5 rounded-lg
                    bg-blue-50 text-blue-600 border-2 border-blue-200
                    hover:bg-blue-100 hover:border-blue-300
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    active:scale-95 transition-all duration-200
                  "
                  aria-label="Modifier"
                >
                  <Pencil size={16} />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Modifier
                  </span>
                </button>

                {/* Delete */}
                <button
                  onClick={() => remove(m.id)}
                  className="
                    group/btn relative p-2.5 rounded-lg
                    bg-red-50 text-red-600 border-2 border-red-200
                    hover:bg-red-100 hover:border-red-300
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    active:scale-95 transition-all duration-200
                  "
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Supprimer
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Hover effect */}
          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#00A4E0]/20 transition-colors pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
