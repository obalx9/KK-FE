import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm font-medium">
      <button
        onClick={() => setLanguage('ru')}
        className={`px-2.5 py-1.5 transition-colors ${
          language === 'ru'
            ? 'bg-teal-500 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        RU
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1.5 transition-colors ${
          language === 'en'
            ? 'bg-teal-500 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        EN
      </button>
    </div>
  );
}
