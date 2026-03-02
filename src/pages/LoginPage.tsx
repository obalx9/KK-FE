import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TelegramLogin from '../components/TelegramLogin';
import LanguageSelector from '../components/LanguageSelector';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import KeyKursLogo from '../components/KeyKursLogo';
import OAuthButtons from '../components/OAuthButtons';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && user) {
      if (user.roles.includes('super_admin')) {
        navigate('/admin');
      } else if (user.roles.length > 1 || (user.roles.includes('seller') && user.roles.includes('student'))) {
        navigate('/role-select');
      } else if (user.roles.includes('seller')) {
        navigate('/seller/dashboard');
      } else if (user.roles.includes('student')) {
        navigate('/student');
      } else {
        navigate('/role-select');
      }
    }
  }, [user, loading, navigate]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <KeyKursLogo size={56} color="#0d9488" className="mb-3" />
            <h2 className="text-2xl font-bold text-teal-700 tracking-tight">КейКурс</h2>
            <p className="text-sm text-teal-600/70 mb-4">{t('platformTagline')}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('loginTitle')}</h1>
            <p className="text-gray-600 text-center">
              {t('loginSubtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <TelegramLogin />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Или используйте другие сервисы</span>
              </div>
            </div>

            <OAuthButtons />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              {t('registerSeller')}{' '}
              <Link
                to="/register-seller"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {t('becomeSellerLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
