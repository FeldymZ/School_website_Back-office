import { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MessageCircle,
  GraduationCap,
  Calendar,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
  Hash,
} from "lucide-react";

import { PreinscriptionService } from "@/services/preinscription.service";
import { PreinscriptionDemande, StatutDemande } from "@/types/preinscription";

/* ============================
   STATUT CONFIG
   ============================ */
const STATUT_CONFIG = {
  EN_ATTENTE: {
    label: "En attente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock,
  },
  VALIDEE: {
    label: "Validée",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle,
  },
  REJETEE: {
    label: "Rejetée",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
  },
};

/* ============================
   LIGNE D'INFO
   ============================ */
const InfoRow = ({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  highlight?: boolean;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={15} className="text-[#00A4E0]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-sm mt-0.5 break-words ${
          highlight ? "font-bold text-gray-900" : "text-gray-700"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

/* ============================
   PROPS
   ============================ */
interface Props {
  open: boolean;
  demandeId: number | null;
  onClose: () => void;
}

/* ============================
   COMPOSANT
   ============================ */
const PreinscriptionDetailsModal = ({
  open,
  demandeId,
  onClose,
}: Props) => {
  const [demande, setDemande] =
    useState<PreinscriptionDemande | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !demandeId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PreinscriptionService.getById(demandeId);
        setDemande(data);
      } catch {
        setError("Impossible de charger les détails de la demande.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, demandeId]);

  const handleClose = () => {
    setDemande(null);
    setError(null);
    onClose();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!open) return null;

  const cfg =
    demande &&
    STATUT_CONFIG[
      demande.statut as keyof typeof STATUT_CONFIG
    ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Détails de la demande
              </h2>
              {demande && (
                <p className="text-xs text-gray-500">
                  N° {1000 + demande.id}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {loading && (
            <div className="flex flex-col items-center py-16">
              <Loader2 className="animate-spin text-[#00A4E0]" size={40} />
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-10">
              {error}
            </div>
          )}

          {demande && cfg && !loading && (
            <>
              {/* STATUT */}
              <div className="flex justify-between">
                <div
                  className={`${cfg.bg} ${cfg.text} px-4 py-2 rounded-xl border ${cfg.border}`}
                >
                  <cfg.icon size={16} /> {cfg.label}
                </div>

                <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-700">
                  {demande.anneeUniversitaire}
                </div>
              </div>

              {/* IDENTITÉ */}
              <div className="bg-gray-50 p-5 rounded-2xl">
                <InfoRow
                  icon={User}
                  label="Nom complet"
                  value={`${demande.civilite} ${demande.nom} ${demande.prenom}`}
                  highlight
                />
                <InfoRow
                  icon={Globe}
                  label="Nationalité"
                  value={demande.nationalite}
                />
              </div>

              {/* CONTACT */}
              <div className="bg-gray-50 p-5 rounded-2xl">
                <InfoRow icon={Mail} label="Email" value={demande.email} />
                <InfoRow icon={Phone} label="Téléphone" value={demande.telephone} />
                <InfoRow icon={MessageCircle} label="WhatsApp" value={demande.whatsapp} />
              </div>

              {/* FORMATION */}
              <div className="bg-gray-50 p-5 rounded-2xl">
                <InfoRow
                  icon={GraduationCap}
                  label="Formation"
                  value={demande.formation}
                />
                <InfoRow icon={Hash} label="Niveau" value={demande.niveau} />
              </div>

              {/* HISTORIQUE */}
              <div className="bg-gray-50 p-5 rounded-2xl">
                <InfoRow
                  icon={Clock}
                  label="Soumis le"
                  value={formatDate(demande.createdAt)}
                />
                {demande.validatedAt && (
                  <InfoRow
                    icon={CheckCircle}
                    label="Validé le"
                    value={formatDate(demande.validatedAt)}
                  />
                )}
              </div>

              {/* PDF */}
              {demande.statut === "VALIDEE" && demande.pdfUrl && (
                <a
                  href={demande.pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:scale-105 transition"
                >
                  <FileText size={20} />
                  Télécharger l'attestation PDF
                </a>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t">
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 border rounded-xl hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreinscriptionDetailsModal;