import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface OAuthButtonsProps {
  className?: string;
}

const generateCodeVerifier = (): string => {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, 128);
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export default function OAuthButtons({ className = '' }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<'vk' | 'yandex' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: 'vk' | 'yandex') => {
    setLoadingProvider(provider);
    setError(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (provider === 'yandex') {
      window.location.href = `${supabaseUrl}/functions/v1/oauth-login?provider=yandex`;
      return;
    }

    if (provider === 'vk') {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const statePayload = btoa(JSON.stringify({ r: Math.random().toString(36).slice(2) }))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      const edgeUrl = `${supabaseUrl}/functions/v1/oauth-login?provider=vk`;

      const saveRes = await fetch(edgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_verifier: codeVerifier, state: statePayload }),
      });

      if (!saveRes.ok) {
        setError('Не удалось начать авторизацию через ВКонтакте. Попробуйте снова.');
        setLoadingProvider(null);
        return;
      }

      const VK_CLIENT_ID = import.meta.env.VITE_VK_CLIENT_ID;
      const redirectUri = encodeURIComponent(`${supabaseUrl}/functions/v1/oauth-login?provider=vk`);
      const authUrl = `https://id.vk.ru/authorize?response_type=code&client_id=${VK_CLIENT_ID}&redirect_uri=${redirectUri}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${statePayload}&scope=vkid.personal_info`;
      window.location.href = authUrl;
    }
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleOAuth('vk')}
          disabled={loadingProvider !== null}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0077ff] hover:bg-[#0066dd] text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium text-sm"
        >
          {loadingProvider === 'vk' ? (
            <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23C14.734 12.813 14 12.126 14 11.11V7.603A1.104 1.104 0 0 0 12.896 6.5h-2.474a1.982 1.982 0 0 0-1.75.813s1.255-.204 1.255 1.49c0 .42.022 1.626.04 2.64a.73.73 0 0 1-1.272.503 21.54 21.54 0 0 1-2.498-4.543.693.693 0 0 0-.63-.403h-2.99a.508.508 0 0 0-.48.685C3.005 10.175 6.918 18 11.38 18h1.878a.742.742 0 0 0 .742-.742v-1.135a.73.73 0 0 1 1.23-.53l2.247 2.112a1.09 1.09 0 0 0 .746.295h2.953c1.424 0 1.424-.988.647-1.753-.546-.538-2.518-2.617-2.518-2.617a1.02 1.02 0 0 1-.078-1.323c.637-.84 1.68-2.212 2.122-2.8.603-.804 1.697-2.507.197-2.507z" />
            </svg>
          )}
          <span>ВКонтакте</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuth('yandex')}
          disabled={loadingProvider !== null}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fc3f1d] hover:bg-[#e5381a] text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium text-sm"
        >
          {loadingProvider === 'yandex' ? (
            <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
          ) : (
            <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center font-bold text-base leading-none">Я</span>
          )}
          <span>Яндекс</span>
        </button>
      </div>
    </div>
  );
}
