import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';

interface TelegramLoginProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: unknown) => void;
  }
}

export default function TelegramLogin({ onSuccess }: TelegramLoginProps) {
  const { t } = useLanguage();
  const { loginWithToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    const loadBotConfig = async () => {
      try {
        const data = await apiRequest<{ bot_username: string }>('/api/telegram/bot-username');
        if (data.bot_username) {
          setBotUsername(data.bot_username);
        }
      } catch (err) {
        console.error('Error loading bot config:', err);
      }
    };
    loadBotConfig();
  }, []);

  useEffect(() => {
    if (!botUsername || scriptLoadedRef.current) return;

    scriptLoadedRef.current = true;

    window.onTelegramAuth = async (user: unknown) => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiRequest<{ token: string }>('/api/auth/telegram', {
          method: 'POST',
          body: user,
        });

        if (!data.token) {
          throw new Error('No token in response');
        }

        await loginWithToken(data.token);

        if (onSuccess) {
          onSuccess();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('authError');
        console.error('Telegram auth error:', err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    const container = containerRef.current;
    if (!container) return;

    const existingScripts = container.getElementsByTagName('script');
    while (existingScripts.length > 0) {
      existingScripts[0].remove();
    }
    const existingIframes = container.getElementsByTagName('iframe');
    while (existingIframes.length > 0) {
      existingIframes[0].remove();
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    container.appendChild(script);

    return () => {
      scriptLoadedRef.current = false;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
      delete window.onTelegramAuth;
    };
  }, [botUsername, onSuccess, t, loginWithToken]);

  if (!botUsername) {
    return (
      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
        {t('configureTelegramBot')}
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={containerRef}
          className="flex justify-center"
          style={{ pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.5 : 1 }}
        ></div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-6 h-6 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
