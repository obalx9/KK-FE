import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiRequest } from '../lib/api';
import { BookOpen, Store, LogOut, Sparkles, Copy, Check } from 'lucide-react';
import KeyKursLogo from '../components/KeyKursLogo';
import LanguageSelector from '../components/LanguageSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, signOut, refreshUser, loginWithToken } = useAuth();
  const { t } = useLanguage();
  const [selecting, setSelecting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [processingOAuth, setProcessingOAuth] = useState(() => !!new URLSearchParams(window.location.search).get('user_id'));

  useEffect(() => {
    const userId = searchParams.get('user_id');
    if (userId && !user) {
      handleOAuthCallback(userId);
    } else if (!userId && !loading && !user) {
      navigate('/login');
    }
  }, [searchParams, user, loading]);

  const handleOAuthCallback = async (userId: string) => {
    try {
      setProcessingOAuth(true);
      const data = await apiRequest<{ token: string }>('/api/auth/oauth/session', {
        method: 'POST',
        body: { user_id: userId },
      });

      if (data.token) {
        await loginWithToken(data.token);
        await refreshUser();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      console.error('OAuth callback error:', err);
      setError(message);
      setTimeout(() => navigate('/login'), 2000);
    } finally {
      setProcessingOAuth(false);
    }
  };

  if (loading || processingOAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-teal-400 text-sm font-medium">Выполняется вход...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSelectStudent = async () => {
    try {
      setSelecting(true);
      setSelectedRole('student');
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 600));
      navigate('/student');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to select role';
      setError(message);
      setSelecting(false);
      setSelectedRole(null);
    }
  };

  const handleSelectSeller = async () => {
    try {
      setSelecting(true);
      setSelectedRole('seller');
      setError(null);

      const data = await apiRequest<{ has_seller: boolean }>('/api/sellers/check', {
        token: null,
      });

      await new Promise(resolve => setTimeout(resolve, 600));

      if (data.has_seller) {
        navigate('/seller/dashboard');
      } else {
        navigate('/register-seller');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to select role';
      setError(message);
      setSelecting(false);
      setSelectedRole(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <KeyKursLogo size={40} color="#14b8a6" />
            <h1 className="text-2xl font-bold text-white">КейКурс</h1>
          </div>
          <LanguageSelector />
        </div>

        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-teal-400" />
            <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-wider">Добро пожаловать</h2>
            <Sparkles className="w-6 h-6 text-teal-400" />
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Что вы хотите делать?
          </h3>
          <p className="text-gray-300 text-lg">
            Выберите роль, которая вам подходит, и начните прямо сейчас
          </p>

          {user.user_id && (
            <div className="mt-6 inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 backdrop-blur-md">
              <p className="text-xs text-gray-400 whitespace-nowrap">Ваш ID:</p>
              <code className="text-sm font-mono text-teal-300">{user.user_id}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user.user_id!);
                  setCopiedUserId(true);
                  setTimeout(() => setCopiedUserId(false), 2000);
                }}
                className="p-1 text-gray-400 hover:text-teal-400 transition-colors"
                title="Скопировать"
              >
                {copiedUserId ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <button
            onClick={handleSelectStudent}
            disabled={selecting}
            className={`group relative overflow-hidden bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:border-blue-400/50 p-8 text-left transition-all duration-500 ${
              selectedRole === 'student' ? 'ring-2 ring-blue-400 scale-105' : ''
            } hover:scale-105 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:scale-110">
                <BookOpen className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">Студент</h2>
              <p className="text-gray-300 mb-6">Расширяй свои навыки. Обучайся у лучших преподавателей на платформе.</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                  <span className="text-sm">Тысячи профессиональных курсов</span>
                </li>
                <li className="flex items-center gap-3 text-gray-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                  <span className="text-sm">Обучайтесь в собственном темпе</span>
                </li>
                <li className="flex items-center gap-3 text-gray-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                  <span className="text-sm">Получайте сертификаты</span>
                </li>
              </ul>

              <div className="inline-flex items-center gap-3 text-blue-400 font-semibold group-hover:gap-4 transition-all duration-300">
                <span>Начать обучение</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>

          <button
            onClick={handleSelectSeller}
            disabled={selecting}
            className={`group relative overflow-hidden bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:border-emerald-400/50 p-8 text-left transition-all duration-500 ${
              selectedRole === 'seller' ? 'ring-2 ring-emerald-400 scale-105' : ''
            } hover:scale-105 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300 transform group-hover:scale-110">
                <Store className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">Селлер</h2>
              <p className="text-gray-300 mb-6">Делись знаниями. Создавай курсы и зарабатывай на образовании.</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-200">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                  <span className="text-sm">Создание и управление курсами</span>
                </li>
                <li className="flex items-center gap-3 text-gray-200">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                  <span className="text-sm">Встроенные инструменты аналитики</span>
                </li>
                <li className="flex items-center gap-3 text-gray-200">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                  <span className="text-sm">Интеграция с Telegram</span>
                </li>
              </ul>

              <div className="inline-flex items-center gap-3 text-emerald-400 font-semibold group-hover:gap-4 transition-all duration-300">
                <span>Начать преподавать</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 mb-6 text-sm text-red-300 backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3 text-gray-400 text-sm">
            <span>
              Вы вошли как{' '}
              <span className="text-white font-medium">
                {user.oauth_provider === 'yandex' && user.email
                  ? user.email
                  : user.oauth_provider === 'vk'
                    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'
                    : user.telegram_username || user.first_name || 'User'}
              </span>
            </span>
            <span>•</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
