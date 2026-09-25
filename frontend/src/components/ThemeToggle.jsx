import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
        isDark ? 'bg-slate-700' : 'bg-slate-200'
      } ${className}`}
      aria-label="Toggle theme"
    >
      <div
        className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
          isDark
            ? 'left-7 bg-slate-900 text-yellow-400'
            : 'left-1 bg-white text-orange-500'
        }`}
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </div>
    </button>
  );
}