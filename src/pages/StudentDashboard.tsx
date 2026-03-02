import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { BookOpen, LogOut, Store, Copy, Check } from 'lucide-react';
import KeyKursLogo from '../components/KeyKursLogo';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';

interface EnrolledCourse {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
  };
}

function StudentIdBadge({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Нажмите, чтобы скопировать ID"
      className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600 rounded-lg transition-all group"
    >
      <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 font-medium">ID:</span>
      <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 group-hover:text-teal-700 dark:group-hover:text-teal-300 tracking-wide">{id}</span>
      {copied
        ? <Check className="w-3 h-3 text-teal-500" />
        : <Copy className="w-3 h-3 text-gray-400 group-hover:text-teal-500 transition-colors" />
      }
    </button>
  );
}

function PageHeader({ user, onSignOut, onSellerMode }: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  onSignOut: () => void;
  onSellerMode?: () => void;
}) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KeyKursLogo size={36} color="#0d9488" />
            <div className="hidden sm:flex sm:flex-col sm:gap-0.5">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{user.first_name || user.telegram_username || user.email}</h1>
              {user.user_id && <StudentIdBadge id={user.user_id} />}
            </div>
            <div className="sm:hidden flex flex-col gap-0.5">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.first_name || user.telegram_username || user.email}</p>
              {user.user_id && <StudentIdBadge id={user.user_id} />}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <LanguageSelector />
            {onSellerMode && (
              <button
                onClick={onSellerMode}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors border border-teal-200 dark:border-teal-700"
                title="Перейти в режим продавца"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Режим продавца</span>
              </button>
            )}
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      loadCourses();
    }
  }, [user, loading, navigate]);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          course:courses (
            id,
            title,
            description,
            thumbnail_url
          )
        `)
        .eq('student_id', user!.id);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader
          user={user!}
          onSignOut={handleSignOut}
          onSellerMode={user?.roles.includes('seller') ? () => navigate('/seller/dashboard') : undefined}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 pb-4 sm:pt-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('myCourses')}</h1>
          </div>
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('noCourses')}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('browseCoursesDesc')}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        user={user!}
        onSignOut={handleSignOut}
        onSellerMode={user?.roles.includes('seller') ? () => navigate('/seller/dashboard') : undefined}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-6 pb-4 sm:pt-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('myCourses')}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-8">
          {courses.filter((enrollment) => enrollment.course).map((enrollment) => (
            <button
              key={enrollment.id}
              onClick={() => navigate(`/course/${enrollment.course.id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-lg transition-all text-left group"
            >
              {enrollment.course.thumbnail_url ? (
                <div className="w-full h-44 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={enrollment.course.thumbnail_url}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-full h-44 sm:h-48 bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white opacity-80" />
                </div>
              )}
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 line-clamp-2">
                  {enrollment.course.title}
                </h3>
                {enrollment.course.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3">
                    {enrollment.course.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
