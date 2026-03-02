import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit2, Trash2, X, Save, Eye, EyeOff, ExternalLink, BarChart2, Image } from 'lucide-react';
import FileUpload from '../../components/FileUpload';

interface AdPost {
  id: string;
  title: string;
  text_content: string;
  media_type: string | null;
  storage_path: string | null;
  file_name: string | null;
  link_url: string | null;
  link_label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stats?: {
    impressions: number;
    clicks: number;
    impressions_7d: number;
    clicks_7d: number;
  };
}

interface AdPostForm {
  title: string;
  text_content: string;
  link_url: string;
  link_label: string;
  is_active: boolean;
  storage_path: string;
  file_name: string;
  media_type: string;
}

const emptyForm: AdPostForm = {
  title: '',
  text_content: '',
  link_url: '',
  link_label: 'Подробнее',
  is_active: true,
  storage_path: '',
  file_name: '',
  media_type: '',
};

const AD_COURSE_ID = 'ad-posts';

export default function AdsTab() {
  const [ads, setAds] = useState<AdPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<AdPostForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    setLoading(true);
    try {
      const adsData = await api.getAds();
      setAds(adsData);
    } catch (error) {
      console.error('Failed to load ads:', error);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setForm(emptyForm);
    setShowUploader(false);
  };

  const handleEdit = (ad: AdPost) => {
    setEditingId(ad.id);
    setIsCreating(false);
    setShowUploader(false);
    setForm({
      title: ad.title,
      text_content: ad.text_content,
      link_url: ad.link_url || '',
      link_label: ad.link_label || 'Подробнее',
      is_active: ad.is_active,
      storage_path: ad.storage_path || '',
      file_name: ad.file_name || '',
      media_type: ad.media_type || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm(emptyForm);
    setShowUploader(false);
  };

  const handleUploadComplete = (storagePath: string, _fileSize: number, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
    let media_type = 'image';
    if (videoExts.includes(ext)) media_type = 'video';
    else if (imageExts.includes(ext)) media_type = 'image';

    setForm(prev => ({
      ...prev,
      storage_path: storagePath,
      file_name: fileName,
      media_type,
    }));
    setShowUploader(false);
  };

  const handleRemoveMedia = async () => {
    if (form.storage_path) {
      try {
        await api.deleteMedia(form.storage_path);
      } catch (error) {
        console.error('Failed to delete media:', error);
      }
    }
    setForm(prev => ({ ...prev, storage_path: '', file_name: '', media_type: '' }));
  };

  const handleSave = async () => {
    if (!form.title.trim() && !form.text_content.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title,
      text_content: form.text_content,
      link_url: form.link_url || null,
      link_label: form.link_label || 'Подробнее',
      is_active: form.is_active,
      storage_path: form.storage_path || null,
      file_name: form.file_name || null,
      media_type: form.media_type || null,
    };

    try {
      if (editingId) {
        await api.updateAd(editingId, payload);
      } else {
        await api.createAd(payload);
      }
      handleCancel();
      loadAds();
    } catch (error) {
      console.error('Failed to save ad:', error);
    }
    setSaving(false);
  };

  const handleDelete = async (ad: AdPost) => {
    if (!confirm('Удалить этот рекламный пост?')) return;
    try {
      if (ad.storage_path) {
        await api.deleteMedia(ad.storage_path);
      }
      await api.deleteAd(ad.id);
      setAds(prev => prev.filter(a => a.id !== ad.id));
    } catch (error) {
      console.error('Failed to delete ad:', error);
    }
  };

  const handleToggleActive = async (ad: AdPost) => {
    try {
      await api.updateAd(ad.id, { is_active: !ad.is_active });
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !a.is_active } : a));
    } catch (error) {
      console.error('Failed to toggle ad active state:', error);
    }
  };

  const getMediaUrl = (path: string) => {
    return api.getMediaPublicUrl(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEditing = isCreating || !!editingId;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Рекламные посты</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Показываются в лентах курсов без премиум-подписки
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Создать пост
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {isCreating ? 'Новый рекламный пост' : 'Редактировать пост'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заголовок</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Заголовок рекламного поста"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Текст</label>
              <textarea
                value={form.text_content}
                onChange={e => setForm(p => ({ ...p, text_content: e.target.value }))}
                rows={4}
                placeholder="Текст рекламного поста..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Медиафайл (изображение или видео)
              </label>

              {form.storage_path ? (
                <div className="relative inline-block">
                  {form.media_type === 'video' ? (
                    <div className="w-48 h-32 bg-gray-900 rounded-lg flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <p className="text-white text-xs px-2 text-center truncate max-w-[160px]">{form.file_name}</p>
                    </div>
                  ) : (
                    <div className="w-48 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={getMediaUrl(form.storage_path)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleRemoveMedia}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : showUploader ? (
                <div className="space-y-2">
                  <FileUpload
                    courseId={AD_COURSE_ID}
                    onUploadComplete={handleUploadComplete}
                  />
                  <button
                    onClick={() => setShowUploader(false)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowUploader(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 text-sm rounded-lg transition-all w-full justify-center"
                >
                  <Image className="w-4 h-4" />
                  Загрузить изображение или видео
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ссылка (URL)</label>
                <input
                  type="url"
                  value={form.link_url}
                  onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Текст кнопки</label>
                <input
                  type="text"
                  value={form.link_label}
                  onChange={e => setForm(p => ({ ...p, link_label: e.target.value }))}
                  placeholder="Подробнее"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Активен (показывается в лентах)</span>
            </label>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving || (!form.title.trim() && !form.text_content.trim())}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
              >
                <X className="w-4 h-4" /> Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {ads.length === 0 && !isEditing ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center py-16">
          <BarChart2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Рекламных постов пока нет</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Создать первый пост
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map(ad => (
            <div
              key={ad.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border transition-all ${
                ad.is_active
                  ? 'border-slate-200 dark:border-slate-700'
                  : 'border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {ad.storage_path && ad.media_type !== 'video' && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      <img src={getMediaUrl(ad.storage_path)} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {ad.storage_path && ad.media_type === 'video' && (
                    <div className="w-16 h-16 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded border border-slate-200 dark:border-slate-600">
                        Реклама
                      </span>
                      {ad.is_active ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs rounded">
                          Активен
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded">
                          Неактивен
                        </span>
                      )}
                    </div>
                    {ad.title && (
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{ad.title}</p>
                    )}
                    {ad.text_content && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">{ad.text_content}</p>
                    )}
                    {ad.link_url && (
                      <p className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1 mt-1 truncate">
                        <ExternalLink className="w-3 h-3 flex-shrink-0" /> {ad.link_url}
                      </p>
                    )}
                  </div>
                </div>

                {ad.stats && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-4 gap-3">
                    {[
                      { label: 'Показов', value: ad.stats.impressions },
                      { label: 'Кликов', value: ad.stats.clicks },
                      { label: 'Показов (7д)', value: ad.stats.impressions_7d },
                      { label: 'Кликов (7д)', value: ad.stats.clicks_7d },
                    ].map(stat => (
                      <div key={stat.label} className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    onClick={() => handleToggleActive(ad)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {ad.is_active ? 'Скрыть' : 'Показать'}
                  </button>
                  <button
                    onClick={() => handleEdit(ad)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(ad)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
