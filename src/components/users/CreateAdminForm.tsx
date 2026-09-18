import { useState, useRef } from "react";
import { UserPlus, Mail, Lock, Loader, Sparkles, LayoutGrid, User, Image, Upload } from "lucide-react";
import { UserService } from "@/services/userService";
import MenuAccessSelector from "@/components/MenuAccessSelector";

interface Props {
  onCreated: () => void;
}

const MAX_PHOTO_SIZE = 3 * 1024 * 1024; // 3 Mo — cohérent avec la limite back

const CreateAdminForm = ({ onCreated }: Props) => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [menuAccess, setMenuAccess] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const resetForm = () => {
    setNom("");
    setPrenom("");
    setEmail("");
    setPassword("");
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    setMenuAccess([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom || !prenom || !email || !password) {
      setError("Tous les champs marqués * sont obligatoires");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await UserService.createAdmin(
        { nom, prenom, email, password, menuAccess },
        photo
      );
      resetForm();
      onCreated();
    } catch (error) {
      console.error("❌ Erreur création ADMIN:", error);
      setError("Création impossible (email déjà utilisé ?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-8 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative group flex-shrink-0 hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="text-white" size={26} />
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
              Créer un compte ADMIN
              <Sparkles size={16} className="text-[#00A4E0] animate-pulse flex-shrink-0 hidden sm:block" />
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Ajouter un nouvel administrateur</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

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
                  id="admin-photo-input-form"
                />
                <label
                  htmlFor="admin-photo-input-form"
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
            <MenuAccessSelector selected={menuAccess} onChange={setMenuAccess} />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] px-6 py-3 rounded-xl font-semibold text-white text-sm sm:text-base
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
                       hover:shadow-lg sm:hover:scale-105 active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Créer l'ADMIN
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminForm;