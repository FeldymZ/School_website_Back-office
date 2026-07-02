import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import { MENU_PERMISSION_GROUPS } from "@/constants/menuPermissions"

interface Props {
  selected: string[]
  onChange: (keys: string[]) => void
}

const MenuAccessDropdownSelector = ({ selected, onChange }: Props) => {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggle = (key: string) => {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  }

  const toggleSection = (keys: string[], allSelected: boolean) => {
    onChange(allSelected ? selected.filter((k) => !keys.includes(k)) : [...new Set([...selected, ...keys])])
  }

  return (
    <div className="space-y-2">
      {MENU_PERMISSION_GROUPS.map((group) => {
        const keys = group.items.map((i) => i.key)
        const selectedCount = keys.filter((k) => selected.includes(k)).length
        const allSelected = selectedCount === keys.length
        const isOpen = openSection === group.section

        return (
          <div key={group.section} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSection(isOpen ? null : group.section)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                isOpen ? "bg-[#00A4E0]/5" : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{group.section}</span>
                {selectedCount > 0 && (
                  <span className="inline-flex items-center justify-center text-[11px] font-bold bg-[#00A4E0] text-white px-2 py-0.5 rounded-full min-w-[20px]">
                    {selectedCount}
                  </span>
                )}
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 space-y-2">
                <button
                  type="button"
                  onClick={() => toggleSection(keys, allSelected)}
                  className="text-xs font-semibold text-[#00A4E0] hover:underline mb-1"
                >
                  {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const isChecked = selected.includes(item.key)
                    return (
                      <label
                        key={item.key}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-all ${
                          isChecked
                            ? "bg-[#00A4E0]/10 border-[#00A4E0] text-[#00A4E0] font-semibold"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 ${
                            isChecked ? "bg-[#00A4E0] border-[#00A4E0]" : "border-gray-300"
                          }`}
                        >
                          {isChecked && <Check size={11} className="text-white" strokeWidth={3} />}
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(item.key)}
                          className="sr-only"
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default MenuAccessDropdownSelector