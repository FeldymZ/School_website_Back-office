import { useState } from "react";
import { ShieldAlert, Mail, Lock, Loader, Sparkles, AlertTriangle, User as UserIcon } from "lucide-react";
import { UserService } from "@/services/userService";
import { User, UserRole } from "@/types/user";

interface Props {
  users: User[];
  onCreated: () => void;
}

const CreateSuperAdminForm = ({ users, onCreated }: Props) => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const superAdminCount = users.filter((u) => u.role === UserRole.SUPERADMIN).length;

  if (superAdminCount >= 2) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom || !prenom || !email || !password) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await UserService.createSecondSuperAdmin({ nom, prenom, email, password });
      setSuccess(true);
      onCreated();
    } catch (error) {
      console.error("❌ Erreur création SUPERADMIN:", error);
      setError("Impossible de créer le SUPERADMIN (déjà existant ?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border-2 border-amber-300 shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-8 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative group flex-shrink-0 hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-lg opacity-50 animate-pulse" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldAlert className="text-white" size={26} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-2xl font-bold text-amber-900 flex items-center gap-1.5 sm:gap-2">
              <ShieldAlert className="text-amber-600 flex-shrink-0 sm:hidden" size={20} />
              Créer le second SUPERADMIN
              <Sparkles size={16} className="text-amber-600 animate-pulse flex-shrink-0 hidden sm:block" />
            </h2>
            <p className="text-xs sm:text-sm text-amber-700 mt-1.5 sm:mt-2">
              <AlertTriangle size={13} className="inline mr-1 flex-shrink-0" />
              Cette action est <strong>définitive</strong>. Une fois le second SUPERADMIN créé,
              ce formulaire sera automatiquement désactivé.
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-5 sm:p-6 bg-green-50 border-2 border-green-300 rounded-xl">
            <p className="text-green-700 font-semibold text-center flex items-center justify-center gap-2 text-sm sm:text-base">
              <Sparkles size={18} className="text-green-600 flex-shrink-0" />
              Second SUPERADMIN créé avec succès !
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nom + Prénom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-900">
                  <UserIcon size={14} className="text-amber-600 flex-shrink-0" />
                  Nom
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nguema"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm sm:text-base
                             focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                             transition-all hover:border-amber-300 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-900">
                  <UserIcon size={14} className="text-amber-600 flex-shrink-0" />
                  Prénom
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Jean"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm sm:text-base
                             focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                             transition-all hover:border-amber-300 bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-900">
                <Mail size={14} className="text-amber-600 flex-shrink-0" />
                Email
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                inputMode="email"
                placeholder="superadmin2@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           transition-all hover:border-amber-300 bg-white"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-900">
                <Lock size={14} className="text-amber-600 flex-shrink-0" />
                Mot de passe
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           transition-all hover:border-amber-300 bg-white"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3.5 sm:p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] px-6 py-3 rounded-xl font-semibold text-white text-sm sm:text-base
                         bg-gradient-to-r from-amber-500 to-orange-500
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
                  <ShieldAlert size={18} />
                  Créer le second SUPERADMIN
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateSuperAdminForm;