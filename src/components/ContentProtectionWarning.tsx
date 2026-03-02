import { useState, useEffect } from 'react';
import { Shield, X, AlertTriangle } from 'lucide-react';

interface ContentProtectionWarningProps {
  courseName: string;
}

export default function ContentProtectionWarning({ courseName }: ContentProtectionWarningProps) {
  const [isVisible, setIsVisible] = useState(false);
  const storageKey = `protection-warning-shown-${courseName}`;

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem(storageKey);
    if (!hasSeenWarning) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, [storageKey]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-2xl max-w-2xl w-full relative animate-scale-in border-2 sm:border-4 border-red-400 flex flex-col max-h-[90vh]">
        <div className="flex items-center gap-3 p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight">ЗАЩИТА КОНТЕНТА</h2>
            <p className="text-red-100 text-xs sm:text-sm mt-0.5">Важная информация</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="bg-white/10 rounded-xl p-3 sm:p-5 mb-3 sm:mb-4 backdrop-blur-sm">
            <div className="flex items-start gap-2 sm:gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div className="text-white">
                <p className="font-semibold text-sm sm:text-base mb-1.5">ПРЕДУПРЕЖДЕНИЕ О ЗАЩИТЕ АВТОРСКИХ ПРАВ</p>
                <p className="text-red-100 text-xs sm:text-sm leading-relaxed">
                  Весь контент данного курса защищен водяными знаками с вашими персональными данными.
                  Любая попытка копирования, распространения или перепродажи материалов будет отслеживаться.
                </p>
              </div>
            </div>

            <div className="border-t border-white/20 pt-3 mt-3">
              <p className="text-white font-semibold text-xs sm:text-sm mb-2">Последствия нарушения:</p>
              <ul className="space-y-1.5 text-red-100 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300 font-bold mt-0.5 flex-shrink-0">•</span>
                  <span>Немедленная блокировка доступа к курсу без возврата средств</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300 font-bold mt-0.5 flex-shrink-0">•</span>
                  <span>Административная и уголовная ответственность за нарушение авторских прав</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300 font-bold mt-0.5 flex-shrink-0">•</span>
                  <span>Взыскание материального ущерба и компенсации правообладателю</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300 font-bold mt-0.5 flex-shrink-0">•</span>
                  <span>Внесение в черный список с запретом покупки других курсов</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 backdrop-blur-sm">
            <p className="text-white text-xs sm:text-sm leading-relaxed">
              <span className="font-semibold">Система защиты:</span> Все видео и изображения содержат ваши
              персональные водяные знаки. Включена защита от скриншотов и записи экрана.
              При обнаружении попыток копирования или открытия инструментов разработчика система
              автоматически фиксирует нарушение.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-full bg-white hover:bg-gray-100 text-red-700 font-bold py-3 sm:py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm sm:text-base"
          >
            Я понимаю и принимаю условия
          </button>

          <p className="text-center text-red-100 text-xs mt-3 opacity-80">
            Продолжая использование курса, вы соглашаетесь соблюдать правила защиты авторских прав
          </p>
        </div>
      </div>
    </div>
  );
}
