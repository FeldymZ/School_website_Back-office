import { useState } from "react";
import { Banner, BannerUpdatePayload } from "@/types/banner";
import { BannerService } from "@/services/bannerService";
import { X } from "lucide-react";

/* ================= PROPS ================= */

interface Props {
  banner: Banner;
  onClose: () => void;
  onUpdated: () => void;
}

/* ================= COMPONENT ================= */

const BannerEditModal = ({ banner, onClose, onUpdated }: Props) => {
  /* ================= STATE ================= */

  const [title, setTitle] = useState(banner.title);
  const [subtitle, setSubtitle] = useState(banner.subtitle ?? "");
  const [subtitleAlt, setSubtitleAlt] = useState(banner.subtitleAlt ?? "");

  const [displayOrder, setDisplayOrder] = useState(banner.displayOrder);
  const [enabled, setEnabled] = useState(banner.enabled);

  const [startAt, setStartAt] = useState<string>(
    banner.startAt ? banner.startAt.slice(0, 16) : ""
  );
  const [endAt, setEndAt] = useState<string>(
    banner.endAt ? banner.endAt.slice(0, 16) : ""
  );

  const [buttonLabel, setButtonLabel] = useState(
    banner.buttonLabel ?? ""
  );
  const [buttonUrl, setButtonUrl] = useState(
    banner.buttonUrl ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= SUBMIT ================= */

  const submit = async () => {
    setError(null);
    setLoading(true);

    const payload: BannerUpdatePayload = {
      title,
      subtitle: subtitle || null,
      subtitleAlt: subtitleAlt || null,
      displayOrder,
      enabled,
      startAt: startAt ? new Date(startAt).toISOString() : null,
      endAt: endAt ? new Date(endAt).toISOString() : null,
      buttonLabel: buttonUrl ? buttonLabel || "En savoir plus" : null,
      buttonUrl: buttonUrl || null,
    };

    try {
      await BannerService.update(banner.id, payload);
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la mise à jour du banner");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Modifier le banner</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* TITLE */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Titre
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* SUBTITLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Sous-titre
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Sous-titre alternatif
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={subtitleAlt}
                onChange={e => setSubtitleAlt(e.target.value)}
              />
            </div>
          </div>

          {/* ORDER + ENABLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Ordre d’affichage
              </label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={displayOrder}
                onChange={e =>
                  setDisplayOrder(Number(e.target.value))
                }
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <input
                type="checkbox"
                checked={enabled}
                onChange={e => setEnabled(e.target.checked)}
              />
              <span className="text-sm font-semibold">
                Banner actif
              </span>
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Début
              </label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                value={startAt}
                onChange={e => setStartAt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Fin
              </label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                value={endAt}
                onChange={e => setEndAt(e.target.value)}
              />
            </div>
          </div>

          {/* BUTTON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Texte du bouton
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={buttonLabel}
                onChange={e => setButtonLabel(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                URL du bouton
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                value={buttonUrl}
                onChange={e => setButtonUrl(e.target.value)}
                placeholder="/formations ou https://..."
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="px-6 py-2 bg-[#00A4E0] text-white rounded font-semibold"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerEditModal;
