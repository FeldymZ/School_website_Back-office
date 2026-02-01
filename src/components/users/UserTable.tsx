import { Shield, User as UserIcon, CheckCircle, XCircle, Lock, Sparkles } from "lucide-react";
import { User, UserRole } from "@/types/user";

interface Props {
  users: User[];
  onToggleStatus: (user: User) => void;
  onChangePassword: (user: User) => void;
}

const UserTable = ({ users, onToggleStatus, onChangePassword }: Props) => {
  if (users.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#cfe3ff] via-white to-[#cfe3ff]/30 rounded-2xl p-20 text-center border-2 border-[#00A4E0]/20 shadow-xl">
        <div className="absolute top-10 right-10 w-40 h-40 bg-[#00A4E0]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#0077A8]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
            Aucun utilisateur
            <Sparkles size={20} className="text-[#00A4E0] animate-pulse" />
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            La liste des utilisateurs est vide
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cfe3ff] to-transparent rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00A4E0]/10 to-transparent rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gradient-to-r from-gray-50/90 via-[#cfe3ff]/10 to-gray-50/90 backdrop-blur-sm border-b-2 border-[#00A4E0]/20">
            <tr>
              <th className="px-6 py-5 text-left">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email
                </span>
              </th>
              <th className="px-6 py-5 text-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Rôle
                </span>
              </th>
              <th className="px-6 py-5 text-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Statut
                </span>
              </th>
              <th className="px-6 py-5 text-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.map((user, index) => (
              <tr key={user.id} className="bg-white transition-all hover:bg-gray-50">
                {/* Email */}
                <td className="px-6 py-5">
                  <div
                    style={{
                      animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <p className="font-bold text-gray-900">{user.email}</p>
                  </div>
                </td>

                {/* Rôle */}
                <td className="px-6 py-5 text-center">
                  <div
                    style={{
                      animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.1}s both`
                    }}
                  >
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-sm ${
                        user.role === UserRole.SUPERADMIN
                          ? "bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 text-purple-700"
                          : "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 text-blue-700"
                      }`}
                    >
                      <Shield size={16} />
                      {user.role}
                    </span>
                  </div>
                </td>

                {/* Statut */}
                <td className="px-6 py-5 text-center">
                  <div
                    style={{
                      animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.2}s both`
                    }}
                  >
                    <button
                      onClick={() => onToggleStatus(user)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all hover:scale-105 ${
                        user.enabled
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700"
                          : "bg-gray-50 border-2 border-gray-200 text-[#A6A6A6]"
                      }`}
                    >
                      {user.enabled ? (
                        <>
                          <CheckCircle size={16} /> Actif
                        </>
                      ) : (
                        <>
                          <XCircle size={16} /> Inactif
                        </>
                      )}
                    </button>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-5 text-center">
                  <div
                    style={{
                      animation: `slideIn 0.5s ease-out ${index * 0.1 + 0.3}s both`
                    }}
                  >
                    <button
                      onClick={() => onChangePassword(user)}
                      className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#00A4E0] bg-[#cfe3ff]/30 text-[#00A4E0] hover:bg-[#cfe3ff]/60 font-semibold transition-all hover:scale-105"
                    >
                      <Lock size={16} />
                      Changer mot de passe
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-gradient-to-r from-gray-50/80 to-[#cfe3ff]/20 border-t border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between text-sm text-[#A6A6A6]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#00A4E0]" />
            <span>{users.length} utilisateur{users.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Synchronisé</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
