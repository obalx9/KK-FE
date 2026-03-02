# Automated Refactoring Script

This document contains find-and-replace patterns for automated migration.

## Step 1: Remove Supabase Import
Find all files importing supabase and replace with api import.

**Find:**
```typescript
import { supabase } from '../lib/supabase';
```

**Replace:**
```typescript
import { api } from '../lib/api';
```

## Step 2: Common Patterns to Replace

### Pattern: Simple SELECT with eq()
**Find Regex:**
```
supabase\.from\('(\w+)'\)\.select\('([^']+)'\)\.eq\('(\w+)', ([^)]+)\)
```

**Replace with manual review:**
- Map table name to appropriate API endpoint
- Convert filters to query parameters

### Pattern: INSERT
**Find Regex:**
```
supabase\.from\('(\w+)'\)\.insert\(([^)]+)\)
```

**Replace:**
```typescript
api.post('/api/{endpoint}', {data})
```

### Pattern: UPDATE
**Find Regex:**
```
supabase\.from\('(\w+)'\)\.update\(([^)]+)\)\.eq\('id', ([^)]+)\)
```

**Replace:**
```typescript
api.put('/api/{endpoint}/{id}', {data})
```

### Pattern: DELETE
**Find Regex:**
```
supabase\.from\('(\w+)'\)\.delete\(\)\.eq\('id', ([^)]+)\)
```

**Replace:**
```typescript
api.delete('/api/{endpoint}/{id}')
```

## Step 3: Media URLs

**Find:**
```typescript
supabase.storage.from('course-media').getPublicUrl(path)
```

**Replace:**
```typescript
api.getMediaUrl(path)
```

## Step 4: Auth

**Find:**
```typescript
supabase.auth.signOut()
```

**Replace:**
```typescript
signOut() // from useAuth()
```

## Manual Review Required

The following require manual code review and cannot be automatically replaced:

1. Complex queries with multiple joins
2. Real-time subscriptions
3. RPC function calls
4. Storage upload operations
5. Transaction handling

## Files to Process (in order)

Process these files in this specific order to minimize dependencies:

1. src/lib/api.ts (✓ Already created)
2. src/contexts/AuthContext.tsx (✓ Already updated)
3. src/pages/LoginPage.tsx
4. src/pages/SellerDashboard.tsx
5. src/pages/StudentDashboard.tsx
6. src/pages/CourseView.tsx
7. src/pages/CourseEdit.tsx
8. src/pages/AdminDashboard.tsx
9. src/components/CourseFeed.tsx
10. src/components/MediaGallery.tsx
11. All remaining components

## Validation

After each file is updated:
1. Check TypeScript compilation: `npm run typecheck`
2. Test in browser
3. Verify API calls in Network tab
4. Check error handling
