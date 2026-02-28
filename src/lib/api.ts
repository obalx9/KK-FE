const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const authToken = token ?? getStoredToken();

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (authToken) {
    reqHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: reqHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errMsg = errJson.error || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return res.json();
}

export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function clearStoredToken(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export interface StoredUser {
  id: string;
  user_id?: string;
  telegram_id?: number;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  email?: string;
  oauth_provider?: string;
  roles: string[];
}

export const getMediaUrl = (fileId: string): string => {
  if (!fileId) return '';
  return `${API_URL}/api/media/${encodeURIComponent(fileId)}`;
};

export const getMediaUrlWithToken = (fileId: string, token: string): string => {
  if (!fileId) return '';
  return `${API_URL}/api/media/${encodeURIComponent(fileId)}?token=${encodeURIComponent(token)}`;
};

export interface Course {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  telegram_bot_id?: string;
  telegram_channel_id?: string;
  price?: number;
  currency?: string;
  is_published: boolean;
  is_premium?: boolean;
  is_featured?: boolean;
  show_watermark?: boolean;
  watermark_text?: string;
  theme_preset?: string;
  theme_config?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface CoursePost {
  id: string;
  course_id: string;
  content?: string;
  media_type?: 'photo' | 'video' | 'document' | 'voice' | 'media_group';
  media_url?: string;
  media_file_id?: string;
  thumbnail_url?: string;
  telegram_message_id?: number;
  posted_at?: string;
  created_at?: string;
}

export interface CoursePostMedia {
  id: string;
  post_id: string;
  media_type: 'photo' | 'video' | 'document' | 'voice';
  media_url: string;
  media_file_id?: string;
  thumbnail_url?: string;
  media_group_id?: string;
  position?: number;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrolled_at?: string;
}

export interface PendingEnrollment {
  id: string;
  course_id: string;
  telegram_id: number;
  user_id?: string;
  created_at?: string;
}

export interface StudentPinnedPost {
  id: string;
  student_id: string;
  post_id: string;
  pinned_at?: string;
}

export interface TelegramBot {
  id: string;
  seller_id: string;
  bot_token: string;
  bot_username?: string;
  created_at?: string;
}

export const coursesApi = {
  list: () => apiRequest<Course[]>('/api/courses'),
  get: (id: string) => apiRequest<Course>(`/api/courses/${id}`),
  create: (data: Partial<Course>) => apiRequest<Course>('/api/courses', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Course>) => apiRequest<Course>(`/api/courses/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiRequest<void>(`/api/courses/${id}`, { method: 'DELETE' }),
  publish: (id: string) => apiRequest<Course>(`/api/courses/${id}/publish`, { method: 'POST' }),
  unpublish: (id: string) => apiRequest<Course>(`/api/courses/${id}/unpublish`, { method: 'POST' }),
};

export const postsApi = {
  list: (courseId: string) => apiRequest<CoursePost[]>(`/api/courses/${courseId}/posts`),
  get: (postId: string) => apiRequest<CoursePost>(`/api/posts/${postId}`),
  create: (courseId: string, data: Partial<CoursePost>) => apiRequest<CoursePost>(`/api/courses/${courseId}/posts`, { method: 'POST', body: data }),
  update: (postId: string, data: Partial<CoursePost>) => apiRequest<CoursePost>(`/api/posts/${postId}`, { method: 'PUT', body: data }),
  delete: (postId: string) => apiRequest<void>(`/api/posts/${postId}`, { method: 'DELETE' }),
  getMedia: (postId: string) => apiRequest<CoursePostMedia[]>(`/api/posts/${postId}/media`),
};

export const enrollmentsApi = {
  list: (courseId: string) => apiRequest<Enrollment[]>(`/api/courses/${courseId}/enrollments`),
  enroll: (courseId: string) => apiRequest<Enrollment>(`/api/courses/${courseId}/enroll`, { method: 'POST' }),
  unenroll: (courseId: string) => apiRequest<void>(`/api/courses/${courseId}/unenroll`, { method: 'DELETE' }),
  pending: (courseId: string) => apiRequest<PendingEnrollment[]>(`/api/courses/${courseId}/pending`),
  approvePending: (enrollmentId: string) => apiRequest<Enrollment>(`/api/pending-enrollments/${enrollmentId}/approve`, { method: 'POST' }),
  rejectPending: (enrollmentId: string) => apiRequest<void>(`/api/pending-enrollments/${enrollmentId}/reject`, { method: 'DELETE' }),
};

export const pinnedPostsApi = {
  list: () => apiRequest<StudentPinnedPost[]>('/api/pinned-posts'),
  pin: (postId: string) => apiRequest<StudentPinnedPost>('/api/pinned-posts', { method: 'POST', body: { post_id: postId } }),
  unpin: (postId: string) => apiRequest<void>(`/api/pinned-posts/${postId}`, { method: 'DELETE' }),
};

export const telegramApi = {
  getBots: () => apiRequest<TelegramBot[]>('/api/telegram/bots'),
  createBot: (data: { bot_token: string }) => apiRequest<TelegramBot>('/api/telegram/bots', { method: 'POST', body: data }),
  deleteBot: (botId: string) => apiRequest<void>(`/api/telegram/bots/${botId}`, { method: 'DELETE' }),
  syncChannel: (botId: string, channelId: string) => apiRequest<{ message: string }>('/api/telegram/sync', { method: 'POST', body: { bot_id: botId, channel_id: channelId } }),
};

export const storageApi = {
  upload: async (bucket: string, path: string, file: File): Promise<{ path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);

    const authToken = getStoredToken();
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${API_URL}/api/storage/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }

    return res.json();
  },

  delete: async (bucket: string, paths: string[]): Promise<void> => {
    await apiRequest('/api/storage/delete', {
      method: 'DELETE',
      body: { bucket, paths },
    });
  },

  getPublicUrl: (bucket: string, path: string): string => {
    return `${API_URL}/api/storage/${bucket}/${path}`;
  },
};

export const adminApi = {
  listUsers: () => apiRequest<StoredUser[]>('/api/admin/users'),
  updateUserRoles: (userId: string, roles: string[]) => apiRequest<StoredUser>(`/api/admin/users/${userId}/roles`, { method: 'PUT', body: { roles } }),
  listPremiumCourses: () => apiRequest<Course[]>('/api/admin/premium-courses'),
  setPremium: (courseId: string, isPremium: boolean) => apiRequest<Course>(`/api/admin/courses/${courseId}/premium`, { method: 'PUT', body: { is_premium: isPremium } }),
  listFeaturedCourses: () => apiRequest<Course[]>('/api/admin/featured-courses'),
  setFeatured: (courseId: string, isFeatured: boolean) => apiRequest<Course>(`/api/admin/courses/${courseId}/featured`, { method: 'PUT', body: { is_featured: isFeatured } }),
  listAdCourses: () => apiRequest<Course[]>('/api/admin/ad-courses'),
};
