import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Pin, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemeConfig } from '../utils/themePresets';
import { getBackgroundOverlay, getGlassEffect, getGlassEffectDark } from '../utils/postStyles';

interface PinnedPost {
  id: string;
  text_content: string | null;
  created_at: string;
}

interface PinnedPostsSidebarProps {
  courseId: string;
  refreshKey?: number;
  onPostClick?: (postId: string) => void;
  themeConfig?: ThemeConfig;
}

export default function PinnedPostsSidebar({ courseId, refreshKey, onPostClick, themeConfig }: PinnedPostsSidebarProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const [pinnedPosts, setPinnedPosts] = useState<PinnedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { postId, loading: isLoading } = (e as CustomEvent).detail;
      setLoadingPostId(isLoading ? postId : null);
    };
    window.addEventListener('pinnedPostScrollLoading', handler);
    return () => window.removeEventListener('pinnedPostScrollLoading', handler);
  }, []);

  const loadPinnedPosts = useCallback(async () => {
    const userId = authUser?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data: pinnedData, error: pinnedError } = await supabase
        .from('student_pinned_posts')
        .select('post_id')
        .eq('student_id', userId)
        .eq('course_id', courseId);

      if (pinnedError) throw pinnedError;

      if (!pinnedData || pinnedData.length === 0) {
        setPinnedPosts([]);
        return;
      }

      const postIds = pinnedData.map(p => p.post_id);

      const { data: posts, error: postsError } = await supabase
        .from('course_posts')
        .select('id, text_content, created_at')
        .in('id', postIds)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      setPinnedPosts(posts || []);
    } catch (error) {
      console.error('[PinnedPostsSidebar] Error:', error);
      setPinnedPosts([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, authUser?.id]);

  useEffect(() => {
    loadPinnedPosts();
  }, [loadPinnedPosts, refreshKey]);

  const postTheme = theme === 'dark' ? themeConfig?.posts?.dark : themeConfig?.posts?.light;
  const borderRadiusPx = themeConfig?.posts.borderRadius || 12;

  const bgValue = theme === 'dark' ? (postTheme?.bg || '#1e293b') : (postTheme?.bg || '#ffffff');
  const bgOpacity = postTheme?.bgOpacity ?? 1;
  const bgOverlay = getBackgroundOverlay(bgValue, bgOpacity);

  const containerStyle = {
    ...bgOverlay.containerStyle,
    position: 'relative' as const,
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    borderColor: theme === 'dark'
      ? themeConfig?.posts?.dark?.border || '#475569'
      : themeConfig?.posts?.light?.border || '#cbd5e1',
    color: theme === 'dark'
      ? themeConfig?.posts?.dark?.text || '#f1f5f9'
      : themeConfig?.posts?.light?.text || '#0f172a',
    borderRadius: `${borderRadiusPx}px`
  };

  const bgOverlayEl = bgOverlay.needsOverlay ? (
    <div style={{ ...bgOverlay.overlayStyle, borderRadius: `${borderRadiusPx}px` }} />
  ) : null;

  if (loading) {
    return (
      <div className="overflow-hidden" style={containerStyle}>
        {bgOverlayEl}
        <div className="relative z-10 flex items-center gap-2 p-4 border-b" style={{ borderColor: containerStyle.borderColor }}>
          <Pin className="w-5 h-5 text-teal-500" />
          <h2 className="text-lg font-semibold">{t('pinnedPosts')}</h2>
        </div>
        <div className="relative z-10 p-4 space-y-2">
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (pinnedPosts.length === 0) {
    return (
      <div className="overflow-hidden" style={containerStyle}>
        {bgOverlayEl}
        <div className="relative z-10 flex items-center gap-2 p-4 border-b" style={{ borderColor: containerStyle.borderColor }}>
          <Pin className="w-5 h-5 text-teal-500" />
          <h2 className="text-lg font-semibold">{t('pinnedPosts')}</h2>
        </div>
        <div className="relative z-10 p-4">
          <p className="text-sm opacity-70">{t('noPinnedPosts')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden flex flex-col" style={{ ...containerStyle, maxHeight: '600px' }}>
      {bgOverlayEl}
      <div className="relative z-10 flex items-center gap-2 p-4 border-b flex-shrink-0" style={{ borderColor: containerStyle.borderColor }}>
        <Pin className="w-5 h-5 text-teal-500" />
        <h2 className="text-lg font-semibold">{t('pinnedPosts')}</h2>
        <span className="ml-auto text-sm opacity-70">{pinnedPosts.length}</span>
      </div>
      <div className="relative z-10 overflow-y-auto p-4 space-y-2">
        {pinnedPosts.map((post) => {
          const isLoading = loadingPostId === post.id;
          return (
            <button
              key={post.id}
              disabled={loadingPostId !== null}
              onClick={() => {
                if (!loadingPostId) onPostClick?.(post.id);
              }}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                loadingPostId !== null
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:scale-[1.02] active:scale-[0.98]'
              } ${isLoading ? 'opacity-100 !cursor-wait' : ''}`}
              style={{
                ...(theme === 'dark' ? getGlassEffectDark('light') : getGlassEffect('light'))
              }}
            >
              <div className="flex items-start gap-2">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mt-0.5 flex-shrink-0 animate-spin text-teal-500" />
                ) : (
                  <Pin className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-40" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2" style={{
                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                  }}>
                    {post.text_content || t('mediaContent')}
                  </p>
                  <p className="text-xs opacity-70 mt-1" style={{
                    color: theme === 'dark' ? '#cbd5e1' : '#64748b'
                  }}>
                    {isLoading ? (
                      <span className="text-teal-500">загрузка...</span>
                    ) : (
                      new Date(post.created_at).toLocaleDateString()
                    )}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
