# Frontend Repository File Index

## Documentation Files

- **README.md** - Main project documentation, architecture overview, and setup guide
- **MIGRATION_GUIDE.md** - Detailed guide for migrating from Supabase to REST API
- **REFACTOR_SCRIPT.md** - Find-and-replace patterns for automated migration
- **DEPLOYMENT.md** - Complete deployment guide for various platforms
- **FILE_INDEX.md** - This file, comprehensive index of all files

## Configuration Files

### Docker
- **Dockerfile** - Multi-stage build (Node builder + Nginx server)
- **docker-compose.yml** - Docker Compose configuration
- **.dockerignore** - Files to exclude from Docker build

### Build Tools
- **package.json** - NPM dependencies and scripts
- **package-lock.json** - Locked dependency versions
- **vite.config.ts** - Vite build configuration
- **tsconfig.json** - TypeScript base configuration
- **tsconfig.app.json** - TypeScript app-specific config
- **tsconfig.node.json** - TypeScript Node.js config
- **eslint.config.js** - ESLint configuration
- **postcss.config.js** - PostCSS configuration
- **tailwind.config.js** - TailwindCSS configuration

### Environment
- **.env.example** - Example environment variables
- **.gitignore** - Git ignore patterns

### Nginx
- **nginx.conf** - Nginx configuration for SPA routing

## Source Code

### Entry Point
- **index.html** - HTML entry point
- **src/main.tsx** - React application entry point
- **src/App.tsx** - Root React component
- **src/index.css** - Global styles
- **src/vite-env.d.ts** - Vite TypeScript definitions

### Core Libraries
- **src/lib/api.ts** ✓ - REST API client (replaces Supabase)
- **src/lib/apiHelpers.ts** ✓ - Helper functions for API integration
- **src/lib/supabase.ts** ⚠️ - Legacy Supabase client (to be removed)

### Contexts
- **src/contexts/AuthContext.tsx** ✓ - JWT authentication context (migrated)
- **src/contexts/ThemeContext.tsx** - Theme state management
- **src/contexts/LanguageContext.tsx** - i18n language state
- **src/contexts/ScrollPreferencesContext.tsx** - Scroll behavior preferences

### Hooks
- **src/hooks/useIntersectionObserver.ts** - Custom intersection observer hook

### Pages

#### Public Pages
- **src/pages/HomePage.tsx** ⚠️ - Landing page (needs migration)
- **src/pages/LoginPage.tsx** ⚠️ - Login/OAuth page (needs migration)
- **src/pages/RoleSelectionPage.tsx** ⚠️ - Role selection after registration

#### Student Pages
- **src/pages/StudentDashboard.tsx** ⚠️ - Student course list (needs migration)
- **src/pages/CourseView.tsx** ⚠️ - Course content viewer (needs migration)

#### Seller Pages
- **src/pages/SellerRegistrationPage.tsx** ⚠️ - Seller registration flow
- **src/pages/SellerDashboard.tsx** ⚠️ - Seller dashboard (needs migration)
- **src/pages/CourseEdit.tsx** ⚠️ - Course content editor (needs migration)
- **src/pages/StudentsManager.tsx** ⚠️ - Student enrollment management

#### Admin Pages
- **src/pages/AdminDashboard.tsx** ⚠️ - Admin panel (needs migration)
- **src/pages/admin/PremiumTab.tsx** ⚠️ - Premium course management
- **src/pages/admin/AdsTab.tsx** ⚠️ - Advertisement management
- **src/pages/admin/FeaturedTab.tsx** ⚠️ - Featured course management

#### Documentation Pages
- **src/pages/docs/DocsPage.tsx** - Student documentation
- **src/pages/docs/SellerDocsPage.tsx** - Seller documentation

#### Other Pages
- **src/pages/DeployPage.tsx** - Deployment information page

### Components

#### Course Components
- **src/components/CourseFeed.tsx** ⚠️ - Course post feed (needs migration)
- **src/components/PinnedPostsSidebar.tsx** ⚠️ - Pinned posts sidebar

#### Media Components
- **src/components/MediaGallery.tsx** ⚠️ - Media gallery display
- **src/components/MediaModal.tsx** - Media modal viewer
- **src/components/MediaThumbnail.tsx** - Media thumbnail component
- **src/components/MediaGroupEditor.tsx** ⚠️ - Media group editor
- **src/components/VideoPlayer.tsx** - Video player component
- **src/components/VoicePlayer.tsx** - Voice message player
- **src/components/FileUpload.tsx** ⚠️ - File upload component (needs migration)

#### Theme Components
- **src/components/ThemeToggle.tsx** - Theme switcher
- **src/components/ThemeCustomizationPanel.tsx** ⚠️ - Theme customization UI
- **src/components/AdvancedThemeCustomizer.tsx** ⚠️ - Advanced theme settings
- **src/components/ThemePreview.tsx** - Theme preview component
- **src/components/GradientEditor.tsx** - Gradient color editor
- **src/components/PostStylePreview.tsx** - Post style preview
- **src/components/EmojiPattern.tsx** - Emoji pattern background
- **src/components/BackgroundEmojiPattern.tsx** - Background emoji pattern
- **src/components/PreviewEmojiPattern.tsx** - Preview emoji pattern

#### Authentication Components
- **src/components/OAuthButtons.tsx** ⚠️ - OAuth login buttons (needs migration)
- **src/components/TelegramLogin.tsx** ⚠️ - Telegram login widget

#### Bot Components
- **src/components/TelegramBotConfig.tsx** ⚠️ - Telegram bot configuration

#### UI Components
- **src/components/BottomNavigation.tsx** - Mobile bottom navigation
- **src/components/ConfirmDialog.tsx** - Confirmation dialog
- **src/components/ContentProtectionWarning.tsx** - Content protection warning
- **src/components/LanguageSelector.tsx** - Language selector
- **src/components/KeyKursLogo.tsx** - Application logo

### Utilities
- **src/utils/contentProtection.ts** - Content protection utilities
- **src/utils/mediaCache.ts** - Media caching utilities
- **src/utils/postStyles.ts** - Post styling utilities
- **src/utils/themePresets.ts** - Theme preset configurations

### Localization
- **src/locales/translations.ts** - i18n translations (RU/EN)

### Public Assets
- **public/kursat.svg** - Logo asset
- **public/_redirects** - Netlify redirects configuration

## Migration Status Legend

- ✓ **Complete** - Fully migrated to REST API
- ⚠️ **Pending** - Still uses Supabase, needs migration
- (no marker) - No Supabase dependencies, no changes needed

## Total File Count

- **Total Files:** 84
- **Documentation:** 5
- **Configuration:** 13
- **Source Files:** 66
  - Core: 7
  - Contexts: 4
  - Hooks: 1
  - Pages: 19
  - Components: 28
  - Utils: 4
  - Localization: 1
  - Public: 2

## Next Steps

1. **Review MIGRATION_GUIDE.md** for detailed migration instructions
2. **Update files marked with ⚠️** to use REST API instead of Supabase
3. **Remove src/lib/supabase.ts** once all migrations are complete
4. **Test each page/component** after migration
5. **Deploy using DEPLOYMENT.md** instructions

## Quick Navigation

### For Developers
- Start here: `README.md`
- Migration help: `MIGRATION_GUIDE.md`
- API client: `src/lib/api.ts`
- Auth logic: `src/contexts/AuthContext.tsx`

### For DevOps
- Deployment: `DEPLOYMENT.md`
- Docker: `Dockerfile`, `docker-compose.yml`
- Nginx: `nginx.conf`
- Environment: `.env.example`

### For Contributors
- Migration patterns: `REFACTOR_SCRIPT.md`
- File structure: This file
- Code standards: `eslint.config.js`
