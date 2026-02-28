import { useEffect, useState } from 'react';
import { /* supabase removed */ } from '../../lib/api';
import { Crown, Calendar, X, Plus } from 'lucide-react';

interface Seller {
  id: string;
  business_name: string;
  premium_active: boolean;
  premium_expires_at: string | null;
  user: {
    first_name: string;
    last_name: string;
    telegram_username: string | null;
  } | null;
}

const DURATION_OPTIONS = [
  { label: '1 месяц', months: 1 },
  { label: '3 месяца', months: 3 },
  { label: '6 месяцев', months: 6 },
  { label: '1 год', months: 12 },
];

export default function PremiumTab() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalSeller, setModalSeller] = useState<Seller | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sellers')
      .select(`
        id,
        business_name,
        premium_active,
        premium_expires_at,
        user:users!sellers_user_id_fkey (
          first_name,
          last_name,
          telegram_username
        )
      `)
      .eq('is_approved', true)
      .order('business_name');

    if (!error && data) {
      setSellers(data as unknown as Seller[]);
    }
    setLoading(false);
  };

  const handleGrant = async (months: number) => {
    if (!modalSeller) return;
    setSaving(true);
    const now = new Date();
    const current = modalSeller.premium_active && modalSeller.premium_expires_at && new Date(modalSeller.premium_expires_at) > now
      ? new Date(modalSeller.premium_expires_at)
      : now;
    current.setMonth(current.getMonth() + months);
    await applyPremium(modalSeller.id, current.toISOString());
  };

  const handleGrantCustom = async () => {
    if (!modalSeller || !customDate) return;
    setSaving(true);
    await applyPremium(modalSeller.id, new Date(customDate).toISOString());
  };

  const applyPremium = async (sellerId: string, expiresAt: string) => {
    const { error } = await supabase
      .from('sellers')
      .update({ premium_active: true, premium_expires_at: expiresAt })
      .eq('id', sellerId);

    if (!error) {
      setSellers(prev => prev.map(s =>
        s.id === sellerId ? { ...s, premium_active: true, premium_expires_at: expiresAt } : s
      ));
      setModalSeller(null);
      setCustomDate('');
    }
    setSaving(false);
  };

  const handleRevoke = async (sellerId: string) => {
    if (!confirm('Отозвать премиум у этого продавца?')) return;
    const { error } = await supabase
      .from('sellers')
      .update({ premium_active: false, premium_expires_at: null })
      .eq('id', sellerId);

    if (!error) {
      setSellers(prev => prev.map(s =>
        s.id === sellerId ? { ...s, premium_active: false, premium_expires_at: null } : s
      ));
    }
  };

  const formatExpiry = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isPremiumValid = (seller: Seller) =>
    seller.premium_active && seller.premium_expires_at && new Date(seller.premium_expires_at) > new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Премиум-подписки</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Продавцы с активным премиумом не показывают рекламу в своих курсах
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {sellers.length === 0 ? (
          <div className="text-center py-16">
            <Crown className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Нет одобренных продавцов</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sellers.map(seller => {
              const active = isPremiumValid(seller);
              return (
                <div
                  key={seller.id}
                  className={`flex items-center justify-between px-5 py-4 transition-colors ${
                    active ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {active ? (
                      <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Crown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {seller.business_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {seller.user?.first_name} {seller.user?.last_name}
                        {seller.user?.telegram_username ? ` · @${seller.user.telegram_username}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <div className="hidden sm:block text-right">
                      {active ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                            <Crown className="w-3 h-3" /> Активен
                          </span>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> до {formatExpiry(seller.premium_expires_at)}
                          </p>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-full">
                          Нет подписки
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setModalSeller(seller); setCustomDate(''); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Выдать</span>
                      </button>
                      {active && (
                        <button
                          onClick={() => handleRevoke(seller.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Отозвать</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Выдать премиум</h3>
              <button onClick={() => setModalSeller(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{modalSeller.business_name}</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.months}
                  onClick={() => handleGrant(opt.months)}
                  disabled={saving}
                  className="py-2.5 px-3 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Своя дата окончания</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  onClick={handleGrantCustom}
                  disabled={!customDate || saving}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
