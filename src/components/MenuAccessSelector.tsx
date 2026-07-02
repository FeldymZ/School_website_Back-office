import { MENU_PERMISSION_GROUPS } from "@/constants/menuPermissions"

interface Props {
  selected: string[]
  onChange: (keys: string[]) => void
}

const MenuAccessSelector = ({ selected, onChange }: Props) => {
  const toggle = (key: string) => {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  }

  const toggleSection = (keys: string[], allSelected: boolean) => {
    onChange(allSelected ? selected.filter((k) => !keys.includes(k)) : [...new Set([...selected, ...keys])])
  }

  return (
    <div className="space-y-4">
      {MENU_PERMISSION_GROUPS.map((group) => {
        const keys = group.items.map((i) => i.key)
        const allSelected = keys.every((k) => selected.includes(k))

        return (
          <div key={group.section} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider">{group.section}</p>
              <button
                type="button"
                onClick={() => toggleSection(keys, allSelected)}
                className="text-xs font-semibold text-[#00A4E0] hover:underline"
              >
                {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-all ${
                    selected.includes(item.key)
                      ? "bg-[#00A4E0]/10 border-[#00A4E0] text-[#00A4E0] font-semibold"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(item.key)}
                    onChange={() => toggle(item.key)}
                    className="accent-[#00A4E0]"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MenuAccessSelector