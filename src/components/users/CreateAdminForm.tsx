import { useState } from "react";
import { UserPlus, Mail, Lock, Loader, Sparkles } from "lucide-react";
import { UserService } from "@/services/userService";

interface Props {
  onCreated: () => void;
}

const CreateAdminForm = ({ onCreated }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await UserService.createAdmin(email, password);
      setEmail("");
      setPassword("");
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40" />

      <div className="relative z-10 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="text-white" size={26} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Créer un compte ADMIN
              <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
            </h2>
            <p className="text-sm text-gray-500 mt-1">Ajouter un nouvel administrateur</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="admin@school.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                         transition-all hover:border-gray-300"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Lock size={16} className="text-[#00A4E0]" />
              Mot de passe
              <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-[#00A4E0] to-[#0077A8]
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
