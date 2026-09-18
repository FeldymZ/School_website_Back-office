import { useTheme } from "@/context/useTheme";
import { Sun, Moon } from "lucide-react";


export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className="relative w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-gray-800 flex items-center justify-center
                 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm"
    >
      <Sun
        size={18}
        className={`absolute text-amber-500 transition-all duration-300 ${
          isDark ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
        }`}
      />
      <Moon
        size={18}
        className={`absolute text-[#00A4E0] transition-all duration-300 ${
          isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
        }`}
      />
    </button>
  );
}