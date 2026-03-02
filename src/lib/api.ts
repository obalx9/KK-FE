const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  setAuthToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    localStorage.removeItem('auth_token');
  }

  getMediaUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this.baseURL}/media/${path}`;
  }

  async telegramAuth(authData: any): Promise<{ user: User; token: string }> {
    return this.post('/api/auth/telegram', authData, { skipAuth: true });
  }

  async oauthCreateSession(userId: string): Promise<{ pkce_session_id: string }> {
    return this.post('/api/auth/oauth/create-session', { user_id: userId });
  }

  async updateUserRoles(roles: string[]): Promise<{ success: boolean }> {
    return this.post('/api/auth/update-roles', { roles });
  }

  async generateAdminLink(): Promise<{ link: string }> {
    return this.post('/api/admin/generate-link');
  }

  async generateMediaToken(fileId: string): Promise<{ token: string; url: string }> {
    return this.get(`/api/media/token?file_id=${fileId}`);
  }

  async registerTelegramWebhook(data: { botToken: string; botId: string }): Promise<any> {
    return this.post('/api/telegram/register-webhook', data);
  }

  async getTelegramChats(botId: string, action: string): Promise<any> {
    return this.get(`/api/telegram/chats?bot_id=${botId}&action=${action}`);
  }

  async linkTelegramChat(data: { bot_id: string; course_id: string; chat_id: string }): Promise<any> {
    return this.post('/api/telegram/link-chat', data);
  }

  async unlinkTelegramChat(data: { bot_id: string; course_id: string }): Promise<any> {
    return this.delete('/api/telegram/unlink-chat', {
      body: JSON.stringify(data)
    });
  }

  async deletePost(courseId: string, postId: string): Promise<void> {
    return this.delete(`/api/courses/${courseId}/posts/${postId}`);
  }

  getOAuthUrl(provider: 'vk' | 'yandex'): string {
    return `${this.baseURL}/api/oauth/${provider}`;
  }

  getWebhookUrl(): string {
    return `${this.baseURL}/api/telegram/webhook`;
  }

  async getCourses(): Promise<Course[]> {
    return this.get('/api/courses');
  }

  async getCourse(id: string): Promise<Course> {
    return this.get(`/api/courses/${id}`);
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    return this.post('/api/courses', data);
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    return this.put(`/api/courses/${id}`, data);
  }

  async deleteCourse(id: string): Promise<{ success: boolean }> {
    return this.delete(`/api/courses/${id}`);
  }

  async getCourseTelegramBot(courseId: string): Promise<TelegramBot | null> {
    return this.get(`/api/courses/${courseId}/telegram-bot`);
  }

  async getCoursePosts(courseId: string, limit = 50, offset = 0): Promise<CoursePost[]> {
    return this.get(`/api/posts/course/${courseId}?limit=${limit}&offset=${offset}`);
  }

  async getPost(id: string): Promise<CoursePost> {
    return this.get(`/api/posts/${id}`);
  }

  async createPost(data: { course_id: string; text_content?: string; message_date?: string; is_pinned?: boolean }): Promise<CoursePost> {
    return this.post('/api/posts', data);
  }

  async updatePost(id: string, data: { text_content?: string; is_pinned?: boolean }): Promise<CoursePost> {
    return this.put(`/api/posts/${id}`, data);
  }

  async deletePostById(id: string): Promise<{ success: boolean }> {
    return this.delete(`/api/posts/${id}`);
  }

  async getPostMedia(postId: string): Promise<CoursePostMedia[]> {
    return this.get(`/api/posts/${postId}/media`);
  }

  async addPostMedia(postId: string, mediaItems: any[]): Promise<CoursePostMedia[]> {
    return this.post(`/api/posts/${postId}/media`, mediaItems);
  }

  async deletePostMedia(mediaId: string): Promise<{ success: boolean }> {
    return this.delete(`/api/posts/media/${mediaId}`);
  }

  async getPinnedPosts(courseId: string, studentId: string): Promise<any[]> {
    return this.get(`/api/posts/pinned/${courseId}/${studentId}`);
  }

  async pinPost(data: { course_id: string; post_id: string }): Promise<any> {
    return this.post('/api/posts/pinned', data);
  }

  async unpinPost(postId: string): Promise<{ success: boolean }> {
    return this.delete(`/api/posts/pinned/${postId}`);
  }

  async uploadMedia(file: File): Promise<{ path: string; url: string; size: number; mimetype: string }> {
    return this.uploadFile('/api/media/upload', file);
  }

  async deleteMedia(path: string): Promise<{ success: boolean }> {
    return this.delete(`/api/media/${path}`);
  }

  getMediaPublicUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this.baseURL}/api/media/public/${path}`;
  }

  async getAdminStats(): Promise<{ totalUsers: number; totalSellers: number; totalCourses: number }> {
    return this.get('/api/admin/stats');
  }

  async getAdminSellers(): Promise<any[]> {
    return this.get('/api/admin/sellers');
  }

  async deleteAdminSeller(id: string): Promise<{ success: boolean }> {
    return this.delete(`/api/admin/sellers/${id}`);
  }

  async getAdminUsers(): Promise<any[]> {
    return this.get('/api/admin/users');
  }

  async getAdminCourses(): Promise<Course[]> {
    return this.get('/api/admin/courses');
  }

  async getAds(): Promise<any[]> {
    return this.get('/api/ads');
  }

  async createAd(data: any): Promise<any> {
    return this.post('/api/ads', data);
  }

  async updateAd(id: string, data: any): Promise<any> {
    return this.put(`/api/ads/${id}`, data);
  }

  async deleteAd(id: string): Promise<{ success: boolean }> {
    return this.delete(`/api/ads/${id}`);
  }

  async getFeaturedCourses(): Promise<any[]> {
    return this.get('/api/featured');
  }

  async createFeaturedCourse(data: { course_id: string; order_index?: number; is_active?: boolean }): Promise<any> {
    return this.post('/api/featured', data);
  }

  async updateFeaturedCourse(id: string, data: any): Promise<any> {
    return this.put(`/api/featured/${id}`, data);
  }

  async deleteFeaturedCourse(id: string): Promise<{ success: boolean }> {
    return this.delete(`/api/featured/${id}`);
  }

  async toggleFeaturedCourse(id: string): Promise<any> {
    return this.put(`/api/featured/${id}/toggle`, {});
  }

  async reorderFeaturedCourse(id: string, newOrderIndex: number, oldOrderIndex: number): Promise<any> {
    return this.put(`/api/featured/${id}/reorder`, { newOrderIndex, oldOrderIndex });
  }

  async recordAdView(adPostId: string): Promise<any> {
    return this.post('/api/stats/ad-view', { ad_post_id: adPostId });
  }
}

export const api = new ApiClient(API_URL);

export interface User {
  id: string;
  email: string | null;
  telegram_id: number | null;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  is_admin: boolean;
  is_seller: boolean;
  seller_id: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  telegram_chat_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  display_settings?: any;
  theme_config?: any;
  watermark_enabled?: boolean;
  watermark_text?: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
}

export interface CoursePost {
  id: string;
  course_id: string;
  message_text: string | null;
  telegram_message_id: number | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoursePostMedia {
  id: string;
  post_id: string;
  media_type: 'photo' | 'video' | 'document' | 'voice' | 'media_group';
  s3_url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  thumbnail_s3_url: string | null;
  media_group_id: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface PendingEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface TelegramBot {
  id: string;
  seller_id: string;
  bot_token: string;
  bot_username: string;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
}
