# Quick Reference Card

## Essential Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Type check without build
npm run lint         # Run linter
```

### Docker
```bash
# Build
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  --build-arg VITE_VK_CLIENT_ID=12345 \
  -t keykurs-frontend .

# Run
docker run -d -p 80:80 keykurs-frontend

# Docker Compose
docker-compose up -d
```

## Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_URL` | Yes | `http://localhost:3000` |
| `VITE_VK_CLIENT_ID` | Yes | `12345678` |

## API Client Usage

```typescript
import { api } from './lib/api';

// GET request
const courses = await api.get<Course[]>('/api/courses');

// POST request
const course = await api.post<Course>('/api/courses', {
  title: 'New Course',
  price: 1000
});

// PUT request
await api.put(`/api/courses/${id}`, { title: 'Updated' });

// DELETE request
await api.delete(`/api/courses/${id}`);

// File upload
const result = await api.uploadFile('/api/upload', file);

// Media URL
const url = api.getMediaUrl(s3Path);
```

## Migration Patterns

### Database Query
```typescript
// Before
const { data } = await supabase
  .from('courses')
  .select('*')
  .eq('id', courseId)
  .single();

// After
const course = await api.get<Course>(`/api/courses/${courseId}`);
```

### Insert
```typescript
// Before
const { data } = await supabase
  .from('courses')
  .insert({ title, price })
  .select()
  .single();

// After
const course = await api.post<Course>('/api/courses', { title, price });
```

### Update
```typescript
// Before
await supabase
  .from('courses')
  .update({ title })
  .eq('id', courseId);

// After
await api.put(`/api/courses/${courseId}`, { title });
```

### Delete
```typescript
// Before
await supabase
  .from('courses')
  .delete()
  .eq('id', courseId);

// After
await api.delete(`/api/courses/${courseId}`);
```

### File Upload
```typescript
// Before
const { data } = await supabase.storage
  .from('course-media')
  .upload(path, file);

// After
const result = await api.uploadFile('/api/upload/course-media', file);
```

## File Locations

| Purpose | File |
|---------|------|
| API Client | `src/lib/api.ts` |
| Auth Context | `src/contexts/AuthContext.tsx` |
| Migration Guide | `MIGRATION_GUIDE.md` |
| Deployment Guide | `DEPLOYMENT.md` |
| Full Checklist | `CHECKLIST.md` |

## Common Tasks

### Add New API Endpoint
1. Define type in `src/lib/api.ts`
2. Use `api.get/post/put/delete()` in component
3. Handle errors with try/catch

### Update Auth
- Auth state: `useAuth()` hook
- Current user: `user` from `useAuth()`
- Logout: `signOut()` from `useAuth()`

### Handle Media
```typescript
import { api } from './lib/api';

// Get media URL
const url = api.getMediaUrl(media.s3_url);

// Upload media
const result = await api.uploadFile('/api/upload/course-media', file);
```

## Troubleshooting

### White Screen
1. Check browser console for errors
2. Verify `VITE_API_URL` is set
3. Check CORS on backend
4. Verify backend is running

### 401 Unauthorized
- Token expired - will auto-redirect to login
- Check token in localStorage: `auth_token`

### Build Errors
```bash
npm run typecheck  # Check TypeScript errors
npm run lint       # Check linting errors
rm -rf node_modules && npm install  # Reinstall deps
```

## Documentation Index

1. **README.md** - Start here
2. **MIGRATION_GUIDE.md** - How to migrate from Supabase
3. **DEPLOYMENT.md** - How to deploy
4. **CHECKLIST.md** - Complete task list
5. **FILE_INDEX.md** - All files explained
6. **DIRECTORY_TREE.txt** - Visual structure
7. **REFACTOR_SCRIPT.md** - Automation patterns
8. **QUICK_REFERENCE.md** - This file

## Getting Help

1. Check relevant documentation file
2. Search for pattern in `MIGRATION_GUIDE.md`
3. Review `CHECKLIST.md` for task status
4. Check `src/lib/api.ts` for type definitions
5. Review similar migrated code in `AuthContext.tsx`

## Migration Priority

1. **High**: LoginPage, CourseView, CourseEdit, Dashboards
2. **Medium**: Media components, Bot config
3. **Low**: Admin features

Start with high-priority files as they block core functionality.
