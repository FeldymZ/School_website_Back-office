import { useEffect, useState } from "react";
import {
  X,
  FileText,
  Loader2,
  Download,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react";

import { PreinscriptionService } from "@/services/preinscription.service";
import { PreinscriptionDemande } from "@/types/preinscription";

/* ================= COMPONENT ================= */
export default function PreinscriptionDetailsModal({
  open,
  demandeId,
  onClose,
}: {
  open: boolean;
  demandeId: number | null;
  onClose: () => void;
}) {

  const [demande, setDemande] = useState<PreinscriptionDemande | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [showPdf, setShowPdf] = useState(false);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const [pdfLoading, setPdfLoading] = useState(false);

  /* ================= LOAD DEMANDE ================= */
  useEffect(() => {

    if (!open || !demandeId) return;

    const load = async () => {

      try {

        setLoading(true);

        setError(null);

        setDemande(null);

        setShowPdf(false);

        setPdfBlobUrl(null);

        const data = await PreinscriptionService.getById(demandeId);

        setDemande(data);

      } catch {

        setError("Erreur lors du chargement");

      } finally {

        setLoading(false);
      }
    };

    load();

  }, [open, demandeId]);

  /* ================= LOAD PDF SECURISE ================= */
  const loadPdfSecure = async () => {

    if (!demande?.pdfUrl) return;

    try {

      setPdfLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(demande.pdfUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await res.blob();

      const url = URL.createObjectURL(blob);

      setPdfBlobUrl(url);

    } catch (err) {

      console.error(err);

      setError("Impossible de charger le PDF");

    } finally {

      setPdfLoading(false);
    }
  };

  /* ================= TOGGLE PDF ================= */
  const handleTogglePdf = async () => {

    if (!showPdf && !pdfBlobUrl) {
      await loadPdfSecure();
    }

    setShowPdf(prev => !prev);
  };

  /* ================= DOWNLOAD ================= */
  const handleDownload = async () => {

    let url = pdfBlobUrl;

    if (!url) {

      await loadPdfSecure();

      url = pdfBlobUrl;
    }

    if (url) {

      const link = document.createElement("a");

      link.href = url;

      link.download = "preinscription.pdf";

      link.click();
    }
  };

  /* ================= CLEAN MEMORY ================= */
  useEffect(() => {

    return () => {

      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };

  }, [pdfBlobUrl]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full sm:max-w-4xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0 bg-white">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-sm">
              <FileText size={18} className="text-white" />
            </div>

            <div>
              <h2 className="font-black text-gray-900 text-lg">
                Détails de la demande
              </h2>

              {demande && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Préinscription #{demande.id}
                </p>
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

        {/* BODY */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 bg-gradient-to-br from-slate-50 to-white">

          {/* LOADING */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">

              <Loader2 className="w-10 h-10 text-[#00A4E0] animate-spin" />

              <p className="text-sm text-gray-400">
                Chargement des informations...
              </p>

            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">

              <XCircle size={18} className="text-red-500 flex-shrink-0" />

              <p className="text-red-600 text-sm font-medium">
                {error}
              </p>

            </div>
          )}

          {/* CONTENT */}
          {demande && (
            <>

              {/* HEADER USER */}
              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-5 shadow-sm">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div>

                    <h3 className="text-2xl font-black text-gray-900">
                      {demande.nom} {demande.prenom}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Demande #{demande.id}
                    </p>

                  </div>

                  <div
                    className={`
                      px-4 py-2 rounded-xl text-xs font-bold border w-fit

                      ${
                        demande.statut === "VALIDEE"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : demande.statut === "REJETEE"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }
                    `}
                  >

                    {demande.statut === "VALIDEE"
                      ? "VALIDÉE"
                      : demande.statut === "REJETEE"
                      ? "REJETÉE"
                      : "EN ATTENTE"}

                  </div>

                </div>

              </div>

              {/* INFOS PERSONNELLES */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">

                <h4 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                  Informations personnelles
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <Info
                    label="Civilité"
                    value={demande.civilite}
                  />

                  <Info
                    label="Nationalité"
                    value={demande.nationalite}
                  />

                  <Info
                    label="Date de naissance"
                    value={demande.dateNaissance || "—"}
                  />

                  <Info
                    label="Lieu de naissance"
                    value={demande.lieuNaissance || "—"}
                  />

                  <Info
                    label="Téléphone"
                    value={demande.telephone}
                  />

                  <Info
                    label="WhatsApp"
                    value={demande.whatsapp || "—"}
                  />

                  <Info
                    label="Email"
                    value={demande.email}
                    full
                  />

                </div>

              </div>

              {/* FORMATION */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">

                <h4 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                  Formation demandée
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <Info
                    label="Formation"
                    value={demande.formation}
                  />

                  <Info
                    label="Niveau"
                    value={demande.niveau}
                  />

                  <Info
                    label="Année universitaire"
                    value={demande.anneeUniversitaire}
                  />

                </div>

              </div>

              {/* DIPLOME */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">

                <h4 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                  Diplôme présenté
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <Info
                    label="Diplôme"
                    value={demande.diplomePresente || "—"}
                  />

                  <Info
                    label="Statut"
                    value={
                      demande.statutDiplome === "OBTENU"
                        ? "Obtenu"
                        : demande.statutDiplome === "EN_COURS"
                        ? "En cours"
                        : "—"
                    }
                  />

                  <Info
                    label="Année d'obtention"
                    value={
                      demande.anneeObtention
                        ? String(demande.anneeObtention)
                        : "—"
                    }
                  />

                  <Info
                    label="Établissement"
                    value={demande.etablissementProvenance || "—"}
                    full
                  />

                </div>

              </div>

              {/* PDF */}
              {demande.pdfUrl && (

                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <div>

                      <h4 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                        Document PDF
                      </h4>

                      <p className="text-xs text-gray-400 mt-1">
                        Préinscription générée après validation
                      </p>

                    </div>

                    <div className="flex flex-wrap gap-3">

                      <button
                        onClick={handleTogglePdf}
                        disabled={pdfLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A4E0] text-white hover:bg-[#0077A8] transition-all duration-200 text-sm font-semibold shadow-sm"
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

                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 text-sm font-semibold text-gray-700"
                      >
                        <Download size={15} />
                        Télécharger
                      </button>

                    </div>

                  </div>

                  {showPdf && pdfBlobUrl && (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-inner bg-gray-50">
                      <iframe
                        src={pdfBlobUrl}
                        className="w-full h-[700px]"
                        title="PDF Préinscription"
                      />
                    </div>
                  )}

                </div>
              )}

            </>
          )}

        </div>

      </div>

    </div>
  );
}

/* ================= INFO ITEM ================= */
function Info({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {

  return (
    <div className={full ? "sm:col-span-2" : ""}>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
        {label}
      </p>

      <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium break-words min-h-[48px] flex items-center">
        {value}
      </div>

    </div>
  );
}