import { useEffect, useState } from "react";
import { Users as UsersIcon, Sparkles, Shield, Plus, UserCog } from "lucide-react";
import { User } from "@/types/user";
import { UserService } from "@/services/userService";
import CreateAdminModal from "@/components/users/CreateAdminModal";
import CreateSuperAdminForm from "@/components/users/CreateSuperAdminForm";
import ChangePasswordModal from "@/components/users/ChangePasswordModal";
import UserTable from "@/components/users/UserTable";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await UserService.getAll();
        if (isMounted) {
          setUsers(data);
        }
      } catch (error) {
        console.error("❌ Erreur chargement users:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const reloadUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("❌ Erreur rechargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      if (user.enabled) {
        await UserService.disable(user.id);
      } else {
        await UserService.enable(user.id);
      }
      reloadUsers();
    } catch (error) {
      console.error("❌ Erreur toggle status:", error);
    }
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 sm:p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-2.5 sm:gap-3 text-[#00A4E0]">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm sm:text-lg font-semibold">Chargement des utilisateurs...</span>
            </div>
            <p className="text-xs sm:text-sm text-[#A6A6A6] mt-2.5 sm:mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  const enabledCount = users.filter((u) => u.enabled).length;
  const disabledCount = users.filter((u) => !u.enabled).length;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-8">
      {/* Header avec effet de glassmorphism */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 p-4 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0]/5 via-[#0088CC]/5 to-[#0077A8]/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBBNEUwIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* Icône avec effet de glow */}
            <div className="relative group flex-shrink-0 hidden sm:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            {/* Titre et description */}
            <div className="min-w-0 flex items-center gap-3 sm:block">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg flex-shrink-0 sm:hidden">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-4xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                  <span className="truncate">Utilisateurs</span>
                  <Sparkles className="w-4 h-4 sm:w-7 sm:h-7 text-[#00A4E0] animate-pulse flex-shrink-0 hidden xs:block" />
                </h1>
                <p className="mt-0.5 sm:mt-2 text-xs sm:text-base text-gray-600 font-medium">
                  {users.length} compte{users.length > 1 ? "s" : ""} — Gérez les administrateurs et leurs accès
                </p>
              </div>
            </div>
          </div>

          {/* Bouton de création avec effet premium */}
          <button
            onClick={() => setShowCreateAdmin(true)}
            className="group relative px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-lg
                       bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8]
                       hover:from-[#0088CC] hover:via-[#0077A8] hover:to-[#006699]
                       shadow-2xl shadow-[#00A4E0]/40 hover:shadow-[#00A4E0]/60
                       sm:hover:scale-105 active:scale-95
                       transition-all duration-500
                       overflow-hidden
                       flex items-center justify-center gap-2.5 sm:gap-3 w-full lg:w-auto
                       min-h-[48px]"
          >
            {/* Effet shine animé */}
            <span className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

            {/* Icône avec animation */}
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-lg flex items-center justify-center sm:group-hover:scale-110 sm:group-hover:rotate-90 transition-all duration-300 flex-shrink-0">
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            <span className="relative">Nouvel ADMIN</span>
          </button>
        </div>

        {/* Stats rapides */}
        <div className="relative mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 flex flex-wrap gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-green-700">
              {enabledCount} actif{enabledCount > 1 ? "s" : ""}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-gray-600">
              {disabledCount} désactivé{disabledCount > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Create SuperAdmin Form */}
      <div className="animate-in slide-up duration-700">
        <CreateSuperAdminForm users={users} onCreated={reloadUsers} />
      </div>

      {/* Users Table */}
      <div className="animate-in slide-up duration-700">
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50">
          <div className="px-4 sm:px-8 py-3.5 sm:py-5 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-gray-200 flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-lg font-black text-gray-900 flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-md flex-shrink-0">
                <UsersIcon size={14} className="text-white" />
              </div>
              <span className="truncate">Liste des utilisateurs</span>
            </h2>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#A6A6A6] font-medium flex-shrink-0">
              <UserCog size={14} className="text-[#00A4E0]" />
              Gestion des rôles et accès
            </div>
          </div>

          <div className="p-3 sm:p-6">
            <UserTable
              users={users}
              onToggleStatus={toggleStatus}
              onChangePassword={handleChangePassword}
              onMenuAccessUpdated={reloadUsers}
            />
          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <CreateAdminModal
          onClose={() => setShowCreateAdmin(false)}
          onCreated={reloadUsers}
        />
      )}

      {/* Change Password Modal */}
      {selectedUser && (
        <ChangePasswordModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .slide-up {
          animation: slide-up 0.7s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UsersPage;