import { useState } from "react";
import { X, UserPlus, Mail, Lock, Loader, Sparkles, LayoutGrid } from "lucide-react";
import { UserService } from "@/services/userService";
import MenuAccessDropdownSelector from "@/components/MenuAccessDropdownSelector";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const CreateAdminModal = ({ onClose, onCreated }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [menuAccess, setMenuAccess] = useState<string[]>([]);
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
      await UserService.createAdmin(email, password, menuAccess);
      onCreated();
      onClose();
    } catch (error) {
      console.error("❌ Erreur création ADMIN:", error);
      setError("Création impossible (email déjà utilisé ?)");
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

            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
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

          {/* Menu Access */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <LayoutGrid size={16} className="text-[#00A4E0]" />
              Menus accessibles
            </label>
            <MenuAccessDropdownSelector selected={menuAccess} onChange={setMenuAccess} />
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
    </div>
  );
};

export default CreateAdminModal;