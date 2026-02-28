import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/api';
import {
  ArrowLeft, Save, Eye, EyeOff, Settings, Search, Upload, X, Users,
  ExternalLink, Palette, Copy, Check, Send, LayoutList, ChevronDown,
  SlidersHorizontal, Globe, Lock
} from 'lucide-react';
import CourseFeed from '../components/CourseFeed';
import ThemeToggle from '../components/ThemeToggle';
import FileUpload from '../components/FileUpload';
import AdvancedThemeCustomizer from '../components/AdvancedThemeCustomizer';
import ThemePreview from '../components/ThemePreview';
import TelegramBotConfig from '../components/TelegramBotConfig';
import { type ThemeConfig, getDefaultTheme, themePresets } from '../utils/themePresets';

interface Course {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  seller_id: string;
  thumbnail_url: string | null;
  autoplay_videos: boolean;
  reverse_post_order: boolean;
  show_post_dates: boolean;
  show_lesson_numbers: boolean;
  compact_view: boolean;
  allow_downloads: boolean;
  theme_preset: string | null;
  theme_config: ThemeConfig | null;
  watermark: string | null;
}

export default function CourseEdit() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'settings' | 'design'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [autoplayVideos, setAutoplayVideos] = useState(false);
  const [reversePostOrder, setReversePostOrder] = useState(false);
  const [showPostDates, setShowPostDates] = useState(false);
  const [showLessonNumbers, setShowLessonNumbers] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [watermark, setWatermark] = useState('');
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(getDefaultTheme().config);
  const [copiedId, setCopiedId] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.roles.includes('seller'))) {
      navigate('/login');
      return;
    }
    if (user && courseId) {
      loadCourse();
    }
  }, [user, loading, courseId, navigate]);

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate('/seller/dashboard');
        return;
      }

      setCourse(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setIsPublished(data.is_published);
      setThumbnailUrl(data.thumbnail_url);
      setAutoplayVideos(data.autoplay_videos || false);
      setReversePostOrder(data.reverse_post_order || false);
      setShowPostDates(data.show_post_dates || false);
      setShowLessonNumbers(data.show_lesson_numbers != null ? data.show_lesson_numbers : true);
      setCompactView(data.compact_view || false);
      setAllowDownloads(data.allow_downloads != null ? data.allow_downloads : true);
      setWatermark(data.watermark || '');

      if (data.theme_config) {
        setThemeConfig(data.theme_config);
      } else if (data.theme_preset) {
        const preset = themePresets.find(p => p.id === data.theme_preset);
        if (preset) setThemeConfig(preset.config);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      navigate('/seller/dashboard');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!courseId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title,
          description,
          is_published: isPublished,
          thumbnail_url: thumbnailUrl,
          autoplay_videos: autoplayVideos,
          reverse_post_order: reversePostOrder,
          show_post_dates: showPostDates,
          show_lesson_numbers: showLessonNumbers,
          compact_view: compactView,
          allow_downloads: allowDownloads,
          watermark: watermark || null,
          theme_preset: null,
          theme_config: themeConfig,
        })
        .eq('id', courseId);

      if (error) throw error;
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 2500);
    } catch (error) {
      console.error('Error updating course:', error);
      alert(t('failedToUpdate') + ' ' + t('courseDetails').toLowerCase());
    } finally {
      setSaving(false);
    }
  };

  const handleThumbnailUpload = (storagePath: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    setThumbnailUrl(`${supabaseUrl}/storage/v1/object/public/course-media/${storagePath}`);
    setUploadingThumbnail(false);
  };

  const handleRemoveThumbnail = async () => {
    if (!thumbnailUrl || !confirm(t('deleteMediaConfirm'))) return;
    try {
      if (thumbnailUrl.includes('/course-media/')) {
        const path = thumbnailUrl.split('/course-media/')[1];
        await supabase.storage.from('course-media').remove([path]);
      }
      setThumbnailUrl(null);
    } catch (error) {
      console.error('Error removing thumbnail:', error);
    }
  };

  const handleCopyId = async () => {
    if (!courseId) return;
    try {
      await navigator.clipboard.writeText(courseId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {}
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'feed' as const, label: t('coursePosts'), icon: LayoutList },
    { id: 'design' as const, label: t('design'), icon: Palette },
    { id: 'settings' as const, label: t('courseDetails'), icon: Settings },
  ];

  const courseSettings = {
    autoplay_videos: autoplayVideos,
    reverse_post_order: reversePostOrder,
    show_post_dates: showPostDates,
    show_lesson_numbers: showLessonNumbers,
    compact_view: compactView,
    allow_downloads: allowDownloads,
    watermark: watermark,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Success banner */}
      <div
        style={{ position: 'fixed', bottom: '100px', left: 0, right: 0, zIndex: 200, display: 'flex', justifyContent: 'center', pointerEvents: 'none', visibility: savedBanner ? 'visible' : 'hidden' }}
        className={`transition-all duration-500 ${savedBanner ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <div className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium">
          <Check className="w-4 h-4" />
          {t('courseUpdated')}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-3">

            {/* Back */}
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Course title + status */}
            <div className="flex-1 min-w-0 flex items-center gap-2.5">
              <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {course?.title || t('editCourse')}
              </h1>
              <button
                onClick={() => { setIsPublished(p => !p); }}
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                  isPublished
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {isPublished ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {isPublished ? t('published') : t('draft')}
              </button>
            </div>

            {/* Feed search (desktop) */}
            {activeTab === 'feed' && (
              <div className="hidden md:flex items-center relative w-56 lg:w-72">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPosts')}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-1">
              {activeTab === 'feed' && (
                <button
                  onClick={() => setShowMobileSearch(p => !p)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              <button
                onClick={() => setShowTelegramModal(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Telegram"
              >
                <Send className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => navigate(`/seller/course/${courseId}/students`)}
                className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={t('manageStudents')}
              >
                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={t('preview')}
              >
                <ExternalLink className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-t border-gray-100 dark:border-gray-800 -mx-4 sm:-mx-6 px-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      {showMobileSearch && activeTab === 'feed' && (
        <div
          className="md:hidden fixed inset-x-0 top-0 z-50 px-4 pt-3 pb-3 bg-white/97 dark:bg-gray-900/97 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPosts')}
                className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }}
              className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Telegram modal */}
      {showTelegramModal && courseId && (
        <TelegramBotConfig courseId={courseId} onClose={() => setShowTelegramModal(false)} />
      )}

      {/* Settings drawer backdrop (mobile) */}
      {showSettingsDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setShowSettingsDrawer(false)}
        />
      )}

      {/* ======= MAIN CONTENT ======= */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 overflow-x-hidden">

        {/* ---- FEED TAB ---- */}
        {activeTab === 'feed' && courseId && (
          <div className="flex gap-6 items-start">
            {/* Posts column */}
            <div className="flex-1 min-w-0">
              <CourseFeed
                courseId={courseId}
                editable={true}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                hideInlineSearch={true}
                courseSettings={courseSettings}
                themeConfig={themeConfig}
              />
            </div>

            {/* Display settings sidebar (desktop) */}
            <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-[105px]">
              <DisplaySettingsPanel
                autoplayVideos={autoplayVideos} setAutoplayVideos={setAutoplayVideos}
                reversePostOrder={reversePostOrder} setReversePostOrder={setReversePostOrder}
                showPostDates={showPostDates} setShowPostDates={setShowPostDates}
                showLessonNumbers={showLessonNumbers} setShowLessonNumbers={setShowLessonNumbers}
                compactView={compactView} setCompactView={setCompactView}
                allowDownloads={allowDownloads} setAllowDownloads={setAllowDownloads}
                watermark={watermark} setWatermark={setWatermark}
                saving={saving}
                onSave={() => handleSave()}
                t={t}
              />
            </aside>
          </div>
        )}

        {/* ---- SETTINGS TAB ---- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">

            {/* Left: main info */}
            <div className="lg:col-span-3 space-y-5 min-w-0">
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">{t('courseDetails')}</h2>
                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('businessName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('description')}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3.5 py-2.5 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('courseThumbnail')}
                    </label>
                    {thumbnailUrl ? (
                      <div className="space-y-3">
                        <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={handleRemoveThumbnail}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : uploadingThumbnail ? (
                      <FileUpload courseId={courseId!} onUploadComplete={handleThumbnailUpload} />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUploadingThumbnail(true)}
                        className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 text-gray-500 dark:text-gray-400 transition-all"
                      >
                        <Upload className="w-6 h-6" />
                        <span className="text-sm font-medium">{t('uploadThumbnail')}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !title.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? t('loading') : t('save')}
                  </button>
                </form>
              </section>
            </div>

            {/* Right: meta */}
            <div className="lg:col-span-2 space-y-5 min-w-0">

              {/* Status */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide text-xs">Статус</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPublished ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {isPublished ? <Globe className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {isPublished ? t('published') : t('draft')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {isPublished ? 'Виден студентам' : 'Скрыт от студентов'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPublished(p => !p)}
                    className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ${isPublished ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </section>

              {/* Course ID */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t('courseId')}</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs rounded-lg font-mono truncate border border-gray-200 dark:border-gray-700">
                    {courseId}
                  </code>
                  <button
                    onClick={handleCopyId}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                  </button>
                </div>
              </section>

              {/* Quick links */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Действия</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    {t('preview')}
                  </button>
                  <button
                    onClick={() => navigate(`/seller/course/${courseId}/students`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Users className="w-4 h-4 text-gray-400" />
                    {t('manageStudents')}
                  </button>
                  <button
                    onClick={() => setShowTelegramModal(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4 text-gray-400" />
                    Telegram бот
                  </button>
                </div>
              </section>

              {/* Display settings */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">{t('displaySettings')}</h3>
                <DisplaySettingsPanel
                  autoplayVideos={autoplayVideos} setAutoplayVideos={setAutoplayVideos}
                  reversePostOrder={reversePostOrder} setReversePostOrder={setReversePostOrder}
                  showPostDates={showPostDates} setShowPostDates={setShowPostDates}
                  showLessonNumbers={showLessonNumbers} setShowLessonNumbers={setShowLessonNumbers}
                  compactView={compactView} setCompactView={setCompactView}
                  allowDownloads={allowDownloads} setAllowDownloads={setAllowDownloads}
                  watermark={watermark} setWatermark={setWatermark}
                  saving={saving}
                  onSave={() => handleSave()}
                  t={t}
                  hideHeader
                  hideSaveButton
                />
              </section>

            </div>
          </div>
        )}

        {/* ---- DESIGN TAB ---- */}
        {activeTab === 'design' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">{t('themeCustomization')}</h2>
              <AdvancedThemeCustomizer config={themeConfig} onChange={setThemeConfig} />
              <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? t('loading') : t('saveDesign')}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 xl:sticky xl:top-[105px] self-start">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('preview')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{t('previewDescription')}</p>
              <ThemePreview config={themeConfig} courseName={title || 'Название курса'} />
            </div>
          </div>
        )}

      </main>

      {/* Mobile FAB: settings button on feed tab */}
      {activeTab === 'feed' && (
        <button
          onClick={() => setShowSettingsDrawer(true)}
          className="lg:hidden fixed bottom-24 right-4 z-30 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white pl-4 pr-5 py-3 rounded-full shadow-lg transition-all active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">{t('displaySettings')}</span>
        </button>
      )}

      {/* Mobile FAB: save button on settings/design tab */}
      {(activeTab === 'settings' || activeTab === 'design') && (
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="lg:hidden fixed bottom-24 right-4 z-30 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white pl-4 pr-5 py-3 rounded-full shadow-lg transition-all active:scale-95"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{t('save')}</span>
        </button>
      )}

      {/* Mobile bottom drawer: display settings */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-[60] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700 transition-transform duration-300 ${showSettingsDrawer ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">{t('displaySettings')}</h3>
          <button onClick={() => setShowSettingsDrawer(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="px-5 pb-28 max-h-[70vh] overflow-y-auto">
          <div className="py-4">
            <DisplaySettingsPanel
              autoplayVideos={autoplayVideos} setAutoplayVideos={setAutoplayVideos}
              reversePostOrder={reversePostOrder} setReversePostOrder={setReversePostOrder}
              showPostDates={showPostDates} setShowPostDates={setShowPostDates}
              showLessonNumbers={showLessonNumbers} setShowLessonNumbers={setShowLessonNumbers}
              compactView={compactView} setCompactView={setCompactView}
              allowDownloads={allowDownloads} setAllowDownloads={setAllowDownloads}
              watermark={watermark} setWatermark={setWatermark}
              saving={saving}
              onSave={() => { handleSave(); setShowSettingsDrawer(false); }}
              t={t}
              hideHeader
            />
          </div>
        </div>
      </div>

    </div>
  );
}

interface DisplaySettingsPanelProps {
  autoplayVideos: boolean; setAutoplayVideos: (v: boolean) => void;
  reversePostOrder: boolean; setReversePostOrder: (v: boolean) => void;
  showPostDates: boolean; setShowPostDates: (v: boolean) => void;
  showLessonNumbers: boolean; setShowLessonNumbers: (v: boolean) => void;
  compactView: boolean; setCompactView: (v: boolean) => void;
  allowDownloads: boolean; setAllowDownloads: (v: boolean) => void;
  watermark: string; setWatermark: (v: string) => void;
  saving: boolean;
  onSave: () => void;
  t: (key: string) => string;
  hideHeader?: boolean;
  hideSaveButton?: boolean;
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">{label}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`mt-0.5 relative w-10 h-5.5 flex-shrink-0 rounded-full transition-colors focus:outline-none ${checked ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-700'}`}
        style={{ width: 40, height: 22 }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

function DisplaySettingsPanel({
  autoplayVideos, setAutoplayVideos,
  reversePostOrder, setReversePostOrder,
  showPostDates, setShowPostDates,
  showLessonNumbers, setShowLessonNumbers,
  compactView, setCompactView,
  allowDownloads, setAllowDownloads,
  watermark, setWatermark,
  saving, onSave, t,
  hideHeader = false,
  hideSaveButton = false,
}: DisplaySettingsPanelProps) {
  return (
    <div>
      {!hideHeader && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('displaySettings')}</h3>
        </div>
      )}

      <ToggleRow
        label={t('autoplayVideos')}
        desc={t('autoplayVideosDesc')}
        checked={autoplayVideos}
        onChange={setAutoplayVideos}
      />
      <ToggleRow
        label={t('reversePostOrder')}
        desc={t('reversePostOrderDesc')}
        checked={reversePostOrder}
        onChange={setReversePostOrder}
      />
      <ToggleRow
        label={t('showPostDates')}
        desc={t('showPostDatesDesc')}
        checked={showPostDates}
        onChange={setShowPostDates}
      />
      <ToggleRow
        label={t('showLessonNumbers')}
        desc={t('showLessonNumbersDesc')}
        checked={showLessonNumbers}
        onChange={setShowLessonNumbers}
      />
      <ToggleRow
        label={t('compactView')}
        desc={t('compactViewDesc')}
        checked={compactView}
        onChange={setCompactView}
      />
      <ToggleRow
        label={t('allowDownloads')}
        desc={t('allowDownloadsDesc')}
        checked={allowDownloads}
        onChange={setAllowDownloads}
      />

      <div className="pt-3">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">{t('watermark')}</label>
        <input
          type="text"
          value={watermark}
          onChange={(e) => setWatermark(e.target.value)}
          placeholder={t('watermarkPlaceholder')}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('watermarkDesc')}</p>
      </div>

      {!hideSaveButton && (
        <div className="pt-4">
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? t('loading') : t('saveSettings')}
          </button>
        </div>
      )}
    </div>
  );
}
