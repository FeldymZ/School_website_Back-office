import { useEffect, useState } from "react";
import { Users as UsersIcon, Sparkles, Shield, Plus } from "lucide-react";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 border-4 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xl font-bold text-gray-700">
            Chargement des utilisateurs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 p-3   space-y-5">
      {/* Header avec effet de glassmorphism */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A4E0]/5 via-[#0088CC]/5 to-[#0077A8]/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBBNEUwIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icône avec effet de glow */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Titre et description */}
            <div>
              <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                Utilisateurs
                <Sparkles className="w-7 h-7 text-[#00A4E0] animate-pulse" />
              </h1>
              <p className="mt-2 text-gray-600 font-medium">
                Gérez les comptes administrateurs et leurs accès
              </p>
            </div>
          </div>

          {/* Bouton de création avec effet premium */}
          <button
            onClick={() => setShowCreateAdmin(true)}
            className="group relative px-8 py-4 rounded-2xl font-bold text-white text-lg
                       bg-gradient-to-r from-[#00A4E0] via-[#0088CC] to-[#0077A8]
                       hover:from-[#0088CC] hover:via-[#0077A8] hover:to-[#006699]
                       shadow-2xl shadow-[#00A4E0]/40 hover:shadow-[#00A4E0]/60
                       hover:scale-105 active:scale-95
                       transition-all duration-500
                       overflow-hidden
                       flex items-center gap-3"
          >
            {/* Effet shine animé */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

            {/* Glow pulsant */}
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-2xl" />

            {/* Icône avec animation */}
            <div className="relative w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
              <Plus className="w-4 h-4" />
            </div>

            <span className="relative">Nouvel ADMIN</span>
          </button>
        </div>
      </div>

      {/* Create SuperAdmin Form */}
      <CreateSuperAdminForm users={users} onCreated={reloadUsers} />

      {/* Users Table */}
      <div className="animate-in slide-up duration-700">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UsersIcon size={20} className="text-[#00A4E0]" />
          Liste des utilisateurs
        </h2>
        <UserTable
          users={users}
          onToggleStatus={toggleStatus}
          onChangePassword={handleChangePassword}
          onMenuAccessUpdated={reloadUsers}
        />
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