# Frontend Migration & Deployment Checklist

## Pre-Migration

- [x] Copy all source code to `deploy/frontend/`
- [x] Copy all configuration files
- [x] Create API client (`src/lib/api.ts`)
- [x] Create API helpers (`src/lib/apiHelpers.ts`)
- [x] Update AuthContext to use JWT
- [x] Create documentation files
- [x] Create Docker configuration
- [x] Create Nginx configuration

## Code Migration Tasks

### High Priority - Core Functionality

#### Authentication & User Management
- [ ] `src/pages/LoginPage.tsx`
  - [ ] Replace Telegram OAuth
  - [ ] Replace VK OAuth
  - [ ] Update token handling
  - [ ] Test login flow

- [ ] `src/components/OAuthButtons.tsx`
  - [ ] Update OAuth redirect URLs
  - [ ] Update callback handling

- [ ] `src/components/TelegramLogin.tsx`
  - [ ] Update Telegram auth integration

#### Course Viewing (Student)
- [ ] `src/pages/StudentDashboard.tsx`
  - [ ] Replace enrollments query
  - [ ] Replace courses query
  - [ ] Update data types
  - [ ] Test enrollment display

- [ ] `src/pages/CourseView.tsx`
  - [ ] Replace course query
  - [ ] Replace posts query
  - [ ] Replace media query
  - [ ] Remove realtime subscription (or implement polling)
  - [ ] Update media URL generation
  - [ ] Test course content display

- [ ] `src/components/CourseFeed.tsx`
  - [ ] Update media URL handling
  - [ ] Replace any direct Supabase calls
  - [ ] Test feed display

#### Course Management (Seller)
- [ ] `src/pages/SellerDashboard.tsx`
  - [ ] Replace courses query
  - [ ] Replace bots query
  - [ ] Replace stats query
  - [ ] Test dashboard display

- [ ] `src/pages/CourseEdit.tsx`
  - [ ] Replace course update calls
  - [ ] Replace post creation calls
  - [ ] Replace media upload
  - [ ] Replace post deletion
  - [ ] Test course editing

- [ ] `src/pages/StudentsManager.tsx`
  - [ ] Replace enrollment queries
  - [ ] Replace approve/reject calls
  - [ ] Test student management

- [ ] `src/components/TelegramBotConfig.tsx`
  - [ ] Replace bot queries
  - [ ] Replace bot creation
  - [ ] Replace bot updates
  - [ ] Test bot configuration

### Medium Priority - Features

#### Media Handling
- [ ] `src/components/MediaGallery.tsx`
  - [ ] Update media URL generation
  - [ ] Remove Supabase storage calls
  - [ ] Test media display

- [ ] `src/components/MediaGroupEditor.tsx`
  - [ ] Update media upload
  - [ ] Update media organization
  - [ ] Test media groups

- [ ] `src/components/FileUpload.tsx`
  - [ ] Replace storage upload with API upload
  - [ ] Update progress tracking
  - [ ] Test file uploads

- [ ] `src/components/VideoPlayer.tsx`
  - [ ] Update media URL handling
  - [ ] Test video playback

- [ ] `src/components/VoicePlayer.tsx`
  - [ ] Update media URL handling
  - [ ] Test voice playback

#### Theme & Customization
- [ ] `src/components/ThemeCustomizationPanel.tsx`
  - [ ] Replace theme save calls
  - [ ] Test theme updates

- [ ] `src/components/AdvancedThemeCustomizer.tsx`
  - [ ] Replace theme configuration calls
  - [ ] Test advanced settings

- [ ] `src/contexts/ThemeContext.tsx`
  - [ ] Check for Supabase dependencies
  - [ ] Update if needed

#### Other Components
- [ ] `src/pages/RoleSelectionPage.tsx`
  - [ ] Replace role update calls
  - [ ] Test role selection

- [ ] `src/pages/SellerRegistrationPage.tsx`
  - [ ] Replace seller creation
  - [ ] Test registration flow

- [ ] `src/components/PinnedPostsSidebar.tsx`
  - [ ] Replace pinned posts query
  - [ ] Replace pin/unpin calls
  - [ ] Test pinned posts

### Low Priority - Admin Features

- [ ] `src/pages/AdminDashboard.tsx`
  - [ ] Replace all admin queries
  - [ ] Replace user management calls
  - [ ] Replace course management calls
  - [ ] Test admin panel

- [ ] `src/pages/admin/PremiumTab.tsx`
  - [ ] Replace premium course queries
  - [ ] Replace toggle premium calls
  - [ ] Test premium management

- [ ] `src/pages/admin/AdsTab.tsx`
  - [ ] Replace ads queries
  - [ ] Replace ad creation/updates
  - [ ] Test ad management

- [ ] `src/pages/admin/FeaturedTab.tsx`
  - [ ] Replace featured queries
  - [ ] Replace toggle featured calls
  - [ ] Test featured management

### Cleanup
- [ ] Remove `src/lib/supabase.ts`
- [ ] Remove all Supabase imports
- [ ] Remove `@supabase/supabase-js` from package.json
- [ ] Update all error handling
- [ ] Update all loading states

## Testing Checklist

### Authentication
- [ ] Telegram login works
- [ ] VK login works
- [ ] Logout works
- [ ] Token refresh works
- [ ] 401 redirects to login
- [ ] Auth state persists on refresh

### Student Features
- [ ] Can view course list
- [ ] Can view course content
- [ ] Can see enrolled courses
- [ ] Can enroll in new course
- [ ] Media loads correctly
- [ ] Videos play correctly
- [ ] Voice messages play correctly

### Seller Features
- [ ] Can view seller dashboard
- [ ] Can create new course
- [ ] Can edit course
- [ ] Can upload media
- [ ] Can create posts
- [ ] Can delete posts
- [ ] Can manage students
- [ ] Can approve/reject enrollments
- [ ] Can configure bot

### Admin Features
- [ ] Can access admin panel
- [ ] Can view all users
- [ ] Can view all courses
- [ ] Can toggle premium status
- [ ] Can toggle featured status
- [ ] Can manage ads

### UI/UX
- [ ] Theme switching works
- [ ] Language switching works
- [ ] Mobile responsive
- [ ] Loading states show correctly
- [ ] Error messages display correctly
- [ ] Success messages display correctly

### Performance
- [ ] Initial load time acceptable
- [ ] Media loads efficiently
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] No unnecessary re-renders

## Build & Deploy Checklist

### Local Development
- [ ] `npm install` runs successfully
- [ ] `npm run dev` starts dev server
- [ ] `npm run build` completes without errors
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] No console errors in browser
- [ ] All features work in dev mode

### Environment Configuration
- [ ] Create `.env` file
- [ ] Set `VITE_API_URL`
- [ ] Set `VITE_VK_CLIENT_ID`
- [ ] Test with production API URL
- [ ] Test with local API URL

### Docker Build
- [ ] Dockerfile builds successfully
- [ ] Build args passed correctly
- [ ] Container runs successfully
- [ ] Nginx serves files correctly
- [ ] SPA routing works (refresh on routes)
- [ ] Environment variables injected correctly

### Production Deployment
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Backend API accessible
- [ ] CORS configured on backend
- [ ] Build with production env vars
- [ ] Deploy to hosting platform
- [ ] Test production deployment
- [ ] Verify all features work
- [ ] Check performance metrics
- [ ] Monitor error logs

### Security
- [ ] No sensitive data in client code
- [ ] No API keys in client code
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CSP headers configured
- [ ] XSS protection enabled
- [ ] CSRF protection (if needed)

### Monitoring & Maintenance
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Setup analytics (if needed)
- [ ] Setup uptime monitoring
- [ ] Configure log aggregation
- [ ] Setup alerts for errors
- [ ] Document rollback procedure
- [ ] Schedule dependency updates

## Post-Deployment

### Verification
- [ ] All pages load
- [ ] All features work
- [ ] No 404 errors
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile experience good

### Documentation
- [ ] Update README with deployment URL
- [ ] Document any issues found
- [ ] Update migration guide if needed
- [ ] Create runbook for common issues

### Optimization
- [ ] Review bundle size
- [ ] Optimize images
- [ ] Configure CDN (if applicable)
- [ ] Enable compression
- [ ] Configure caching headers
- [ ] Lazy load routes (if not done)

## Notes

Use this checklist to track progress. Mark items as complete with `[x]`.

For each file migrated:
1. Read the file
2. Identify all Supabase calls
3. Replace with API calls (see MIGRATION_GUIDE.md)
4. Update types if needed
5. Test the feature
6. Mark as complete

Priority order:
1. Authentication (blocking for everything)
2. Student features (most users)
3. Seller features (content creators)
4. Admin features (least critical)

Remember to test after each file is migrated to catch issues early.
