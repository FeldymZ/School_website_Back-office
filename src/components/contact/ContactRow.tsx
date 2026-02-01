import { Link } from "react-router-dom";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import type { ContactMessage } from "@/types/contact";

interface Props {
  message: ContactMessage;
  index: number;
}

export default function ContactRow({ message, index }: Props) {
  return (
    <tr className="bg-white transition-all hover:bg-gray-50">
      {/* Nom */}
      <td className="px-6 py-5">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
          }}
        >
          <p className="font-bold text-gray-900">{message.senderName}</p>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-5">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.1}s both`
          }}
        >
          <p className="text-gray-600">{message.senderEmail}</p>
        </div>
      </td>

      {/* Message */}
      <td className="px-6 py-5">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.2}s both`
          }}
        >
          <p className="text-gray-700 line-clamp-2">
            {message.message.length > 60
              ? message.message.slice(0, 60) + "…"
              : message.message}
          </p>
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-5">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.3}s both`
          }}
        >
          <p className="text-sm text-[#A6A6A6]">
            {new Date(message.sentAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </td>

      {/* Statut */}
      <td className="px-6 py-5 text-center">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.4}s both`
          }}
        >
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm ${
              message.replied
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700"
                : "bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700"
            }`}
          >
            {message.replied ? (
              <>
                <CheckCircle size={16} /> Répondu
              </>
            ) : (
              <>
                <XCircle size={16} /> Non répondu
              </>
            )}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-5 text-right">
        <div
          style={{
            animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.5}s both`
          }}
        >
          <Link
            to={`/contact/${message.id}`}
            className="group relative inline-flex items-center gap-2 p-2.5 rounded-xl border-2 border-[#cfe3ff] bg-[#cfe3ff]/30 text-[#00A4E0] hover:bg-[#cfe3ff]/60 hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-lg"
          >
            <Eye size={16} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Voir détails
            </span>
          </Link>
        </div>
      </td>
    </tr>
  );
}
