# Frontend Migration Guide

This document outlines all changes needed to migrate from Supabase client to REST API backend.

## Key Changes

### 1. Authentication (✓ Complete)
- `src/contexts/AuthContext.tsx` - Updated to use JWT token authentication via `/api/auth/me`
- Token stored in localStorage as `auth_token`
- Auto-redirect to `/login` on 401 responses

### 2. API Client (✓ Complete)
- `src/lib/api.ts` - New unified HTTP client
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`, `uploadFile()`
- Automatic token injection and error handling

### 3. Media Handling
All media URLs are now S3 URLs returned directly from the API.

**Before:**
```typescript
const url = telegram_file_id
  ? getTelegramMediaUrl(telegram_file_id, bot_token)
  : getSupabaseMediaUrl(s3_url);
```

**After:**
```typescript
const url = api.getMediaUrl(media.s3_url);
```

### 4. Database Queries Migration

#### Pattern 1: Simple SELECT
**Before:**
```typescript
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('seller_id', sellerId);
```

**After:**
```typescript
const data = await api.get<Course[]>(`/api/courses?seller_id=${sellerId}`);
```

#### Pattern 2: INSERT
**Before:**
```typescript
const { data, error } = await supabase
  .from('courses')
  .insert({ title, description, price })
  .select()
  .single();
```

**After:**
```typescript
const course = await api.post<Course>('/api/courses', {
  title,
  description,
  price
});
```

#### Pattern 3: UPDATE
**Before:**
```typescript
const { error } = await supabase
  .from('courses')
  .update({ title: 'New Title' })
  .eq('id', courseId);
```

**After:**
```typescript
await api.put(`/api/courses/${courseId}`, {
  title: 'New Title'
});
```

#### Pattern 4: DELETE
**Before:**
```typescript
const { error } = await supabase
  .from('courses')
  .delete()
  .eq('id', courseId);
```

**After:**
```typescript
await api.delete(`/api/courses/${courseId}`);
```

#### Pattern 5: File Upload
**Before:**
```typescript
const { data, error } = await supabase.storage
  .from('course-media')
  .upload(path, file);
```

**After:**
```typescript
const result = await api.uploadFile('/api/upload/course-media', file);
```

### 5. Real-time Subscriptions
Real-time features will need to be replaced with polling or WebSocket connections.

**Before:**
```typescript
const subscription = supabase
  .channel('course-posts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'course_posts' }, handleChange)
  .subscribe();
```

**After (Polling):**
```typescript
const interval = setInterval(async () => {
  const posts = await api.get<CoursePost[]>(`/api/courses/${courseId}/posts`);
  setPosts(posts);
}, 5000);
```

**After (WebSocket - if implemented):**
```typescript
const ws = new WebSocket(`${WS_URL}/courses/${courseId}/posts`);
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  handleChange(update);
};
```

## Files Requiring Changes

### High Priority (Core Functionality)

1. **src/pages/LoginPage.tsx**
   - Replace Telegram OAuth with `/api/auth/telegram`
   - Replace VK OAuth with `/api/auth/vk`
   - Handle JWT token response

2. **src/pages/CourseView.tsx**
   - Replace `supabase.from('courses').select()` with `api.get('/api/courses/:id')`
   - Replace `supabase.from('course_posts').select()` with `api.get('/api/courses/:id/posts')`
   - Replace `supabase.from('course_post_media').select()` with nested data from posts
   - Replace realtime subscription with polling

3. **src/pages/CourseEdit.tsx**
   - Replace `supabase.from('courses').update()` with `api.put('/api/courses/:id')`
   - Replace `supabase.from('course_posts').insert()` with `api.post('/api/courses/:id/posts')`
   - Replace `supabase.storage.upload()` with `api.uploadFile()`

4. **src/pages/SellerDashboard.tsx**
   - Replace `supabase.from('courses').select()` with `api.get('/api/seller/courses')`
   - Replace `supabase.from('telegram_bots').select()` with `api.get('/api/seller/bots')`

5. **src/pages/StudentDashboard.tsx**
   - Replace `supabase.from('course_enrollments').select()` with `api.get('/api/student/enrollments')`
   - Replace `supabase.from('courses').select()` with `api.get('/api/courses')`

6. **src/pages/AdminDashboard.tsx**
   - Replace all `supabase.from()` calls with appropriate API endpoints
   - `/api/admin/users`, `/api/admin/courses`, `/api/admin/stats`

### Medium Priority (Features)

7. **src/components/CourseFeed.tsx**
   - Replace media URL generation logic
   - Use `api.getMediaUrl()` for all media

8. **src/components/MediaGallery.tsx**
   - Update media URL handling
   - Replace storage URLs with S3 URLs

9. **src/components/TelegramBotConfig.tsx**
   - Replace `supabase.from('telegram_bots')` with `api.get('/api/seller/bots')`
   - Replace bot creation/update with API calls

10. **src/components/FileUpload.tsx**
    - Replace `supabase.storage.upload()` with `api.uploadFile()`

### Low Priority (Admin Features)

11. **src/pages/admin/PremiumTab.tsx**
    - Replace Supabase queries with admin API

12. **src/pages/admin/AdsTab.tsx**
    - Replace Supabase queries with admin API

13. **src/pages/admin/FeaturedTab.tsx**
    - Replace Supabase queries with admin API

14. **src/pages/StudentsManager.tsx**
    - Replace enrollment queries with API

### Contexts

15. **src/contexts/ThemeContext.tsx**
    - Check for any Supabase dependencies

16. **src/contexts/LanguageContext.tsx**
    - No changes needed (local state only)

17. **src/contexts/ScrollPreferencesContext.tsx**
    - No changes needed (local state only)

## API Endpoints Reference

### Authentication
- `POST /api/auth/telegram` - Telegram login
- `POST /api/auth/vk` - VK login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (seller)
- `PUT /api/courses/:id` - Update course (seller)
- `DELETE /api/courses/:id` - Delete course (seller)
- `GET /api/courses/:id/posts` - Get course posts
- `POST /api/courses/:id/posts` - Create post (seller)
- `PUT /api/courses/:id/posts/:postId` - Update post (seller)
- `DELETE /api/courses/:id/posts/:postId` - Delete post (seller)

### Enrollments
- `GET /api/student/enrollments` - Get my enrollments
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/:id/pending` - Get pending enrollments (seller)
- `POST /api/courses/:id/pending/:enrollmentId/approve` - Approve enrollment
- `POST /api/courses/:id/pending/:enrollmentId/reject` - Reject enrollment

### Seller
- `GET /api/seller/courses` - Get my courses
- `GET /api/seller/bots` - Get my bots
- `POST /api/seller/bots` - Create bot
- `PUT /api/seller/bots/:id` - Update bot
- `DELETE /api/seller/bots/:id` - Delete bot
- `GET /api/seller/stats` - Get seller statistics

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/courses` - List all courses
- `GET /api/admin/stats` - Get platform statistics
- `POST /api/admin/premium/:courseId` - Toggle premium status
- `POST /api/admin/featured/:courseId` - Toggle featured status

### Media
- `POST /api/upload/course-media` - Upload media file
- `GET /api/media/:path` - Get media file (proxied to S3)

## Environment Variables

Create `.env` file with:
```
VITE_API_URL=http://localhost:3000
VITE_VK_CLIENT_ID=your_vk_client_id
```

## Testing Checklist

- [ ] User can login via Telegram
- [ ] User can login via VK
- [ ] Seller can create course
- [ ] Seller can upload media
- [ ] Student can view course
- [ ] Student can enroll in course
- [ ] Media files display correctly
- [ ] Admin panel functions work
- [ ] User can logout
- [ ] Token refresh works
- [ ] 401 redirects to login
