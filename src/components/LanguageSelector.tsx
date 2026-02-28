import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 px-3 py-2">
      <Globe className="w-4 h-4 text-gray-400" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'ru' | 'en')}
        className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
      >
        <option value="ru">РУ</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}
