import { Home, BookOpen, Bookmark, ExternalLink, Users, Search, ChevronsDown, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loadingBeginning, setLoadingBeginning] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setLoadingBeginning((e as CustomEvent).detail);
    };
    window.addEventListener('scrollToBeginningLoading', handler);
    return () => window.removeEventListener('scrollToBeginningLoading', handler);
  }, []);

  if (!user) return null;

  const pathname = location.pathname;
  const isLoginPage = pathname === '/login' || pathname === '/register-seller' || pathname === '/role-select';
  if (isLoginPage) return null;

  const isStudent = user.roles.includes('student');
  const isSeller = user.roles.includes('seller');
  const isStudentDashboard = pathname === '/dashboard' || pathname === '/student';
  const isSellerDashboard = pathname === '/seller/dashboard';
  const isStudentCourseView = pathname.startsWith('/course/') && !isSeller;
  const isSellerCourseView = pathname.startsWith('/course/') && isSeller;
  const isSellerCourseEdit = pathname.match(/^\/seller\/course\/[^/]+$/);
  const isStudentsManager = pathname.match(/^\/seller\/course\/[^/]+\/students$/);
  const isAdminPage = pathname === '/admin';

  const courseIdMatch = pathname.match(/\/(?:course|seller\/course)\/([^/]+)/);
  const courseId = courseIdMatch?.[1];

  const handlePinnedPostsClick = () => {
    window.dispatchEvent(new CustomEvent('togglePinnedSidebar'));
  };

  const handleScrollToBeginning = () => {
    if (loadingBeginning) return;
    window.dispatchEvent(new CustomEvent('scrollToBeginning'));
  };

  type MenuItem = {
    icon: typeof Home;
    label: string;
    path?: string;
    onClick?: () => void;
    active: boolean;
    loading?: boolean;
  };

  const getMenuItems = (): MenuItem[] => {
    const homeItem: MenuItem = {
      icon: Home,
      label: t('navHome'),
      path: isSeller ? '/seller/dashboard' : isStudent ? '/dashboard' : '/admin',
      active: isStudentDashboard || isSellerDashboard || isAdminPage,
    };

    if (isStudentDashboard) {
      return [];
    }

    if (isStudentCourseView) {
      return [
        homeItem,
        { icon: Search, label: t('navSearch'), onClick: () => window.dispatchEvent(new CustomEvent('toggleMobileSearch')), active: false },
        { icon: ChevronsDown, label: t('scrollToStart'), onClick: handleScrollToBeginning, active: false, loading: loadingBeginning },
        { icon: Bookmark, label: t('navPinned'), onClick: handlePinnedPostsClick, active: false },
      ];
    }

    if (isSellerDashboard) {
      return [];
    }

    if (isSellerCourseEdit && courseId) {
      return [
        homeItem,
        { icon: ExternalLink, label: t('navPreview'), path: `/course/${courseId}`, active: false },
        { icon: Users, label: t('navStudents'), path: `/seller/course/${courseId}/students`, active: false },
      ];
    }

    if (isStudentsManager && courseId) {
      return [
        homeItem,
        { icon: BookOpen, label: t('editCourse'), path: `/seller/course/${courseId}`, active: false },
      ];
    }

    if (isSellerCourseView && courseId) {
      return [
        homeItem,
        { icon: Search, label: t('navSearch'), onClick: () => window.dispatchEvent(new CustomEvent('toggleMobileSearch')), active: false },
        { icon: ChevronsDown, label: t('scrollToStart'), onClick: handleScrollToBeginning, active: false, loading: loadingBeginning },
        { icon: Bookmark, label: t('navPinned'), onClick: handlePinnedPostsClick, active: false },
      ];
    }

    if (isAdminPage) {
      return [homeItem];
    }

    return [homeItem];
  };

  const menuItems = getMenuItems();

  if (menuItems.length === 0) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      <div className="mx-3 mb-2">
        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="flex justify-around items-center h-16 px-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isLoading = item.loading;

              return (
                <button
                  key={index}
                  disabled={isLoading}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all duration-200 touch-manipulation ${
                    isLoading
                      ? 'text-teal-500 dark:text-teal-400 cursor-not-allowed'
                      : item.active
                        ? 'text-teal-600 dark:text-teal-400 active:scale-95'
                        : 'text-gray-500 dark:text-gray-400 active:scale-95'
                  }`}
                >
                  {item.active && (
                    <div className="absolute inset-1 bg-teal-50 dark:bg-teal-900/30 rounded-lg" />
                  )}
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 relative z-10 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 relative z-10" />
                  )}
                  <span className="text-[10px] font-medium mt-0.5 relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
