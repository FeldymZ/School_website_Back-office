import { useState, useRef, useEffect } from "react";
import { X, UserPlus, Mail, Lock, Loader, Sparkles, LayoutGrid, User, Image, Upload } from "lucide-react";
import { UserService } from "@/services/userService";
import MenuAccessDropdownSelector from "@/components/MenuAccessDropdownSelector";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const MAX_PHOTO_SIZE = 3 * 1024 * 1024; // 3 Mo — cohérent avec la limite back
const CLOSE_DRAG_THRESHOLD = 120;

const CreateAdminModal = ({ onClose, onCreated }: Props) => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [menuAccess, setMenuAccess] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const isDragging = useRef(false);

  const handleClose = () => {
    if (loading) return;
    setIsClosing(true);
    window.setTimeout(onClose, 200);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setError("La photo ne doit pas dépasser 3 Mo");
      return;
    }

    setError(null);
    setPhoto(file);

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom || !prenom || !email || !password) {
      setError("Tous les champs marqués * sont obligatoires");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await UserService.createAdmin(
        { nom, prenom, email, password, menuAccess },
        photo
      );
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      onCreated();
      onClose();
    } catch (error) {
      console.error("❌ Erreur création ADMIN:", error);
      setError("Création impossible (email déjà utilisé ?)");
    } finally {
      setLoading(false);
    }
  };

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Lock body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Focus trap
  useEffect(() => {
    closeBtnRef.current?.focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, []);

  // Swipe-down-to-dismiss
  const onTouchStart = (e: React.TouchEvent) => {
    if (loading) return;
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    dragStartY.current = null;
    if (dragY > CLOSE_DRAG_THRESHOLD) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4
                  transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-admin-title"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: isDragging.current ? "none" : "transform 0.25s cubic-bezier(0.32,0.72,0,1)",
        }}
        className={`relative bg-white w-full sm:max-w-lg
                   h-[92vh] sm:h-auto sm:max-h-[90vh]
                   overflow-y-auto overscroll-contain
                   rounded-t-2xl sm:rounded-2xl
                   shadow-2xl flex flex-col
                   ${isClosing ? "animate-out-down sm:animate-out-fade" : "animate-in-up sm:animate-in-zoom"}`}
      >
        {/* Drag handle (mobile only) */}
        <div
          className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div
          className="relative overflow-hidden flex-shrink-0 touch-none sm:touch-auto"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between gap-3 px-4 sm:px-8 py-3.5 sm:py-6 border-b border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative group flex-shrink-0 hidden sm:block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <UserPlus className="text-white" size={26} />
                </div>
              </div>
              <div className="min-w-0">
                <h2
                  id="create-admin-title"
                  className="text-base sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 truncate"
                >
                  Créer un compte ADMIN
                  <Sparkles size={16} className="text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">Ajouter un nouvel administrateur</p>
              </div>
            </div>

            <button
              ref={closeBtnRef}
              onClick={handleClose}
              disabled={loading}
              aria-label="Fermer"
              className="p-2.5 -mr-1 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors flex-shrink-0
                         min-w-[44px] min-h-[44px] flex items-center justify-center
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-8 space-y-5 sm:space-y-6">

          {/* Photo de profil */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 flex-wrap">
              <Image size={14} className="text-[#00A4E0] flex-shrink-0" />
              Photo de profil
              <span className="text-gray-400 font-normal text-[11px] sm:text-xs">— optionnel, max 3 Mo</span>
            </label>

            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Aperçu"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#00A4E0]/30 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <User size={20} className="text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="admin-photo-input"
                />
                <label
                  htmlFor="admin-photo-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl border border-gray-200
                             hover:bg-gray-50 active:bg-gray-100 hover:border-gray-300 transition-all text-sm font-semibold text-gray-700
                             min-h-[40px]"
                >
                  <Upload size={15} />
                  {photo ? "Changer" : "Choisir une image"}
                </label>
                {photo && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-xs text-red-500 hover:text-red-600 font-medium text-left"
                  >
                    Retirer la photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nom + Prénom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <User size={14} className="text-[#00A4E0] flex-shrink-0" />
                Nom
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nguema"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <User size={14} className="text-[#00A4E0] flex-shrink-0" />
                Prénom
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Jean"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <Mail size={14} className="text-[#00A4E0] flex-shrink-0" />
              Email
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@school.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <Lock size={14} className="text-[#00A4E0] flex-shrink-0" />
              Mot de passe
              <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Menu Access */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <LayoutGrid size={14} className="text-[#00A4E0] flex-shrink-0" />
              Menus accessibles
            </label>
            <MenuAccessDropdownSelector selected={menuAccess} onChange={setMenuAccess} />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-1 sm:pt-2
                          pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:pb-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 min-h-[48px] px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 text-sm sm:text-base
                         hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 min-h-[48px] px-6 py-3 rounded-xl font-semibold text-white text-sm sm:text-base
                         bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                         hover:shadow-lg sm:hover:scale-105 active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Créer l'ADMIN
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes in-up {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes out-down {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(60px); }
        }
        @keyframes in-zoom {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes out-fade {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.97); }
        }
        .animate-in-up { animation: in-up 0.28s cubic-bezier(0.32,0.72,0,1) both; }
        .animate-out-down { animation: out-down 0.2s cubic-bezier(0.32,0.72,0,1) both; }
        .animate-in-zoom { animation: in-zoom 0.2s ease-out both; }
        .animate-out-fade { animation: out-fade 0.18s ease-in both; }
      `}</style>
    </div>
  );
};

export default CreateAdminModal;