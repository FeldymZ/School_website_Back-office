import { useState, useEffect } from "react";
import { Menu, LogOut, UserCircle, Sparkles, AlertTriangle, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLayout } from "../context/useLayout";
import { useUser } from "../context/UserContext";
import { logout } from "../utils/auth";
import { UserService } from "@/services/userService";
import { User } from "@/types/user";
import EditProfileModal from "@/components/users/EditProfileModal";

const titles: Record<string, string> = {
  "/": "Tableau de bord",
  "/dashboard": "Tableau de bord",
  "/formations": "Formations",
  "/agenda": "Agenda",
  "/actualites": "Actualités",
  "/messages": "Messages",
  "/banners": "Bannières",
  "/commentaires": "Commentaires",
  "/partenaires": "Partenaires",
  "/statistiques": "Statistiques",
  "/utilisateurs": "Utilisateurs",
  "/configuration": "Configuration",
};

/* ================= LOGOUT CONFIRM MODAL ================= */
const LogoutConfirmModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

    <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900">Se déconnecter ?</h3>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="px-6 py-5">
        <p className="text-sm text-gray-500">
          Vous devrez vous reconnecter pour accéder à nouveau à votre espace d'administration.
        </p>
      </div>

      <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700
                     hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white
                     bg-gradient-to-r from-red-500 to-pink-600
                     hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </div>
  </div>
);

/* ================= USER AVATAR (charge la vraie photo si disponible) ================= */
const UserAvatar = ({
  hasPhoto,
  onPhotoLoaded,
}: {
  hasPhoto?: boolean;
  onPhotoLoaded?: (url: string | null) => void;
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    if (hasPhoto) {
      UserService.getMyPhotoUrl().then((url) => {
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        if (url) {
          objectUrl = url;
          setPhotoUrl(url);
          onPhotoLoaded?.(url);
        }
      });
    } else {
      setPhotoUrl(null);
      onPhotoLoaded?.(null);
    }

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPhoto]);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="Photo de profil"
        className="w-9 h-9 rounded-full object-cover shadow-lg group-hover:shadow-xl transition-shadow"
      />
    );
  }

  return (
    <div className="w-9 h-9 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
      <UserCircle size={20} className="text-white" />
    </div>
  );
};

const Topbar = () => {
  const { toggleSidebar } = useLayout();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUser(); // fournit au minimum email/role depuis le JWT
  const [me, setMe] = useState<User | null>(null);
  const [myPhotoUrl, setMyPhotoUrl] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    let cancelled = false;
    UserService.getMe()
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const title = titles[pathname] ?? "Administration";

  const displayName =
    me?.nom || me?.prenom
      ? `${me?.prenom ?? ""} ${me?.nom ?? ""}`.trim()
      : user?.email ?? "Administrateur";

  const displayRole = me?.role ?? user?.role ?? "En ligne";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="relative h-16 bg-gradient-to-r from-white via-white to-[#cfe3ff]/20 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00A4E0]/5 to-transparent opacity-50" />

      {/* LEFT */}
      <div className="relative z-10 flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-600 hover:text-[#00A4E0] hover:bg-[#cfe3ff]/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-[#00A4E0] to-[#0077A8] rounded-full" />
            <Sparkles size={18} className="text-[#00A4E0] animate-pulse" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative z-10 flex items-center gap-3">
        {/* User Profile (cliquable → ouvre "Mon profil") */}
        <button
          type="button"
          onClick={() => setShowEditProfile(true)}
          className="group relative flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#cfe3ff]/30 to-transparent border border-[#cfe3ff] hover:border-[#00A4E0] transition-all duration-200 cursor-pointer"
        >
          <div className="relative">
            <UserAvatar hasPhoto={me?.hasPhoto} onPhotoLoaded={setMyPhotoUrl} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>

          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
              {displayName}
            </p>
            <p className="text-xs text-[#A6A6A6]">{displayRole}</p>
          </div>

          {/* Dropdown indicator */}
          <div className="hidden md:block text-[#A6A6A6] group-hover:text-[#00A4E0] transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="group relative p-3 text-gray-500 hover:text-white rounded-xl border border-gray-200 hover:border-red-500 bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
          title="Se déconnecter"
        >
          <LogOut size={20} className="relative z-10" />

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
              Se déconnecter
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
            </div>
          </div>
        </button>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00A4E0] to-transparent opacity-50" />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && me && (
        <EditProfileModal
          me={me}
          currentPhotoUrl={myPhotoUrl}
          onClose={() => setShowEditProfile(false)}
          onSaved={(updated) => {
            setMe(updated);
            // Si la photo a été retirée côté serveur, on nettoie l'URL locale
            if (!updated.hasPhoto) setMyPhotoUrl(null);
          }}
        />
      )}
    </header>
  );
};

export default Topbar;