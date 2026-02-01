import { useState } from "react";
import { ShieldAlert, Mail, Lock, Loader, Sparkles, AlertTriangle } from "lucide-react";
import { UserService } from "@/services/userService";
import { User, UserRole } from "@/types/user";

interface Props {
  users: User[];
  onCreated: () => void;
}

const CreateSuperAdminForm = ({ users, onCreated }: Props) => {
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

    if (!email || !password) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await UserService.createSecondSuperAdmin(email, password);
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
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl" />

      <div className="relative z-10 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-lg opacity-50 animate-pulse" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldAlert className="text-white" size={26} />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
              Créer le second SUPERADMIN
              <Sparkles size={18} className="text-amber-600 animate-pulse" />
            </h2>
            <p className="text-sm text-amber-700 mt-2">
              <AlertTriangle size={14} className="inline mr-1" />
              Cette action est <strong>définitive</strong>. Une fois le second SUPERADMIN créé,
              ce formulaire sera automatiquement désactivé.
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-6 bg-green-50 border-2 border-green-300 rounded-xl">
            <p className="text-green-700 font-semibold text-center flex items-center justify-center gap-2">
              <Sparkles size={18} className="text-green-600" />
              Second SUPERADMIN créé avec succès !
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <Mail size={16} className="text-amber-600" />
                Email
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="superadmin2@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-amber-200 rounded-xl px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           transition-all hover:border-amber-300 bg-white"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <Lock size={16} className="text-amber-600" />
                Mot de passe
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-amber-200 rounded-xl px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           transition-all hover:border-amber-300 bg-white"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-amber-500 to-orange-500
                         hover:shadow-lg hover:scale-105 active:scale-95
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
