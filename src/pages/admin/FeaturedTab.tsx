import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit2, Trash2, X, Save, ArrowUp, ArrowDown, Star } from 'lucide-react';

interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

interface CourseForm {
  title: string;
  description: string;
  category: string;
  instructor: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
}

const emptyForm: CourseForm = {
  title: '',
  description: '',
  category: '',
  instructor: '',
  image_url: '',
  order_index: 0,
  is_active: true,
};

export default function FeaturedTab() {
  const [courses, setCourses] = useState<FeaturedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getFeaturedCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load featured courses:', error);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    const maxOrder = courses.reduce((m, c) => Math.max(m, c.order_index), -1);
    setIsCreating(true);
    setEditingId(null);
    setForm({ ...emptyForm, order_index: maxOrder + 1 });
  };

  const handleEdit = (course: FeaturedCourse) => {
    setEditingId(course.id);
    setIsCreating(false);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      instructor: course.instructor,
      image_url: course.image_url,
      order_index: course.order_index,
      is_active: course.is_active,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.updateFeaturedCourse(editingId, form);
      } else {
        await api.createFeaturedCourse(form as any);
      }
      handleCancel();
      loadCourses();
    } catch (error) {
      console.error('Failed to save featured course:', error);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту карточку из рекомендаций?')) return;
    try {
      await api.deleteFeaturedCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete featured course:', error);
    }
  };

  const handleToggleActive = async (course: FeaturedCourse) => {
    try {
      await api.toggleFeaturedCourse(course.id);
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_active: !c.is_active } : c));
    } catch (error) {
      console.error('Failed to toggle featured course:', error);
    }
  };

  const handleMove = async (course: FeaturedCourse, direction: 'up' | 'down') => {
    const sorted = [...courses].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex(c => c.id === course.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];
    try {
      await api.reorderFeaturedCourse(course.id, other.order_index, course.order_index);
      setCourses(prev => prev.map(c => {
        if (c.id === course.id) return { ...c, order_index: other.order_index };
        if (c.id === other.id) return { ...c, order_index: course.order_index };
        return c;
      }));
    } catch (error) {
      console.error('Failed to reorder featured course:', error);
    }
  };

  const sortedCourses = [...courses].sort((a, b) => a.order_index - b.order_index);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Рекомендуемые курсы</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Карточки, отображаемые на главной странице
          </p>
        </div>
        {!isCreating && !editingId && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Добавить карточку
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {isCreating ? 'Новая карточка' : 'Редактировать карточку'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название курса *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Название курса"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                placeholder="Программирование"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Краткое описание курса"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Преподаватель</label>
              <input
                type="text"
                value={form.instructor}
                onChange={e => setForm(p => ({ ...p, instructor: e.target.value }))}
                placeholder="Имя преподавателя"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Порядок отображения</label>
              <input
                type="number"
                value={form.order_index}
                onChange={e => setForm(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL изображения</label>
              <input
                type="url"
                value={form.image_url}
                onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                placeholder="https://images.pexels.com/..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {form.image_url && (
                <div className="mt-2 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Показывать на главной странице</span>
            </label>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
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
      )}

      {sortedCourses.length === 0 && !isCreating ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center py-16">
          <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Рекомендуемых курсов пока нет</p>
          <button onClick={handleCreate} className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">
            Добавить первую карточку
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCourses.map((course, idx) => (
            <div
              key={course.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border transition-all overflow-hidden ${
                course.is_active
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {course.image_url ? (
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {course.category && (
                      <span className="inline-flex px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-xs font-medium rounded">
                        {course.category}
                      </span>
                    )}
                    {!course.is_active && (
                      <span className="inline-flex px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded">
                        Скрыт
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{course.title}</p>
                  {course.instructor && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{course.instructor}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleMove(course, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleMove(course, 'down')}
                    disabled={idx === sortedCourses.length - 1}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(course)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      course.is_active
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                        : 'hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600'
                    }`}
                    title={course.is_active ? 'Скрыть' : 'Показать'}
                  >
                    <Star className={`w-4 h-4 ${course.is_active ? '' : 'fill-current text-teal-500'}`} />
                  </button>
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
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
