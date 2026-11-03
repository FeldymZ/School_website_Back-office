import { useEffect, useState } from "react";
import {
  Mail, Phone, Building2, User, FileSignature, Download, Send, Paperclip, Loader2, AlertCircle,
  Lock, CheckCircle2, Clock, GraduationCap, Users, MessageSquareText, ClipboardList, X,
} from "lucide-react";

import { DemandeDevisService, saveBlob } from "@/services/DemandeDevisContinuesService";
import { STATUT_DEMANDE_CONFIG, dateCourte, fileUrl, formatDuree, formatMontant } from "@/utils/devis";
import { formatDate } from "@/utils/date";
import type { DemandeDevisAdmin } from "@/types/devis";
import DevisModal, { Bloc, ErrorBox, ModalBody, ModalFooter, btnCancel, btnPrimary, labelClass } from "@/components/common/Devismodal";

/**
 * Le parent affiche ce modal seulement quand une demande est ouverte,
 * avec key={demandeId} : l'état repart de zéro à chaque ouverture.
 */
interface Props {
  demandeId: number;
  refreshKey: number;                       // change → recharge la demande
  onClose: () => void;
  onChanged: () => void;                    // recharge la liste
  onGenererDevis: (d: DemandeDevisAdmin) => void;
}

const DemandeDevisDetailsModal = ({ demandeId, refreshKey, onClose, onChanged, onGenererDevis }: Props) => {
  const [demande, setDemande] = useState<DemandeDevisAdmin | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [confirmCloture, setConfirmCloture] = useState(false);
  const [closing, setClosing] = useState(false);

  /* Chargement (à l'ouverture et quand refreshKey change).
     Les setState sont faits dans les callbacks de la promesse (autorisé). */
  useEffect(() => {
    let actif = true;
    DemandeDevisService.getById(demandeId)
      .then((d) => {
        if (!actif) return;
        setDemande(d);
        setError(null);
      })
      .catch((err) => {
        if (actif) setError(err instanceof Error ? err.message : "Erreur de chargement");
      });
    return () => {
      actif = false;
    };
  }, [demandeId, refreshKey]);

  const recharger = async () => {
    try {
      setDemande(await DemandeDevisService.getById(demandeId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    }
  };

  const fermee = demande?.statut === "FERMEE";
  const statut = demande ? STATUT_DEMANDE_CONFIG[demande.statut] : null;
  const devis = demande?.devis ?? null;
  const nom = demande ? (demande.entreprise && demande.nomStructure ? demande.nomStructure : demande.nomClient) : "";

  const handleRepondre = async () => {
    if (!demande || !message.trim()) return;
    try {
      setSending(true);
      setError(null);
      await DemandeDevisService.repondre(demande.id, message.trim(), fichier);
      setMessage("");
      setFichier(null);
      await recharger();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const handleTelecharger = async () => {
    if (!demande?.devis) return;
    try {
      setDownloading(true);
      saveBlob(await DemandeDevisService.telechargerDevis(demande.id), `${demande.devis.numero}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de téléchargement");
    } finally {
      setDownloading(false);
    }
  };

  const handleCloturer = async () => {
    if (!demande) return;
    try {
      setClosing(true);
      await DemandeDevisService.cloturer(demande.id);
      setConfirmCloture(false);
      await recharger();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la clôture");
    } finally {
      setClosing(false);
    }
  };

  return (
    <DevisModal
      titre={demande ? `Demande n° ${demande.id}` : "Demande de devis"}
      sousTitre={demande ? `${nom} · reçue le ${dateCourte(demande.dateDemande)}` : "Chargement..."}
      icon={ClipboardList}
      onClose={onClose}
      largeur="sm:max-w-4xl"
      enTete={statut && (
        <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${statut.bg} ${statut.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statut.dot}`} /> {statut.label}
        </span>
      )}
    >
      {(fermer) => (
        <>
          <ModalBody>
            <ErrorBox message={error} />

            {!demande && !error && (
              <div className="py-16 flex justify-center text-[#00A4E0]">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}

            {demande && (
              <>
                {/* ===== Client ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3.5 sm:p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border-2 border-[#00A4E0]/20 rounded-xl">
                    {demande.entreprise ? <Building2 size={18} className="text-[#00A4E0] flex-shrink-0" /> : <User size={18} className="text-[#00A4E0] flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">{demande.entreprise ? "Entreprise" : "Particulier"}</p>
                      <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{nom}</p>
                      {demande.entreprise && demande.nomStructure && (
                        <p className="text-xs text-gray-500 truncate">Contact : {demande.nomClient}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border-2 border-[#00A4E0]/20 rounded-xl space-y-1.5 text-sm">
                    <a href={`mailto:${demande.email}`} className="flex items-center gap-2 text-gray-700 hover:text-[#00A4E0] break-all">
                      <Mail size={15} className="text-[#00A4E0] flex-shrink-0" /> {demande.email}
                    </a>
                    {demande.telephone && (
                      <a href={`tel:${demande.telephone}`} className="flex items-center gap-2 text-gray-700 hover:text-[#00A4E0]">
                        <Phone size={15} className="text-[#00A4E0] flex-shrink-0" /> {demande.telephone}
                      </a>
                    )}
                  </div>
                </div>

                {/* ===== Formations demandées ===== */}
                <Bloc titre={`Formations demandées (${demande.lignes.length})`} icon={GraduationCap}>
                  <ul className="-my-1 divide-y divide-gray-50">
                    {demande.lignes.map((l) => (
                      <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{l.formationLibelle}</p>
                          <p className="text-xs text-gray-400 flex flex-wrap gap-x-3">
                            <span className="inline-flex items-center gap-1"><Clock size={11} /> {formatDuree(l.duree, l.uniteDuree)}</span>
                            <span className="inline-flex items-center gap-1"><Users size={11} /> {l.nombreParticipants} participant{l.nombreParticipants > 1 ? "s" : ""}</span>
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 tabular-nums whitespace-nowrap">{formatMontant(l.prix)}</span>
                      </li>
                    ))}
                  </ul>
                </Bloc>

                {/* ===== Devis ===== */}
                <Bloc titre="Devis" icon={FileSignature} droite={devis && <span className="text-xs font-medium text-gray-500">{devis.numero}</span>}>
                  {devis ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-gray-500">
                          <span>Total</span><span className="tabular-nums text-gray-900">{formatMontant(devis.montantTotal)}</span>
                        </div>
                        {devis.montantReduction > 0 && (
                          <div className="flex justify-between text-gray-500">
                            <span>Réduction{devis.typeReduction === "TAUX" ? ` (${devis.valeurReduction}%)` : ""}</span>
                            <span className="tabular-nums text-red-600">- {formatMontant(devis.montantReduction)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                          <span className="font-bold text-gray-900">Net à payer</span>
                          <span className="text-lg font-black text-[#0077A8] tabular-nums">{formatMontant(devis.netAPayer)}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs text-gray-500">
                        <p>Valable jusqu'au <strong className="text-gray-700">{dateCourte(devis.dateValidite)}</strong></p>
                        {devis.emetteurNom && <p>Validé par <strong className="text-gray-700">{devis.emetteurNom}</strong> — {devis.emetteurFonction}</p>}
                        {devis.dateEnvoi ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 font-medium">
                            <CheckCircle2 size={12} /> Envoyé le {formatDate(devis.dateEnvoi)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-medium">
                            <Clock size={12} /> Pas encore envoyé au client
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Aucun devis pour le moment. Cliquez sur <strong>« Valider le devis »</strong> en bas de la fenêtre.
                    </p>
                  )}
                  {devis && (
                    <button type="button" onClick={handleTelecharger} disabled={downloading}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all disabled:opacity-50">
                      {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Télécharger le PDF
                    </button>
                  )}
                </Bloc>

                {/* ===== Historique ===== */}
                <Bloc titre={`Historique des échanges (${demande.reponses.length})`} icon={MessageSquareText}>
                  {demande.reponses.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucune réponse envoyée pour le moment.</p>
                  ) : (
                    <div className="space-y-3">
                      {demande.reponses.map((r) => (
                        <div key={r.id} className="p-3.5 rounded-xl bg-gray-50/60 border border-gray-100">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-[#00A4E0]">{r.envoyePar}</span>
                            <span className="text-xs text-gray-400">{formatDate(r.dateEnvoi)}</span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-line break-words">{r.message}</p>
                          {r.pieceJointeUrl && (
                            <a href={fileUrl(r.pieceJointeUrl)} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-[#00A4E0] hover:underline">
                              <Paperclip size={13} /> Pièce jointe
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Bloc>

                {/* ===== Répondre ===== */}
                {!fermee && (
                  <div className="space-y-2">
                    <label className={labelClass}>
                      <Send size={14} className="text-[#00A4E0] flex-shrink-0" /> Répondre au client
                    </label>
                    <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
                      placeholder="Votre message..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent transition-all hover:border-gray-300 resize-none" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {fichier ? (
                        <span className="inline-flex items-center gap-2 text-sm text-gray-700 max-w-full">
                          <Paperclip size={15} className="text-[#00A4E0] flex-shrink-0" />
                          <span className="truncate">{fichier.name}</span>
                          <button type="button" onClick={() => setFichier(null)} aria-label="Retirer le fichier" className="text-red-500 hover:text-red-600">
                            <X size={14} />
                          </button>
                        </span>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold text-gray-700 w-fit">
                          <Paperclip size={15} /> Joindre un fichier
                          <input type="file" className="hidden" onChange={(e) => setFichier(e.target.files?.[0] ?? null)} />
                        </label>
                      )}
                      <button type="button" onClick={handleRepondre} disabled={sending || !message.trim()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#00A4E0] to-[#0077A8] hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Envoyer
                      </button>
                    </div>
                  </div>
                )}

                {/* ===== Clôture ===== */}
                {fermee ? (
                  <p className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <Lock size={15} /> Demande clôturée {demande.dateTraitement && `le ${formatDate(demande.dateTraitement)}`}
                  </p>
                ) : confirmCloture && (
                  <div className="p-3.5 sm:p-4 bg-amber-50 border-2 border-amber-200 rounded-xl space-y-3">
                    <p className="text-xs sm:text-sm text-amber-800 font-medium flex items-start gap-2">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      Clôturer cette demande ? Plus aucune réponse ni aucun devis ne pourra être envoyé.
                    </p>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleCloturer} disabled={closing}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 text-white text-xs font-semibold disabled:opacity-50">
                        {closing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} Oui, clôturer
                      </button>
                      <button type="button" onClick={() => setConfirmCloture(false)}
                        className="px-4 py-2 rounded-xl border-2 border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100">
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            {demande && !fermee && !confirmCloture && (
              <button type="button" onClick={() => setConfirmCloture(true)} className={`${btnCancel} sm:mr-auto`}>
                <Lock size={16} /> Clôturer la demande
              </button>
            )}
            <button type="button" onClick={fermer} className={`${btnCancel} sm:min-w-[120px]`}>Fermer</button>
            {demande && !fermee && (
              <button type="button" onClick={() => onGenererDevis(demande)} className={`${btnPrimary} sm:min-w-[200px]`}>
                {devis && !devis.dateEnvoi ? <Send size={18} /> : <FileSignature size={18} />}
                {devis ? (devis.dateEnvoi ? "Revalider le devis" : "Envoyer au client") : "Valider le devis"}
              </button>
            )}
          </ModalFooter>
        </>
      )}
    </DevisModal>
  );
};

export default DemandeDevisDetailsModal;