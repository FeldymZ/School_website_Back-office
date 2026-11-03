import { useEffect, useMemo, useState } from "react";
import {
  FileSignature, Download, Send, CheckCircle2, AlertCircle, Loader2, RefreshCw,
  UserCheck, BadgePercent, Percent, Banknote, CalendarDays, Check, Mail, Stamp, GraduationCap, FileText,
} from "lucide-react";

import { DemandeDevisService, saveBlob } from "@/services/DemandeDevisContinuesService";
import { DevisEmetteurService } from "@/services/devisEmetteur.service";
import { calculerReduction, dateCourte, fileUrl, formatDuree, formatMontant } from "@/utils/devis";
import type { DemandeDevisAdmin, Devis, DevisEmetteur } from "@/types/devis";
import DevisModal, { Bloc, ErrorBox, ModalBody, ModalFooter, btnCancel, btnPrimary, inputClass, labelClass } from "@/components/common/Devismodal";
/**
 * Le parent affiche ce modal seulement quand une demande est sélectionnée,
 * avec key={demande.id} : l'état est donc initialisé à chaque ouverture,
 * sans setState dans un useEffect.
 */
interface Props {
  demande: DemandeDevisAdmin;
  onClose: () => void;
  onChanged?: () => void;
}

type LigneForm = {
  ligneId: number;
  libelle: string;
  duree?: number | null;
  uniteDuree?: string | null;
  participants: number;
  prix: number;
};

type ModeReduction = "TAUX" | "MONTANT";

const JOUR = 24 * 60 * 60 * 1000;

/* Petit champ des tableaux (plus compact que inputClass) */
const petitInput =
  "border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent transition-all hover:border-gray-300 disabled:bg-gray-50";

/* Interrupteur (même style que celui de la page Utilisateurs) */
const Switch = ({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) => (
  <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00A4E0] flex-shrink-0 disabled:opacity-50 ${
      checked ? "bg-[#00A4E0]" : "bg-gray-200"
    }`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

const GenererDevisModal = ({ demande, onClose, onChanged }: Props) => {
  /* Devis existant (revalidation) : sert à pré-remplir le formulaire */
  const existant = demande.devis ?? null;
  const reductionExistante = !!existant && existant.typeReduction !== "AUCUNE";

  /* ── Lignes (initialisées une seule fois, à l'ouverture) ── */
  const [lignes, setLignes] = useState<LigneForm[]>(() =>
    demande.lignes.map((l) => {
      const dl = existant?.lignes.find((x) => x.ligneDemandeId === l.id);
      return {
        ligneId: l.id,
        libelle: l.formationLibelle,
        duree: l.duree,
        uniteDuree: l.uniteDuree,
        participants: dl?.nombreParticipants ?? l.nombreParticipants ?? 1,
        prix: dl?.prixUnitaire ?? l.prix ?? 0,
      };
    })
  );

  /* ── Réduction ── */
  const [avecReduction, setAvecReduction] = useState(reductionExistante);
  const [modeReduction, setModeReduction] = useState<ModeReduction>(
    reductionExistante && existant?.typeReduction === "MONTANT" ? "MONTANT" : "TAUX"
  );
  const [valeurReduction, setValeurReduction] = useState<number>(
    reductionExistante ? existant?.valeurReduction ?? 0 : 0
  );

  /* ── Autres paramètres ── */
  const [validite, setValidite] = useState(30);
  const [conditions, setConditions] = useState(existant?.conditions ?? "");
  const [ouverture] = useState(() => Date.now()); // pour afficher la date de fin de validité

  /* ── Validateur ── */
  const [emetteurs, setEmetteurs] = useState<DevisEmetteur[]>([]);
  const [emetteurId, setEmetteurId] = useState<number | null>(null);
  const [loadingEmetteurs, setLoadingEmetteurs] = useState(true);

  /* ── Résultat / envoi ── */
  const [devis, setDevis] = useState<Devis | null>(null);
  const [message, setMessage] = useState("");

  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Chargement des validateurs : celui du devis existant, sinon celui par défaut.
     Les setState sont faits dans les callbacks de la promesse (autorisé). */
  const emetteurDuDevis = existant?.emetteurId ?? null;
  useEffect(() => {
    let actif = true;
    DevisEmetteurService.list()
      .then((list) => {
        if (!actif) return;
        setEmetteurs(list);
        const dejaUtilise = emetteurDuDevis && list.some((e) => e.id === emetteurDuDevis) ? emetteurDuDevis : null;
        setEmetteurId(dejaUtilise ?? list.find((e) => e.actif)?.id ?? null);
      })
      .catch(() => {
        if (actif) setEmetteurs([]);
      })
      .finally(() => {
        if (actif) setLoadingEmetteurs(false);
      });
    return () => {
      actif = false;
    };
  }, [emetteurDuDevis]);

  /* Totaux en direct (même calcul que le serveur) */
  const totaux = useMemo(() => {
    const total = lignes.reduce((s, l) => s + Math.round(l.prix * l.participants), 0);
    const reduction = avecReduction ? calculerReduction(total, modeReduction, valeurReduction) : 0;
    return { total, reduction, net: total - reduction };
  }, [lignes, avecReduction, modeReduction, valeurReduction]);

  const fermee = demande.statut === "FERMEE";
  const busy = generating || downloading || sending;
  const validateur = emetteurs.find((e) => e.id === emetteurId) ?? null;
  const finValidite = new Date(ouverture + validite * JOUR).toISOString();
  const client = demande.entreprise && demande.nomStructure ? `${demande.nomStructure} — ${demande.nomClient}` : demande.nomClient;

  const updateLigne = (id: number, field: "participants" | "prix", value: number) =>
    setLignes((prev) => prev.map((l) => (l.ligneId === id ? { ...l, [field]: Number.isNaN(value) ? 0 : value } : l)));

  /* ── Validation + génération ── */
  const handleGenerate = async () => {
    setError(null);

    if (!emetteurId) return setError("Choisissez le validateur du devis.");
    if (lignes.some((l) => l.participants < 1)) return setError("Chaque formation doit avoir au moins 1 participant.");
    if (lignes.some((l) => l.prix < 0)) return setError("Les prix ne peuvent pas être négatifs.");

    if (avecReduction) {
      if (!valeurReduction || valeurReduction <= 0) return setError("Indiquez la valeur de la réduction.");
      if (modeReduction === "TAUX" && valeurReduction > 100) return setError("Le taux de réduction ne peut pas dépasser 100 %.");
      if (modeReduction === "MONTANT" && valeurReduction > totaux.total)
        return setError("Le montant de la réduction ne peut pas dépasser le total du devis.");
    }

    try {
      setGenerating(true);
      const result = await DemandeDevisService.genererDevis(demande.id, {
        emetteurId,
        validiteJours: validite,
        typeReduction: avecReduction ? modeReduction : "AUCUNE",
        valeurReduction: avecReduction ? valeurReduction : null,
        conditions: conditions.trim() || undefined,
        lignes: lignes.map((l) => ({ ligneId: l.ligneId, nombreParticipants: l.participants, prixUnitaire: l.prix })),
      });
      setDevis(result);
      setMessage(
        `Bonjour ${demande.nomClient},\n\n` +
          `Suite à votre demande, veuillez trouver ci-joint notre devis n° ${result.numero}, ` +
          `valable jusqu'au ${new Date(result.dateValidite).toLocaleDateString("fr-FR")}.\n\n` +
          `Pour confirmer, merci de nous retourner le devis signé avec la mention « Bon pour accord ».\n\n` +
          `Cordialement,\nESIITECH Gabon`
      );
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la validation du devis");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!devis) return;
    try {
      setDownloading(true);
      setError(null);
      saveBlob(await DemandeDevisService.telechargerDevis(demande.id), `${devis.numero}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de téléchargement");
    } finally {
      setDownloading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return setError("Le message ne peut pas être vide.");
    try {
      setSending(true);
      setError(null);
      await DemandeDevisService.envoyerDevis(demande.id, message);
      setSent(true);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <DevisModal
      titre={devis ? "Envoyer le devis" : existant ? "Revalider le devis" : "Valider le devis"}
      sousTitre={`${client}${existant ? ` · ${existant.numero}` : ""}`}
      icon={FileSignature}
      busy={busy}
      onClose={onClose}
      largeur="sm:max-w-4xl"
      zIndex="z-[60]"
      enTete={
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00A4E0]/10 text-xs font-semibold text-[#0077A8]">
          Étape {devis ? 2 : 1}/2 · {devis ? "Envoi" : "Validation"}
        </span>
      }
    >
      {(fermer) => (
        <>
          <ModalBody>
            <ErrorBox message={error} />
            {fermee && (
              <div className="p-3.5 sm:p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-amber-800 font-medium">Cette demande est clôturée : aucun devis ne peut être validé.</p>
              </div>
            )}

            {/* ================= ÉTAPE 1 : VALIDATION ================= */}
            {!devis && (
              <>
                {/* Formations : une ligne par formation demandée */}
                <Bloc titre="Formations et tarifs" icon={GraduationCap}>
                  <div className="-m-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left font-medium text-gray-400 text-xs uppercase tracking-wide px-4 py-2.5">Formation</th>
                          <th className="text-center font-medium text-gray-400 text-xs uppercase tracking-wide px-4 py-2.5">Participants</th>
                          <th className="text-right font-medium text-gray-400 text-xs uppercase tracking-wide px-4 py-2.5">Tarif (XAF)</th>
                          <th className="text-right font-medium text-gray-400 text-xs uppercase tracking-wide px-4 py-2.5">S. Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {lignes.map((l) => (
                          <tr key={l.ligneId}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{l.libelle}</p>
                              <p className="text-xs text-gray-400">{formatDuree(l.duree, l.uniteDuree)}</p>
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" min={1} value={l.participants} disabled={fermee} aria-label="Participants"
                                onChange={(e) => updateLigne(l.ligneId, "participants", parseInt(e.target.value, 10))}
                                className={`${petitInput} w-20 mx-auto block text-center`} />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" min={0} step={1000} value={l.prix} disabled={fermee} aria-label="Tarif"
                                onChange={(e) => updateLigne(l.ligneId, "prix", parseFloat(e.target.value))}
                                className={`${petitInput} w-32 ml-auto block text-right`} />
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                              {formatMontant(l.prix * l.participants)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Bloc>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {/* Réduction */}
                  <Bloc titre="Réduction" icon={BadgePercent}
                    droite={<Switch checked={avecReduction} onChange={setAvecReduction} disabled={fermee} label="Appliquer une réduction" />}>
                    {!avecReduction ? (
                      <p className="text-sm text-gray-400">Aucune réduction. Activez l'interrupteur pour en appliquer une.</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                          {([
                            { value: "TAUX", label: "Taux (%)", icon: Percent },
                            { value: "MONTANT", label: "Montant (XAF)", icon: Banknote },
                          ] as const).map((opt) => (
                            <button key={opt.value} type="button" disabled={fermee}
                              onClick={() => {
                                setModeReduction(opt.value);
                                setValeurReduction(0);
                              }}
                              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                modeReduction === opt.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                              }`}>
                              <opt.icon size={13} /> {opt.label}
                            </button>
                          ))}
                        </div>
                        <div className="relative">
                          <input type="number" min={0}
                            max={modeReduction === "TAUX" ? 100 : totaux.total}
                            step={modeReduction === "TAUX" ? 0.5 : 1000}
                            value={valeurReduction} disabled={fermee}
                            aria-label={modeReduction === "TAUX" ? "Taux de réduction" : "Montant de la réduction"}
                            onChange={(e) => setValeurReduction(Math.max(0, parseFloat(e.target.value) || 0))}
                            className={`${inputClass} pr-16`} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                            {modeReduction === "TAUX" ? "%" : "XAF"}
                          </span>
                        </div>
                      </div>
                    )}
                  </Bloc>

                  {/* Récapitulatif */}
                  <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#cfe3ff]/20 to-white border-2 border-[#00A4E0]/20 rounded-xl space-y-2 text-sm self-start">
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold">Récapitulatif</p>
                    <div className="flex justify-between text-gray-600">
                      <span>Total</span><span className="font-semibold text-gray-900 tabular-nums">{formatMontant(totaux.total)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Réduction{avecReduction && modeReduction === "TAUX" && valeurReduction > 0 ? ` (${valeurReduction}%)` : ""}</span>
                      <span className={`font-semibold tabular-nums ${totaux.reduction > 0 ? "text-red-600" : "text-gray-400"}`}>
                        {totaux.reduction > 0 ? `- ${formatMontant(totaux.reduction)}` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t-2 border-[#00A4E0]/10">
                      <span className="font-bold text-gray-900">Net à payer</span>
                      <span className="text-lg sm:text-xl font-black text-[#0077A8] tabular-nums">{formatMontant(totaux.net)}</span>
                    </div>
                  </div>
                </div>

                {/* Validateur */}
                <Bloc titre="Validateur du devis" icon={UserCheck}>
                  {loadingEmetteurs ? (
                    <div className="flex justify-center py-3"><Loader2 size={20} className="animate-spin text-[#00A4E0]" /></div>
                  ) : emetteurs.length === 0 ? (
                    <p className="text-sm text-amber-700">Aucun validateur configuré. Créez-en un dans « Validateurs des devis » avant de valider un devis.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
                      {emetteurs.map((e) => {
                        const choisi = e.id === emetteurId;
                        return (
                          <button key={e.id} type="button" role="radio" aria-checked={choisi} disabled={fermee}
                            onClick={() => setEmetteurId(e.id)}
                            className={`relative text-left p-3 rounded-xl border-2 transition-all ${
                              choisi ? "border-[#00A4E0] bg-[#00A4E0]/5" : "border-gray-200 hover:border-gray-300"
                            }`}>
                            {choisi && (
                              <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#00A4E0] text-white flex items-center justify-center">
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                            <p className="font-semibold text-sm text-gray-900 pr-7 truncate">{e.nom}</p>
                            <p className="text-xs text-gray-500 truncate">{e.fonction}</p>
                            {e.actif && <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-semibold text-emerald-600">Par défaut</span>}
                            <div className="mt-2 h-14 rounded-lg bg-white border border-gray-100 flex items-center justify-center gap-3 px-2">
                              <img src={fileUrl(e.signatureUrl)} alt="Signature" className="h-11 max-w-[55%] object-contain" />
                              {e.cachetUrl ? (
                                <img src={fileUrl(e.cachetUrl)} alt="Cachet" className="h-11 max-w-[35%] object-contain" />
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] text-amber-600"><Stamp size={11} /> sans cachet</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Bloc>

                {/* Validité + condition */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className={labelClass}><CalendarDays size={14} className="text-[#00A4E0] flex-shrink-0" /> Validité (jours)</label>
                    <input type="number" min={1} max={365} value={validite} disabled={fermee} className={inputClass}
                      onChange={(e) => setValidite(Math.min(365, Math.max(1, parseInt(e.target.value, 10) || 30)))} />
                    <p className="text-[11px] sm:text-xs text-[#A6A6A6]">Jusqu'au {dateCourte(finValidite)}</p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className={labelClass}><FileText size={14} className="text-[#00A4E0] flex-shrink-0" /> Condition supplémentaire
                      <span className="text-gray-400 font-normal text-[11px] sm:text-xs">— optionnel</span></label>
                    <input value={conditions} maxLength={2000} disabled={fermee}
                      onChange={(e) => setConditions(e.target.value)}
                      placeholder="Ex : formation en intra-entreprise"
                      className={inputClass} />
                  </div>
                </div>

                {validateur && (
                  <p className="text-xs sm:text-sm text-gray-500">
                    Le devis sera signé par <strong className="text-gray-800">{validateur.nom}</strong> — {validateur.fonction}.
                  </p>
                )}
              </>
            )}

            {/* ================= ÉTAPE 2 : ENVOI ================= */}
            {devis && (
              <>
                <div className="p-5 sm:p-6 bg-green-50 border-2 border-green-300 rounded-xl text-center space-y-1">
                  <p className="text-green-700 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base">
                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                    Devis {devis.numero} validé
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-green-800 tabular-nums">{formatMontant(devis.netAPayer)}</p>
                  <p className="text-xs sm:text-sm text-green-700">
                    {devis.montantReduction > 0 && `Réduction de ${formatMontant(devis.montantReduction)} · `}
                    valable jusqu'au {dateCourte(devis.dateValidite)}
                    {devis.emetteurNom && ` · validé par ${devis.emetteurNom}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleDownload} disabled={busy}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold text-gray-700 disabled:opacity-50">
                    {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Télécharger le PDF
                  </button>
                  {!sent && (
                    <button type="button" onClick={() => setDevis(null)} disabled={busy}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold text-gray-700 disabled:opacity-50">
                      <RefreshCw size={15} /> Modifier et revalider
                    </button>
                  )}
                </div>

                {sent ? (
                  <div className="p-5 sm:p-6 bg-green-50 border-2 border-green-300 rounded-xl">
                    <p className="text-green-700 font-semibold text-center flex items-center justify-center gap-2 text-sm sm:text-base">
                      <Mail size={18} className="text-green-600 flex-shrink-0" />
                      Devis envoyé à {demande.email}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className={labelClass}>
                      <Mail size={14} className="text-[#00A4E0] flex-shrink-0" /> Message au client
                      <span className="text-gray-400 font-normal text-[11px] sm:text-xs">— envoyé à {demande.email}, devis PDF en pièce jointe</span>
                    </label>
                    <textarea rows={9} value={message} onChange={(e) => setMessage(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent transition-all hover:border-gray-300 resize-none" />
                  </div>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            {!devis ? (
              <>
                <button type="button" onClick={fermer} disabled={busy} className={`${btnCancel} flex-1`}>Annuler</button>
                <button type="button" onClick={handleGenerate} disabled={busy || fermee || lignes.length === 0 || !emetteurId}
                  className={`${btnPrimary} flex-1`}>
                  {generating ? <><Loader2 size={18} className="animate-spin" /> Validation...</> : <><FileSignature size={18} /> Valider et générer le devis</>}
                </button>
              </>
            ) : sent ? (
              <button type="button" onClick={fermer} className={`${btnPrimary} flex-1`}><CheckCircle2 size={18} /> Terminer</button>
            ) : (
              <>
                <button type="button" onClick={fermer} disabled={busy} className={`${btnCancel} flex-1`}>Plus tard</button>
                <button type="button" onClick={handleSend} disabled={busy} className={`${btnPrimary} flex-1`}>
                  {sending ? <><Loader2 size={18} className="animate-spin" /> Envoi...</> : <><Send size={18} /> Envoyer le devis</>}
                </button>
              </>
            )}
          </ModalFooter>
        </>
      )}
    </DevisModal>
  );
};

export default GenererDevisModal;