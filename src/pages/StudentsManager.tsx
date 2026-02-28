import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { /* supabase removed */ } from '../lib/api';
import { ArrowLeft, UserPlus, Trash2, Calendar, Users, Clock, Send } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import ConfirmDialog from '../components/ConfirmDialog';

interface Course {
  id: string;
  title: string;
}

interface Enrollment {
  id: string;
  enrolled_at: string;
  expires_at: string | null;
  student: {
    id: string;
    user_id: string | null;
    telegram_id: string | null;
    first_name: string | null;
    last_name: string | null;
    telegram_username: string | null;
    photo_url: string | null;
    email: string | null;
    oauth_provider: string | null;
  };
}

export default function StudentsManager() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userIdInput, setUserIdInput] = useState('');
  const [expiryDays, setExpiryDays] = useState<string>('30');
  const [adding, setAdding] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  useEffect(() => {
    if (!loading && (!user || !user.roles.includes('seller'))) {
      navigate('/login');
      return;
    }
    if (user && courseId) {
      loadData();
    }
  }, [user, loading, courseId, navigate]);

  const loadData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) throw courseError;
      if (!courseData) {
        alert(t('courseNotFoundAlert'));
        navigate('/seller/dashboard');
        return;
      }
      setCourse(courseData);

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          enrolled_at,
          expires_at,
          student:student_id (
            id,
            user_id,
            telegram_id,
            first_name,
            last_name,
            telegram_username,
            photo_url,
            email,
            oauth_provider
          )
        `)
        .eq('course_id', courseId)
        .order('enrolled_at', { ascending: false });

      if (enrollmentsError) throw enrollmentsError;
      setEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert(t('failedToLoadData'));
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !user) return;

    setAdding(true);
    try {
      const identifier = userIdInput.trim();

      const { data: studentData, error: studentError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', identifier)
        .maybeSingle();

      if (studentError) {
        alert(`${t('failedToFindStudent')}: ${studentError.message}`);
        return;
      }

      if (!studentData) {
        alert('Пользователь с таким ID не найден в системе. Попросите студента войти в систему и поделиться своим ID.');
        return;
      }

      const expiryDaysNum = parseInt(expiryDays) || 0;
      const expiresAt = expiryDaysNum > 0
        ? new Date(Date.now() + expiryDaysNum * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error: enrollError } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          student_id: studentData.id,
          granted_by: user.id,
          expires_at: expiresAt,
        });

      if (enrollError) {
        if (enrollError.code === '23505') {
          alert(t('studentAlreadyEnrolled'));
        } else {
          alert(`${t('failedToEnrollStudent')}: ${enrollError.message}`);
        }
        return;
      }

      alert(t('studentAddedSuccessfully'));
      setShowAddModal(false);
      setUserIdInput('');
      setExpiryDays('30');
      await loadData();
    } catch (error: any) {
      alert(`${t('failedToAddStudent')}: ${error?.message || t('unknownError')}`);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;
      setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
    } catch (error) {
      console.error('Error removing student:', error);
      alert(t('failedToRemoveStudent'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStudentName = (enrollment: Enrollment) => {
    if (enrollment.student?.first_name || enrollment.student?.last_name) {
      return `${enrollment.student?.first_name || ''} ${enrollment.student?.last_name || ''}`.trim();
    }
    return enrollment.student?.telegram_username || 'Unknown';
  };

  const getInitials = (enrollment: Enrollment) => {
    const name = getStudentName(enrollment);
    return name.slice(0, 2).toUpperCase();
  };

  const getProviderIcon = (provider: string | null) => {
    if (provider === 'vk') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.147 3H2.853A1.853 1.853 0 0 0 1 4.853v14.294A1.853 1.853 0 0 0 2.853 21h14.294l3-3v-14.147A1.853 1.853 0 0 0 21.147 3zm-4.552 11.16h-1.667c-.627 0-.817-.297-1.943-2.232-.577-.947-.844-1.349-1.32-1.349-.357 0-.459.103-.459.628v1.667c0 .459-.137.731-.816.731-.83 0-2.065-.628-2.871-1.803-1.321-1.721-1.67-2.974-1.67-3.45 0-.39.103-.603.628-.603h1.666c.524 0 .651.24.844 1.009.819 3.077 2.232 4.55 2.706 4.55.357 0 .459-.103.459-.628v-2.062c-.084-.938-.592-1.081-.592-1.439 0-.24.172-.357.446-.357.627 0 2.065 1.32 3.45 3.451.68 1.081 1.304 2.231 1.665 2.634.356.39.809.49 1.333.49z" />
          </svg>
          VK
        </span>
      );
    }
    if (provider === 'yandex') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.236 2C7.29 2 3.29 5.96 3.29 10.9c0 4.94 4 8.9 8.946 8.9.977 0 1.915-.15 2.793-.43L18.21 22l1.5-1.5-2.96-2.96A8.836 8.836 0 0 0 21.18 10.9C21.18 5.96 17.18 2 12.236 2zm0 2c3.84 0 6.946 3.09 6.946 6.9a6.93 6.93 0 0 1-6.946 6.9 6.93 6.93 0 0 1-6.946-6.9A6.93 6.93 0 0 1 12.236 4zm-.5 2v9h1.5V11h1c1.65 0 2.75-1.1 2.75-2.5S15.886 6 14.236 6h-2.5zm1.5 1.5h1c.7 0 1.25.45 1.25 1s-.55 1-1.25 1h-1V7.5z" />
          </svg>
          Яндекс
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full">
        <Send className="w-3 h-3" />
        Telegram
      </span>
    );
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate(`/seller/course/${courseId}`)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{t('manageStudents')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{course?.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <button
                onClick={() => setShowAddModal(true)}
                className="hidden sm:flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                {t('addStudent')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {enrollments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('noStudents')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('addStudentDesc')}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              {t('addStudent')}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('activeStudents')} ({enrollments.length})</h2>
            </div>

            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {enrollment.student?.photo_url ? (
                      <img src={enrollment.student.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                        {getInitials(enrollment)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {getStudentName(enrollment)}
                      </span>
                      {getProviderIcon(enrollment.student?.oauth_provider)}
                    </div>
                    {enrollment.student?.user_id && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">ID: {enrollment.student.user_id}</div>
                    )}
                    {enrollment.student?.email && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{enrollment.student.email}</div>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(enrollment.enrolled_at)}
                      </span>
                      {enrollment.expires_at ? (
                        <span className={`flex items-center gap-1 ${isExpired(enrollment.expires_at) ? 'text-red-500 dark:text-red-400' : ''}`}>
                          <Clock className="w-3 h-3" />
                          {formatDate(enrollment.expires_at)}
                          {isExpired(enrollment.expires_at) && ` (${t('expired')})`}
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">{t('lifetime')}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDialog({ open: true, id: enrollment.id })}
                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0 touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <table className="hidden md:table w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('studentColumn')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Провайдер / ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('enrolledColumn')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('expiresColumn')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('actionsColumn')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {enrollment.student?.photo_url ? (
                            <img src={enrollment.student.photo_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                              {getInitials(enrollment)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {getStudentName(enrollment)}
                          </div>
                          {enrollment.student?.email && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{enrollment.student.email}</div>
                          )}
                          {enrollment.student?.telegram_username && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">@{enrollment.student.telegram_username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getProviderIcon(enrollment.student?.oauth_provider)}
                        {enrollment.student?.user_id && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">ID: {enrollment.student.user_id}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(enrollment.enrolled_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enrollment.expires_at ? (
                        <span
                          className={`inline-flex items-center gap-1 text-sm ${
                            isExpired(enrollment.expires_at)
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          {formatDate(enrollment.expires_at)}
                          {isExpired(enrollment.expires_at) && ` (${t('expired')})`}
                        </span>
                      ) : (
                        <span className="text-sm text-green-600 dark:text-green-400">{t('lifetime')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setConfirmDialog({ open: true, id: enrollment.id })}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title={t('removeStudent')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <button
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-24 right-4 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center z-40 active:scale-95 touch-manipulation transition-transform"
      >
        <UserPlus className="w-6 h-6" />
      </button>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('addStudent')}</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID студента *
                </label>
                <input
                  type="text"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  required
                  className="w-full px-4 py-2 text-[16px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
                  placeholder="например: a1B2c3D4e5F6"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Студент найдет свой ID на странице выбора роли после входа в систему.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('accessDuration')}
                </label>
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 text-[16px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={t('accessDurationPlaceholder')}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('accessDurationHelp')}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setUserIdInput('');
                    setExpiryDays('30');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={adding || !userIdInput.trim()}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  {adding ? t('loading') : t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null })}
        onConfirm={() => {
          if (confirmDialog.id) {
            handleRemoveStudent(confirmDialog.id);
          }
        }}
        title={t('removeStudent')}
        message={t('removeStudentConfirm')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </div>
  );
}
