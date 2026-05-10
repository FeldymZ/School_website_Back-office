import { useEffect, useRef, useState } from "react";
import {
  X,
  FileText,
  Loader2,
  Download,
  Eye,
  EyeOff,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react";

import { PreinscriptionService } from "@/services/preinscription.service";
import { PreinscriptionDemande } from "@/types/preinscription";
import { API_CONFIG } from "@/config/api";
import ConfirmActionModal from "@/components/common/ConfirmActionModal";

export default function PreinscriptionDetailsModal({
  open,
  demandeId,
  onClose,
}: {
  open:      boolean;
  demandeId: number | null;
  onClose:   () => void;
}) {

  const [demande, setDemande]             = useState<PreinscriptionDemande | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [showPdf, setShowPdf]             = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl]       = useState<string | null>(null);
  const [pdfLoading, setPdfLoading]       = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [openResendConfirm, setOpenResendConfirm] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const pdfBlobRef = useRef<string | null>(null);

  /* ── Load demande ── */
  useEffect(() => {
    if (!open || !demandeId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setDemande(null);
        setShowPdf(false);
        setResendSuccess(false);

        if (pdfBlobRef.current) {
          URL.revokeObjectURL(pdfBlobRef.current);
          pdfBlobRef.current = null;
          setPdfBlobUrl(null);
        }

        const data = await PreinscriptionService.getById(demandeId);
        setDemande(data);

      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, demandeId]);

  /* ── Load PDF sécurisé ── */
  const loadPdfSecure = async (): Promise<string | null> => {
    if (!demande?.id) return null;

    try {
      setPdfLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.PREINSCRIPTIONS.PDF(demande.id)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Erreur chargement PDF");

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);

      pdfBlobRef.current = url;
      setPdfBlobUrl(url);

      return url;

    } catch (err) {
      console.error(err);
      setError("Impossible de charger le PDF");
      return null;
    } finally {
      setPdfLoading(false);
    }
  };

  /* ── Toggle PDF ── */
  const handleTogglePdf = async () => {
    if (!showPdf && !pdfBlobUrl) {
      const url = await loadPdfSecure();
      if (!url) return;
    }
    setShowPdf(prev => !prev);
  };

  /* ── Download ── */
  const handleDownload = async () => {
    let url = pdfBlobUrl;
    if (!url) url = await loadPdfSecure();
    if (!url) return;

    const link    = document.createElement("a");
    link.href     = url;
    link.download = `preinscription_${demande?.nom}_${demande?.prenom}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── Resend (après confirmation) ── */
  const handleResendConfirmed = async () => {
    if (!demande?.id) return;
    try {
      setResendLoading(true);
      await PreinscriptionService.resend(demande.id);
      setOpenResendConfirm(false);
      setResendSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du renvoi de la préinscription");
      setOpenResendConfirm(false);
    } finally {
      setResendLoading(false);
    }
  };

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      if (pdfBlobRef.current) {
        URL.revokeObjectURL(pdfBlobRef.current);
      }
    };
  }, []);

  if (!open) return null;

  const statutConfig = {
    VALIDEE: {
      label: "Validée",
      cls:   "bg-green-50 text-green-700 border-green-200",
      icon:  <CheckCircle size={13} />,
    },
    REJETEE: {
      label: "Rejetée",
      cls:   "bg-red-50 text-red-700 border-red-200",
      icon:  <XCircle size={13} />,
    },
    EN_ATTENTE: {
      label: "En attente",
      cls:   "bg-amber-50 text-amber-700 border-amber-200",
      icon:  <Clock size={13} />,
    },
  }[demande?.statut ?? "EN_ATTENTE"] ?? { label: "—", cls: "", icon: null };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white w-full sm:max-w-5xl sm:rounded-3xl rounded-t-3xl
                        shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-md opacity-40" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-sm">
                  <FileText size={18} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-black text-gray-900 text-lg">Détails de la demande</h2>
                {demande && (
                  <p className="text-xs text-gray-400 mt-0.5">Préinscription #{demande.id}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4 bg-gradient-to-br from-slate-50 to-white">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-[#00A4E0] animate-spin" />
                <p className="text-sm text-gray-400">Chargement des informations...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
                <XCircle size={18} className="text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* ✅ Succès renvoi */}
            {resendSuccess && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm font-medium">
                  Demande de préinsccription renvoyée avec succès par email
                </p>
              </div>
            )}

            {/* Content */}
            {demande && (
              <>

                {/* Header user */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">
                        {demande.civilite} {demande.nom} {demande.prenom}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">Demande #{demande.id}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border ${statutConfig.cls}`}>
                      {statutConfig.icon}
                      {statutConfig.label}
                    </div>
                  </div>
                </div>

                {/* Informations personnelles */}
                <Section title="Informations personnelles" icon={<User size={14} />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Info icon={<User size={13} />}         label="Civilité"          value={demande.civilite} />
                    <Info icon={<Globe size={13} />}         label="Nationalité"       value={demande.nationalite} />
                    <Info icon={<Calendar size={13} />}      label="Date de naissance" value={demande.dateNaissance || "—"} />
                    <Info icon={<MapPin size={13} />}        label="Lieu de naissance" value={demande.lieuNaissance || "—"} />
                    <Info icon={<Phone size={13} />}         label="Téléphone"         value={demande.telephone} />
                    <Info icon={<MessageSquare size={13} />} label="WhatsApp"          value={demande.whatsapp || "—"} />
                    <Info icon={<Mail size={13} />}          label="Email"             value={demande.email} full />
                  </div>
                </Section>

                {/* Formation */}
                <Section title="Formation demandée" icon={<GraduationCap size={14} />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Info icon={<GraduationCap size={13} />} label="Formation"           value={demande.formation} full />
                    <Info icon={<GraduationCap size={13} />} label="Niveau"              value={demande.niveau} />
                    <Info icon={<Calendar size={13} />}      label="Année universitaire" value={demande.anneeUniversitaire} />
                  </div>
                </Section>

                {/* Diplôme */}
                <Section title="Diplôme présenté" icon={<BookOpen size={14} />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Info icon={<BookOpen size={13} />}    label="Diplôme"           value={demande.diplomePresente || "—"} />
                    <Info icon={<CheckCircle size={13} />} label="Statut"
                      value={
                        demande.statutDiplome === "OBTENU"   ? "Obtenu"   :
                        demande.statutDiplome === "EN_COURS" ? "En cours" : "—"
                      }
                    />
                    <Info icon={<Calendar size={13} />}  label="Année d'obtention" value={demande.anneeObtention ? String(demande.anneeObtention) : "—"} />
                    <Info icon={<Building2 size={13} />} label="Établissement"     value={demande.etablissementProvenance || "—"} full />
                  </div>
                </Section>

                {/* Attestation PDF */}
                {demande.pdfUrl && (
                  <Section title="Attestation PDF" icon={<FileText size={14} />}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-xs text-gray-400">Générée après validation de la demande</p>
                      <div className="flex flex-wrap gap-3">

                        {/* Afficher / Masquer */}
                        <button
                          onClick={handleTogglePdf}
                          disabled={pdfLoading}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                                     text-white text-sm font-semibold shadow-sm hover:shadow-md hover:scale-105 active:scale-95
                                     transition-all duration-200 disabled:opacity-60"
                        >
                          {pdfLoading ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : showPdf ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                          {showPdf ? "Masquer" : "Afficher"}
                        </button>

                        {/* Télécharger */}
                        <button
                          onClick={handleDownload}
                          disabled={pdfLoading}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200
                                     hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200
                                     text-sm font-semibold text-gray-700 disabled:opacity-60"
                        >
                          <Download size={15} />
                          Télécharger
                        </button>

                        {/* ✅ Renvoyer — ouvre la confirmation */}
                        <button
                          onClick={() => setOpenResendConfirm(true)}
                          disabled={resendLoading}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200
                                     hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200
                                     text-sm font-semibold text-gray-700 disabled:opacity-60"
                        >
                          {resendLoading ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Send size={15} />
                          )}
                          Renvoyer
                        </button>

                      </div>
                    </div>

                    {showPdf && pdfBlobUrl && (
                      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-inner bg-gray-50 mt-2">
                        <iframe
                          src={pdfBlobUrl}
                          className="w-full h-[700px]"
                          title="PDF Préinscription"
                        />
                      </div>
                    )}
                  </Section>
                )}

              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Modal confirmation renvoi */}
      <ConfirmActionModal
        open={openResendConfirm}
        loading={resendLoading}
        title="Renvoyer la demande de préinscription"
        message={`Renvoyer la demande de préinscription par email à ${demande?.email ?? "ce candidat"} ?`}
        confirmLabel="Renvoyer"
        confirmClass="bg-gradient-to-r from-[#00A4E0] to-[#0077A8] text-white hover:opacity-90"
        icon={<Send size={28} className="text-[#00A4E0]" />}
        iconBg="bg-blue-50"
        onConfirm={handleResendConfirmed}
        onCancel={() => setOpenResendConfirm(false)}
      />
    </>
  );
}

/* ── Section ── */
function Section({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <h4 className="text-sm font-black text-gray-800 uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

/* ── Info item ── */
function Info({ label, value, icon, full = false }: {
  label: string; value: string; icon?: React.ReactNode; full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">{label}</p>
      <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium break-words min-h-[44px] flex items-center gap-2">
        {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
        {value}
      </div>
    </div>
  );
}