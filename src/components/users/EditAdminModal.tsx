import { useState, useRef, useEffect } from "react";
import { X, Save, Mail, Loader, Sparkles, User as UserIcon, Image, Upload, Trash2 } from "lucide-react";
import { UserService } from "@/services/userService";
import { User } from "@/types/user";

interface Props {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}

const MAX_PHOTO_SIZE = 3 * 1024 * 1024; // 3 Mo

const EditAdminModal = ({ user, onClose, onSaved }: Props) => {
  const [nom, setNom] = useState(user.nom ?? "");
  const [prenom, setPrenom] = useState(user.prenom ?? "");
  const [email, setEmail] = useState(user.email);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    if (user.hasPhoto) {
      UserService.getPhotoUrl(user.id).then((url) => {
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        if (url) {
          objectUrl = url;
          setExistingPhotoUrl(url);
        }
      });
    }

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user.id, user.hasPhoto]);

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
    setRemovePhoto(false);
    setPhoto(file);

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayedPhoto = photoPreview ?? (!removePhoto ? existingPhotoUrl : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom || !prenom || !email) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await UserService.updateAdminInfo(
        user.id,
        { nom, prenom, email, removePhoto },
        photo
      );
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      onSaved();
      onClose();
    } catch (err) {
      console.error("❌ Erreur modification utilisateur:", err);
      setError("Modification impossible (email déjà utilisé par un autre compte ?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0] to-[#0077A8] opacity-10" />
          <div className="relative flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
                  <UserIcon className="text-white" size={26} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Modifier l'utilisateur
                  <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
                </h2>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Photo */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Image size={16} className="text-[#00A4E0]" />
              Photo de profil
              <span className="text-gray-400 font-normal text-xs">— optionnel, max 3 Mo</span>
            </label>

            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                {displayedPhoto ? (
                  <img
                    src={displayedPhoto}
                    alt="Aperçu"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#00A4E0]/30 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <UserIcon size={24} className="text-gray-300" />
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
                  id="edit-admin-photo-input"
                />
                <label
                  htmlFor="edit-admin-photo-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200
                             hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold text-gray-700"
                >
                  <Upload size={15} />
                  Changer
                </label>
                {displayedPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium text-left"
                  >
                    <Trash2 size={13} />
                    Retirer la photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nom + Prénom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <UserIcon size={16} className="text-[#00A4E0]" />
                Nom
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <UserIcon size={16} className="text-[#00A4E0]" />
                Prénom
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                           transition-all hover:border-gray-300"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Mail size={16} className="text-[#00A4E0]" />
              Email
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700
                         hover:bg-gray-100 hover:border-gray-300 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                         hover:shadow-lg hover:scale-105 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdminModal;