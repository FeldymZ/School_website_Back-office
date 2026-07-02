import { useState } from "react"
import { X, Loader, LayoutGrid } from "lucide-react"
import { User } from "@/types/user"
import { UserService } from "@/services/userService"
import MenuAccessDropdownSelector from "@/components/MenuAccessDropdownSelector"

interface Props {
  user: User
  onClose: () => void
  onSaved: () => void
}

const ManageMenuAccessModal = ({ user, onClose, onSaved }: Props) => {
  const [menuAccess, setMenuAccess] = useState<string[]>(user.menuAccess ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      await UserService.updateMenuAccess(user.id, menuAccess)
      onSaved()
    } catch {
      setError("Impossible de sauvegarder les accès")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00A4E0] to-[#0077A8] rounded-xl flex items-center justify-center">
              <LayoutGrid size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Gérer les menus</h3>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <MenuAccessDropdownSelector selected={menuAccess} onChange={setMenuAccess} />
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-[#00A4E0] to-[#0077A8] hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader size={16} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

export default ManageMenuAccessModal