import { useState, useEffect } from 'react';
import { supabase } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Send, Check, AlertCircle, Copy, ExternalLink, Plus, Trash2, Radio } from 'lucide-react';

interface TelegramBotConfigProps {
  courseId: string;
  sellerId?: string;
  botId?: string;
  onClose: () => void;
}

interface TelegramBot {
  id: string;
  bot_token: string;
  bot_username: string;
  channel_id: string | null;
  is_active: boolean;
  seller_id?: string;
}

interface TelegramChat {
  id: number;
  title?: string;
  type: string;
}

interface LinkedChat {
  id: string;
  telegram_chat_id: number;
  chat_title: string;
  chat_type: string;
  course_id: string;
  is_active: boolean;
}

export default function TelegramBotConfig({ courseId, sellerId, botId, onClose }: TelegramBotConfigProps) {
  const { t } = useLanguage();
  const [bot, setBot] = useState<TelegramBot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [availableChats, setAvailableChats] = useState<TelegramChat[]>([]);
  const [linkedChats, setLinkedChats] = useState<LinkedChat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [showChatSelector, setShowChatSelector] = useState(false);
  const [selectedChat, setSelectedChat] = useState<TelegramChat | null>(null);
  const [channelId, setChannelId] = useState('');
  const [savingChannel, setSavingChannel] = useState(false);
  const [channelSuccess, setChannelSuccess] = useState(false);
  const [reregisteringWebhook, setReregisteringWebhook] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState(false);
  const isSelectorMode = !!sellerId && !!botId;

  useEffect(() => {
    loadBot();
    const API_URL = import.meta.env.VITE_API_URL || 'https://api.keykurs.ru';
    setWebhookUrl(`${API_URL}/api/webhook/telegram`);
    if (isSelectorMode) {
      loadChats();
      loadLinkedChats();
    }
  }, [courseId, sellerId, botId]);

  const API_URL = import.meta.env.VITE_API_URL || 'https://api.keykurs.ru';

  const loadBot = async () => {
    try {
      let query;
      if (isSelectorMode && botId) {
        query = supabase
          .from('telegram_bots')
          .select('*')
          .eq('id', botId);
      } else {
        query = supabase
          .from('telegram_bots')
          .select('*')
          .eq('course_id', courseId);
      }

      const { data, error } = await query.maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setBot(data);
        setBotToken(data.bot_token);
        setChannelId(data.channel_id || '');
        setWebhookUrl(`${API_URL}/api/webhook/telegram?bot_id=${data.id}`);
      }
    } catch (err: any) {
      console.error('Error loading bot:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChats = async () => {
    if (!botId) return;
    setLoadingChats(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${API_URL}/api/telegram-chat-sync?action=get_chats&bot_id=${botId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();
      if (result.ok) {
        setAvailableChats(result.chats || []);
      }
    } catch (err: any) {
      console.error('Error loading chats:', err);
      setError(err.message);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadLinkedChats = async () => {
    if (!botId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${API_URL}/api/telegram-chat-sync?action=list_chats&bot_id=${botId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();
      if (result.ok) {
        const courseLevelChats = result.chats.filter((chat: LinkedChat) => chat.course_id === courseId);
        setLinkedChats(courseLevelChats);
      }
    } catch (err: any) {
      console.error('Error loading linked chats:', err);
    }
  };

  const handleLinkChat = async () => {
    if (!selectedChat || !botId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${API_URL}/api/telegram-chat-sync?action=link_chat`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bot_id: botId,
            chat_id: selectedChat.id,
            chat_title: selectedChat.title || `Chat ${selectedChat.id}`,
            chat_type: selectedChat.type,
            course_id: courseId,
          }),
        }
      );

      const result = await response.json();
      if (result.ok) {
        setSuccess(true);
        setSelectedChat(null);
        setShowChatSelector(false);
        await loadLinkedChats();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error || 'Failed to link chat');
      }
    } catch (err: any) {
      console.error('Error linking chat:', err);
      setError(err.message);
    }
  };

  const handleUnlinkChat = async (linkedChatId: string, chatId: number) => {
    if (!botId || !confirm('Отвязать чат от курса?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${API_URL}/api/telegram-chat-sync?action=unlink_chat`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bot_id: botId,
            chat_id: chatId,
            course_id: courseId,
          }),
        }
      );

      const result = await response.json();
      if (result.ok) {
        setSuccess(true);
        await loadLinkedChats();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error || 'Failed to unlink chat');
      }
    } catch (err: any) {
      console.error('Error unlinking chat:', err);
      setError(err.message);
    }
  };

  const handleSave = async () => {
    if (!botToken.trim()) {
      setError(t('botTokenRequired') || 'Bot token is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getMe`
      );
      const data = await response.json();

      if (!data.ok) {
        throw new Error(t('invalidBotToken') || 'Invalid bot token');
      }

      const botUsername = data.result.username;

      const { data: existingBot } = await supabase
        .from('telegram_bots')
        .select('id, course_id')
        .eq('bot_token', botToken)
        .neq('course_id', courseId)
        .maybeSingle();

      if (existingBot) {
        throw new Error('Этот бот уже используется для другого курса. Каждый курс должен иметь отдельного бота.');
      }

      if (bot) {
        const { error: updateError } = await supabase
          .from('telegram_bots')
          .update({
            bot_token: botToken,
            bot_username: botUsername,
            is_active: true,
          })
          .eq('id', bot.id);

        if (updateError) throw updateError;

        const specificWebhookUrl = `${API_URL}/api/webhook/telegram?bot_id=${bot.id}`;
        await fetch(
          `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(specificWebhookUrl)}`
        );
      } else {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        let currentSellerId: string | null = null;
        if (authSession?.user) {
          const { data: sellerData } = await supabase
            .from('sellers')
            .select('id')
            .eq('user_id', authSession.user.id)
            .maybeSingle();
          currentSellerId = sellerData?.id || null;
        }

        const { data: newBot, error: insertError } = await supabase
          .from('telegram_bots')
          .insert({
            course_id: courseId,
            bot_token: botToken,
            bot_username: botUsername,
            is_active: true,
            seller_id: currentSellerId,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        const specificWebhookUrl = `${API_URL}/api/webhook/telegram?bot_id=${newBot.id}`;
        await fetch(
          `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(specificWebhookUrl)}`
        );
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving bot:', err);
      setError(err.message || t('failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChannel = async () => {
    if (!bot) return;
    setSavingChannel(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('telegram_bots')
        .update({ channel_id: channelId.trim() || null })
        .eq('id', bot.id);

      if (updateError) throw updateError;

      setBot({ ...bot, channel_id: channelId.trim() || null });
      setChannelSuccess(true);
      setTimeout(() => setChannelSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving channel:', err);
      setError(err.message);
    } finally {
      setSavingChannel(false);
    }
  };

  const handleReregisterWebhook = async () => {
    if (!bot) return;
    setReregisteringWebhook(true);
    setError(null);
    try {
      const specificWebhookUrl = `${API_URL}/api/webhook/telegram?bot_id=${bot.id}`;
      const response = await fetch(
        `https://api.telegram.org/bot${bot.bot_token}/setWebhook?url=${encodeURIComponent(specificWebhookUrl)}`
      );
      const data = await response.json();
      if (!data.ok) throw new Error(data.description || 'Failed to set webhook');
      setWebhookUrl(specificWebhookUrl);
      setWebhookSuccess(true);
      setTimeout(() => setWebhookSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error re-registering webhook:', err);
      setError(err.message);
    } finally {
      setReregisteringWebhook(false);
    }
  };

  const handleDeactivate = async () => {
    if (!bot || !confirm(t('confirmDeactivate'))) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('telegram_bots')
        .update({ is_active: false })
        .eq('id', bot.id);

      if (error) throw error;

      await fetch(
        `https://api.telegram.org/bot${bot.bot_token}/deleteWebhook`
      );

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error deactivating bot:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isSelectorMode && showChatSelector) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Выберите чат
            </h3>
            <button
              onClick={() => setShowChatSelector(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {loadingChats ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : availableChats.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 py-4">
              Боту не хватает прав администратора ни в одном чате. Добавьте бота как админа в чаты.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    handleLinkChat();
                  }}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {chat.title || `Chat ${chat.id}`}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {chat.type}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowChatSelector(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                setLoadingChats(true);
                loadChats();
              }}
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              Обновить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {isSelectorMode ? 'Связать чаты с курсом' : (t('telegramBotConfig') || 'Telegram Bot Configuration')}
              </h3>
              {isSelectorMode && courseId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Курс: {courseId.slice(0, 8)}...
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p className="font-medium">{t('setupInstructions')}:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>{t('step1')}</li>
                  <li>{t('step2')}</li>
                  <li>{t('step3')}</li>
                  <li>{t('step4')}</li>
                  <li>{t('step5')}</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <p className="font-medium">{t('importInstructions')}:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>{t('importStep1')}</li>
                  <li>{t('importStep2')}</li>
                  <li>{t('importStep3')}</li>
                </ol>
              </div>
            </div>
          </div>

          {bot && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <Radio className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {t('channelAutoSync')}
                </h4>
                {bot.channel_id && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    {t('channelConnected')}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('channelAutoSyncDesc')}
                </p>
                <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal ml-4 space-y-1">
                  <li>{t('channelStep1')}</li>
                  <li>{t('channelStep2')}</li>
                  <li>{t('channelStep3')}</li>
                </ol>
                <div className="pt-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('channelIdLabel')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      placeholder="-1001234567890"
                      className="flex-1 px-3 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSaveChannel}
                      disabled={savingChannel}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                    >
                      {channelSuccess ? (
                        <><Check className="w-4 h-4" /> {t('saved')}</>
                      ) : savingChannel ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        t('save')
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {t('channelIdHint')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('botToken') || 'Bot Token'}
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {bot?.bot_username && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('botUsername') || 'Bot Username'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`@${bot.bot_username}`}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                />
                <a
                  href={`https://t.me/${bot.bot_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('webhookUrl') || 'Webhook URL'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm"
              />
              <button
                onClick={() => copyToClipboard(webhookUrl)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Скопировать"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            {bot && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={handleReregisterWebhook}
                  disabled={reregisteringWebhook}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  {reregisteringWebhook ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : webhookSuccess ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {webhookSuccess ? 'Переустановлен!' : 'Переустановить вебхук'}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Нужно для работы кнопки "Начать импорт" в боте
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-600 dark:text-green-400">
                {isSelectorMode ? 'Чат успешно подключен!' : (t('savedSuccessfully') || 'Saved successfully')}
              </p>
            </div>
          )}

          {isSelectorMode && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Подключенные чаты ({linkedChats.length})
                  </h4>
                  <button
                    onClick={() => setShowChatSelector(true)}
                    disabled={loadingChats}
                    className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить
                  </button>
                </div>

                {linkedChats.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                    Нет подключенных чатов. Добавьте чат, чтобы импортировать посты.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {linkedChats.map((chat) => (
                      <div
                        key={chat.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {chat.chat_title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {chat.chat_type} • ID: {chat.telegram_chat_id}
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnlinkChat(chat.id, chat.telegram_chat_id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Отвязать чат"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-2">Как это работает:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Бот автоматически отслеживает новые посты в подключенных чатах</li>
                      <li>Посты передаются в соответствующий курс на платформе</li>
                      <li>Студенты видят материалы как только они публикуются</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            {!isSelectorMode && bot?.is_active && (
              <button
                onClick={handleDeactivate}
                disabled={saving}
                className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {t('deactivate') || 'Deactivate'}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('cancel')}
            </button>
            {!isSelectorMode && (
              <button
                onClick={handleSave}
                disabled={saving || !botToken.trim()}
                className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {saving ? t('loading') : t('save')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
