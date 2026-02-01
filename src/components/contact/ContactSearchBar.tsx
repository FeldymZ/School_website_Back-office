import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function ContactSearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search size={20} className="text-[#00A4E0]" />
      </div>

      <input
        type="text"
        placeholder="Rechercher par nom ou email..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full md:w-96 pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-[#00A4E0] focus:border-transparent
                   transition-all hover:border-gray-300 shadow-sm hover:shadow-md"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2
                     text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Effacer la recherche"
        >
          ×
        </button>
      )}
    </div>
  );
}
