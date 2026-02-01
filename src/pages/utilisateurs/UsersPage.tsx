import { useEffect, useState } from "react";
import { Users as UsersIcon, Sparkles, Shield } from "lucide-react";
import { User } from "@/types/user";
import { UserService } from "@/services/userService";
import CreateAdminForm from "@/components/users/CreateAdminForm";
import CreateSuperAdminForm from "@/components/users/CreateSuperAdminForm";
import ChangePasswordModal from "@/components/users/ChangePasswordModal";
import UserTable from "@/components/users/UserTable";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-2xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <UsersIcon className="w-10 h-10 text-white animate-bounce" />
              </div>
            </div>
            <div className="inline-flex items-center gap-3 text-[#00A4E0]">
              <div className="w-6 h-6 border-3 border-[#00A4E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-semibold">Chargement des utilisateurs...</span>
            </div>
            <p className="text-sm text-[#A6A6A6] mt-3">Veuillez patienter un instant</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A4E0] to-[#0077A8] flex items-center justify-center shadow-lg">
          <Shield className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Gestion des utilisateurs
            <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
          </h1>
          <p className="text-sm text-gray-500">
            Accès réservé au SUPERADMIN
          </p>
        </div>
      </div>

      {/* Create SuperAdmin Form */}
      <CreateSuperAdminForm users={users} onCreated={reloadUsers} />

      {/* Create Admin Form */}
      <CreateAdminForm onCreated={reloadUsers} />

      {/* Users Table */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UsersIcon size={20} className="text-[#00A4E0]" />
          Liste des utilisateurs
        </h2>
        <UserTable
          users={users}
          onToggleStatus={toggleStatus}
          onChangePassword={(user) => setSelectedUser(user)}
        />
      </div>

      {/* Change Password Modal */}
      {selectedUser && (
        <ChangePasswordModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <style>{`
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
