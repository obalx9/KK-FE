# Supabase SDK Migration Guide

This document contains instructions for replacing remaining Supabase SDK calls with API client calls.

## Completed Migrations

- ✅ FileUpload.tsx
- ✅ mediaCache.ts
- ✅ FeaturedTab.tsx

## Remaining Files to Migrate

### 1. AdsTab.tsx

Replace patterns:

```typescript
// OLD:
import { supabase } from '../../lib/supabase';

// Storage operations
await supabase.storage.from('course-media').remove([form.storage_path]);
const url = supabase.storage.from('course-media').getPublicUrl(ad.storage_path).data.publicUrl;

// Database operations
await supabase.from('ad_posts').update(payload).eq('id', editingId);
await supabase.from('ad_posts').insert(payload);
await supabase.from('ad_posts').delete().eq('id', ad.id);

// NEW:
import { api } from '../../lib/api';

// Storage operations
await api.deleteMedia(form.storage_path);
const url = api.getMediaPublicUrl(ad.storage_path);

// Database operations
await api.updateAd(editingId, payload);
await api.createAd(payload);
await api.deleteAd(ad.id);
```

### 2. AdminDashboard.tsx

Replace patterns:

```typescript
// OLD:
const results = await Promise.all([
  supabase.from('users').select('id', { count: 'exact', head: true }),
  supabase.from('sellers').select('id', { count: 'exact', head: true }),
  supabase.from('courses').select('id', { count: 'exact', head: true })
]);

const { data: sellers } = await supabase.from('sellers').select('...').order('created_at', { ascending: false });

// NEW:
const stats = await api.getAdminStats();
const sellers = await api.getAdminSellers();
const users = await api.getAdminUsers();
const courses = await api.getAdminCourses();
```

### 3. CourseEdit.tsx

Replace patterns:

```typescript
// OLD:
const { data: course } = await supabase.from('courses').select('...').eq('id', courseId).maybeSingle();
await supabase.from('courses').update({ ... }).eq('id', courseId);
await supabase.storage.from('course-media').remove([path]);
const { data: bot } = await supabase.from('telegram_bots').select('...').eq('course_id', courseId).maybeSingle();

// NEW:
const course = await api.getCourse(courseId);
await api.updateCourse(courseId, { ... });
await api.deleteMedia(path);
const bot = await api.getCourseTelegramBot(courseId);
```

### 4. MediaGroupEditor.tsx

Replace ALL instances of:

```typescript
// OLD:
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;

await supabase.from('course_post_media').delete().eq('id', mediaId);

// NEW:
const token = localStorage.getItem('auth_token');

await api.deletePostMedia(mediaId);
```

### 5. CourseFeed.tsx (LARGE FILE - 1806 lines)

This is the most complex file. Key replacements:

```typescript
// Authentication
// OLD: const { data: { session } } = await supabase.auth.getSession();
// NEW: const token = localStorage.getItem('auth_token');

// Pinned posts
// OLD:
const { data } = await supabase.from('student_pinned_posts').select('post_id')...
await supabase.from('student_pinned_posts').delete()...
await supabase.from('student_pinned_posts').insert({ ... });

// NEW:
const data = await api.getPinnedPosts(courseId, userId);
await api.unpinPost(postId);
await api.pinPost({ course_id, post_id });

// Courses
// OLD: await supabase.from('courses').select('seller_id').eq('id', courseId).maybeSingle();
// NEW: const course = await api.getCourse(courseId);

// Ads
// OLD: await supabase.from('ad_posts').select('*').eq('is_active', true);
// NEW: const ads = await api.getAds();

// Ad stats
// OLD: await supabase.from('ad_post_stats').insert({ ... });
// NEW: await api.recordAdView(adPostId);

// Storage URLs
// OLD: supabase.storage.from('course-media').getPublicUrl(path).data.publicUrl
// NEW: api.getMediaPublicUrl(path)
```

## General Migration Pattern

1. **Import**: Replace `import { supabase } from '../lib/supabase'` with `import { api } from '../lib/api'`

2. **Auth tokens**: Replace `supabase.auth.getSession()` with `localStorage.getItem('auth_token')`

3. **Database queries**:
   - `supabase.from('table').select()` → `api.getXxx()`
   - `supabase.from('table').insert()` → `api.createXxx()`
   - `supabase.from('table').update()` → `api.updateXxx()`
   - `supabase.from('table').delete()` → `api.deleteXxx()`

4. **Storage operations**:
   - `supabase.storage.from('course-media').upload()` → `api.uploadMedia()`
   - `supabase.storage.from('course-media').remove()` → `api.deleteMedia()`
   - `supabase.storage.from('course-media').getPublicUrl()` → `api.getMediaPublicUrl()`

5. **Error handling**: Wrap API calls in try-catch blocks

## Testing Checklist

After migration, test:

- [ ] File uploads work correctly
- [ ] Media deletion works
- [ ] Featured courses CRUD operations
- [ ] Ads CRUD operations
- [ ] Admin dashboard stats loading
- [ ] Course editing and updates
- [ ] Pin/unpin posts functionality
- [ ] Media gallery and playback
- [ ] Authentication token handling
