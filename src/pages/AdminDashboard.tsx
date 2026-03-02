import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../lib/api';
import { Shield, Users, Store, BookOpen, LogOut, Check, X, Crown, Megaphone, Star, Bot, Save, AlertCircle, CheckCircle } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';
import PremiumTab from './admin/PremiumTab';
import AdsTab from './admin/AdsTab';
import FeaturedTab from './admin/FeaturedTab';

type TabId = 'overview' | 'premium' | 'ads' | 'featured';

interface PendingSeller {
  id: string;
  business_name: string;
  description: string;
  is_approved: boolean;
  user: {
    first_name: string;
    last_name: string;
    telegram_username: string;
  };
}

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalCourses: number;
  pendingSellers: number;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Обзор', icon: Shield },
  { id: 'premium', label: 'Премиум', icon: Crown },
  { id: 'ads', label: 'Реклама', icon: Megaphone },
  { id: 'featured', label: 'Рекомендации', icon: Star },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSellers: 0,
    totalCourses: 0,
    pendingSellers: 0,
  });
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [mainBotToken, setMainBotToken] = useState('');
  const [mainBotUsername, setMainBotUsername] = useState('');
  const [mainBotId, setMainBotId] = useState<string | null>(null);
  const [savingBot, setSavingBot] = useState(false);
  const [botSaveStatus, setBotSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!loading && (!user || !user.roles.includes('super_admin'))) {
      navigate('/login');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, loading, navigate]);

  const loadMainBot = async () => {
    try {
      const data = await api.get('/api/admin/telegram-main-bot');
      if (data) {
        setMainBotId(data.id);
        setMainBotToken(data.bot_token || '');
        setMainBotUsername(data.bot_username || '');
      }
    } catch (error) {
      console.error('Failed to load main bot:', error);
    }
  };

  const handleSaveMainBot = async () => {
    if (!mainBotToken.trim() || !mainBotUsername.trim()) return;
    setSavingBot(true);
    setBotSaveStatus('idle');
    try {
      const payload = {
        bot_token: mainBotToken.trim(),
        bot_username: mainBotUsername.trim().replace('@', ''),
      };
      if (mainBotId) {
        await api.put(`/api/admin/telegram-main-bot/${mainBotId}`, payload);
      } else {
        const data = await api.post('/api/admin/telegram-main-bot', payload);
        setMainBotId(data.id);
      }
      setBotSaveStatus('success');
      setTimeout(() => setBotSaveStatus('idle'), 3000);
    } catch {
      setBotSaveStatus('error');
      setTimeout(() => setBotSaveStatus('idle'), 3000);
    } finally {
      setSavingBot(false);
    }
  };

  const loadData = async () => {
    try {
      loadMainBot();
      const [statsData, pendingSellers] = await Promise.all([
        api.getAdminStats(),
        api.get('/api/admin/pending-sellers'),
      ]);

      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalSellers: statsData.totalSellers || 0,
        totalCourses: statsData.totalCourses || 0,
        pendingSellers: pendingSellers?.length || 0,
      });
      setPendingSellers(pendingSellers || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleApproveSeller = async (sellerId: string) => {
    try {
      await api.put(`/api/admin/sellers/${sellerId}/approve`, {});
      setPendingSellers(pendingSellers.filter(s => s.id !== sellerId));
      setStats(prev => ({ ...prev, pendingSellers: prev.pendingSellers - 1 }));
    } catch (error) {
      console.error('Error approving seller:', error);
      alert(t('failedToApproveSeller'));
    }
  };

  const handleRejectSeller = async (sellerId: string) => {
    if (!confirm(t('rejectSellerConfirm'))) return;
    try {
      await api.deleteAdminSeller(sellerId);
      setPendingSellers(pendingSellers.filter(s => s.id !== sellerId));
      setStats(prev => ({ ...prev, pendingSellers: prev.pendingSellers - 1 }));
    } catch (error) {
      console.error('Error rejecting seller:', error);
      alert(t('failedToRejectSeller'));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{t('adminDashboard')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">{t('adminWelcome')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <LanguageSelector />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'overview' && stats.pendingSellers > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full leading-none">
                      {stats.pendingSellers}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{t('totalUsers')}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{t('activeUsers')}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSellers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{t('myCourses')}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCourses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{t('pending')}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingSellers}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Бот авторизации</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telegram-бот для входа пользователей</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Username бота
                  </label>
                  <input
                    type="text"
                    value={mainBotUsername}
                    onChange={e => setMainBotUsername(e.target.value)}
                    placeholder="MyAuthBot"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Bot Token
                  </label>
                  <input
                    type="password"
                    value={mainBotToken}
                    onChange={e => setMainBotToken(e.target.value)}
                    placeholder="123456789:AAF..."
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleSaveMainBot}
                  disabled={savingBot || !mainBotToken.trim() || !mainBotUsername.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {savingBot ? 'Сохранение...' : 'Сохранить'}
                </button>
                {botSaveStatus === 'success' && (
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Сохранено
                  </div>
                )}
                {botSaveStatus === 'error' && (
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Ошибка сохранения
                  </div>
                )}
              </div>

              {!mainBotId && (
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Бот не настроен — авторизация через Telegram не будет работать
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('pendingApplications')}</h2>

              {pendingSellers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{t('noPendingApplications')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSellers.map((seller) => (
                    <div
                      key={seller.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{seller.business_name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {seller.user?.first_name} {seller.user?.last_name} (@
                            {seller.user?.telegram_username || '?'})
                          </p>
                          {seller.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">{seller.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApproveSeller(seller.id)}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 p-2.5 sm:p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors touch-manipulation"
                            title={t('approve')}
                          >
                            <Check className="w-5 h-5" />
                            <span className="sm:hidden text-sm font-medium">{t('approve')}</span>
                          </button>
                          <button
                            onClick={() => handleRejectSeller(seller.id)}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 p-2.5 sm:p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors touch-manipulation"
                            title={t('reject')}
                          >
                            <X className="w-5 h-5" />
                            <span className="sm:hidden text-sm font-medium">{t('reject')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'premium' && <PremiumTab />}
        {activeTab === 'ads' && <AdsTab />}
        {activeTab === 'featured' && <FeaturedTab />}
      </main>
    </div>
  );
}
