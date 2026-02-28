const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type UserRole = 'super_admin' | 'seller' | 'student';

export interface User {
  id: string;
  telegram_id: number;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  created_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: 'super_admin' | 'seller' | 'student';
  created_at: string;
}

export interface Seller {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  is_approved: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  telegram_bot_id?: string;
  telegram_channel_id?: string;
  price?: number;
  currency?: string;
  is_premium?: boolean;
  is_featured?: boolean;
  show_watermark?: boolean;
  watermark_text?: string;
  theme_preset?: string;
  theme_config?: Record<string, unknown>;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
  duration_minutes: number;
  created_at: string;
}

export interface LessonContent {
  id: string;
  lesson_id: string;
  content_type: 'video' | 'text' | 'file' | 'image';
  video_url?: string;
  text_content?: string;
  file_url?: string;
  file_name?: string;
  order_index: number;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  granted_by: string;
  enrolled_at: string;
  expires_at?: string;
}

export interface LessonProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  completed: boolean;
  last_position_seconds: number;
  updated_at: string;
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

export interface TelegramImportSession {
  id: string;
  bot_id: string;
  course_id: string;
  channel_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  total_messages?: number;
  processed_messages?: number;
  created_at?: string;
  completed_at?: string;
}

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { data: null, error: new Error(errorData.error || `HTTP ${response.status}`) };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

class SupabaseQueryBuilder<T> {
  private tableName: string;
  private selectFields: string = '*';
  private filters: Array<{ column: string; operator: string; value: unknown }> = [];
  private orderByField?: { column: string; ascending: boolean };
  private limitValue?: number;
  private singleResult = false;
  private maybeSingleResult = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: unknown) {
    this.filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: unknown) {
    this.filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, pattern: string) {
    this.filters.push({ column, operator: 'like', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string) {
    this.filters.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push({ column, operator: 'is', value });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderByField = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  maybeSingle() {
    this.maybeSingleResult = true;
    return this;
  }

  async then<TResult1 = { data: T | T[] | null; error: Error | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | T[] | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    const params = new URLSearchParams();
    params.append('select', this.selectFields);

    this.filters.forEach(filter => {
      params.append(`${filter.column}.${filter.operator}`, String(filter.value));
    });

    if (this.orderByField) {
      params.append('order', `${this.orderByField.column}.${this.orderByField.ascending ? 'asc' : 'desc'}`);
    }

    if (this.limitValue) {
      params.append('limit', String(this.limitValue));
    }

    const result = await apiRequest<T | T[]>(
      'GET',
      `/api/db/${this.tableName}?${params.toString()}`
    );

    if (this.singleResult || this.maybeSingleResult) {
      const data = result.data as T[] | null;
      if (this.singleResult && (!data || data.length === 0)) {
        return Promise.resolve(onfulfilled?.({ data: null, error: new Error('No rows found') }) as TResult1);
      }
      return Promise.resolve(onfulfilled?.({ data: data?.[0] || null, error: result.error }) as TResult1);
    }

    return Promise.resolve(onfulfilled?.({ data: result.data, error: result.error }) as TResult1);
  }
}

class SupabaseTable<T> {
  constructor(private tableName: string) {}

  select(fields?: string) {
    return new SupabaseQueryBuilder<T>(this.tableName).select(fields);
  }

  async insert(data: Partial<T> | Partial<T>[]) {
    return apiRequest<T>('POST', `/api/db/${this.tableName}`, data);
  }

  async update(data: Partial<T>) {
    return apiRequest<T>('PATCH', `/api/db/${this.tableName}`, data);
  }

  async delete() {
    return apiRequest<void>('DELETE', `/api/db/${this.tableName}`);
  }

  async upsert(data: Partial<T> | Partial<T>[]) {
    return apiRequest<T>('POST', `/api/db/${this.tableName}/upsert`, data);
  }
}

class SupabaseStorage {
  from(bucket: string) {
    return {
      upload: async (path: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/storage/${bucket}/upload?path=${encodeURIComponent(path)}`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
          return { data: null, error: new Error(errorData.error) };
        }

        const data = await response.json();
        return { data, error: null };
      },

      remove: async (paths: string[]) => {
        return apiRequest<void>('DELETE', `/api/storage/${bucket}/files`, { paths });
      },

      getPublicUrl: (path: string) => {
        return {
          data: {
            publicUrl: `${API_URL}/api/storage/${bucket}/${path}`
          }
        };
      },

      createSignedUrl: async (path: string, expiresIn: number) => {
        const result = await apiRequest<{ signedUrl: string }>('POST', `/api/storage/${bucket}/sign`, {
          path,
          expiresIn
        });
        return {
          data: result.data ? { signedUrl: result.data.signedUrl } : null,
          error: result.error
        };
      },
    };
  }
}

class SupabaseAuth {
  async signInWithPassword(credentials: { email: string; password: string }) {
    const result = await apiRequest<{ user: User; token: string }>('POST', '/api/auth/login', credentials);

    if (result.data) {
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('auth_user', JSON.stringify(result.data.user));
    }

    return {
      data: result.data ? { user: result.data.user, session: { access_token: result.data.token } } : null,
      error: result.error
    };
  }

  async signUp(credentials: { email: string; password: string }) {
    const result = await apiRequest<{ user: User; token: string }>('POST', '/api/auth/register', credentials);

    if (result.data) {
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('auth_user', JSON.stringify(result.data.user));
    }

    return {
      data: result.data ? { user: result.data.user, session: { access_token: result.data.token } } : null,
      error: result.error
    };
  }

  async signOut() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return { error: null };
  }

  async getUser() {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) {
      return { data: { user: null }, error: null };
    }

    try {
      const user = JSON.parse(userStr);
      return { data: { user }, error: null };
    } catch {
      return { data: { user: null }, error: null };
    }
  }

  async getSession() {
    const token = getAuthToken();
    const userStr = localStorage.getItem('auth_user');

    if (!token || !userStr) {
      return { data: { session: null }, error: null };
    }

    try {
      const user = JSON.parse(userStr);
      return {
        data: {
          session: {
            access_token: token,
            user
          }
        },
        error: null
      };
    } catch {
      return { data: { session: null }, error: null };
    }
  }

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return {
      data: { subscription: { unsubscribe: () => {} } },
    };
  }
}

export const supabase = {
  from<T = unknown>(table: string) {
    return new SupabaseTable<T>(table);
  },

  storage: new SupabaseStorage(),
  auth: new SupabaseAuth(),

  channel(name: string) {
    return {
      on: () => ({
        on: () => ({
          subscribe: () => ({
            unsubscribe: () => {}
          })
        })
      })
    };
  },

  rpc: async <T>(functionName: string, params?: Record<string, unknown>) => {
    return apiRequest<T>('POST', `/api/rpc/${functionName}`, params);
  },
};

export const getMediaUrl = (fileId: string): string => {
  if (!fileId) return '';
  return `${API_URL}/api/media/${encodeURIComponent(fileId)}`;
};

export const getMediaUrlWithToken = (fileId: string, token: string): string => {
  if (!fileId) return '';
  return `${API_URL}/api/media/${encodeURIComponent(fileId)}?token=${encodeURIComponent(token)}`;
};
