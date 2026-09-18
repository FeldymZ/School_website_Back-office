import { Eye, CheckCircle, XCircle } from "lucide-react";
import type { ContactMessage } from "@/types/contact";

interface Props {
  message: ContactMessage;
  index: number;
  onView: (id: number) => void;
}

/**
 * Mobile-only card representation of a contact message.
 * Used by ContactTable in place of a <tr> below the `sm` breakpoint,
 * where a data table doesn't fit comfortably on a narrow screen.
 */
export default function ContactCardMobile({ message, index, onView }: Props) {
  return (
    <button
      type="button"
      onClick={() => onView(message.id)}
      style={{ animation: `slideIn 0.4s ease-out ${index * 0.05}s both` }}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                 active:scale-[0.98] active:bg-gray-50 transition-transform"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">
              {message.senderName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{message.senderName}</p>
            <p className="text-xs text-gray-500 truncate">{message.senderEmail}</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold flex-shrink-0 whitespace-nowrap ${
            message.replied
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.replied ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {message.replied ? "Répondu" : "En attente"}
        </span>
      </div>

      <p className="text-sm text-gray-700 line-clamp-2 mb-3 leading-snug">
        {message.message}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <p className="text-xs text-[#A6A6A6]">
          {new Date(message.sentAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="flex items-center gap-1 text-[#00A4E0] text-xs font-semibold">
          <Eye size={14} />
          Voir
        </div>
      </div>
    </button>
  );
}