# KeyKurs Frontend

React + TypeScript frontend for the KeyKurs online course platform.

## Architecture

This is a standalone frontend that communicates with the backend REST API. It has been migrated from Supabase client-side SDK to use a custom API client.

## Development

### Prerequisites
- Node.js 20+
- Backend API running on `http://localhost:3000` (or configure `VITE_API_URL`)

### Setup
```bash
npm install
cp .env.example .env
```

Edit `.env` and configure:
- `VITE_API_URL` - Backend API URL
- `VITE_VK_CLIENT_ID` - VK OAuth client ID

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

## Docker Build

```bash
docker build \
  --build-arg VITE_API_URL=https://api.keykurs.com \
  --build-arg VITE_VK_CLIENT_ID=your_vk_client_id \
  -t keykurs-frontend .
```

Run:
```bash
docker run -p 8080:80 keykurs-frontend
```

## Migration Status

This frontend is in the process of being migrated from Supabase to REST API.

### Completed
- ✅ API client (`src/lib/api.ts`)
- ✅ JWT authentication (`src/contexts/AuthContext.tsx`)
- ✅ Media URL helpers (`src/lib/apiHelpers.ts`)
- ✅ Docker configuration
- ✅ Nginx SPA routing

### Pending Migration
The following files still contain Supabase references and need to be updated:

**High Priority:**
- [ ] `src/pages/LoginPage.tsx` - OAuth login flows
- [ ] `src/pages/CourseView.tsx` - Course content display
- [ ] `src/pages/CourseEdit.tsx` - Course content management
- [ ] `src/pages/SellerDashboard.tsx` - Seller course list
- [ ] `src/pages/StudentDashboard.tsx` - Student enrollments
- [ ] `src/pages/AdminDashboard.tsx` - Admin panel

**Medium Priority:**
- [ ] `src/components/CourseFeed.tsx` - Post feed display
- [ ] `src/components/MediaGallery.tsx` - Media display
- [ ] `src/components/TelegramBotConfig.tsx` - Bot management
- [ ] `src/components/FileUpload.tsx` - File uploads
- [ ] `src/components/PinnedPostsSidebar.tsx` - Pinned posts

**Low Priority:**
- [ ] `src/pages/admin/*.tsx` - Admin features
- [ ] `src/pages/StudentsManager.tsx` - Student management
- [ ] Other components as needed

See `MIGRATION_GUIDE.md` for detailed migration instructions.

## API Endpoints

The frontend expects the following API endpoints:

### Authentication
- `POST /api/auth/telegram` - Telegram OAuth
- `POST /api/auth/vk` - VK OAuth
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/:id/posts` - Get posts
- `POST /api/courses/:id/posts` - Create post

### Enrollments
- `GET /api/student/enrollments` - My enrollments
- `POST /api/courses/:id/enroll` - Enroll in course

### Seller
- `GET /api/seller/courses` - My courses
- `GET /api/seller/bots` - My bots
- `POST /api/seller/bots` - Create bot

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/courses` - List courses
- `GET /api/admin/stats` - Statistics

### Media
- `POST /api/upload/course-media` - Upload file
- `GET /api/media/:path` - Get media (S3 proxy)

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Theme, Language)
├── hooks/              # Custom React hooks
├── lib/                # Core libraries
│   ├── api.ts         # API client
│   └── apiHelpers.ts  # Helper utilities
├── locales/           # i18n translations
├── pages/             # Page components
├── utils/             # Utility functions
└── main.tsx           # App entry point
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_VK_CLIENT_ID` | VK OAuth Client ID | `12345678` |

## Features

- 🔐 Multi-provider authentication (Telegram, VK)
- 📚 Course content management
- 📱 Responsive design
- 🎨 Theme customization
- 🌍 Multi-language support (RU/EN)
- 📹 Video/audio media support
- 🤖 Telegram bot integration
- 👥 Student enrollment management
- 📊 Seller dashboard
- 🛡️ Admin panel

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- Lucide Icons

## Contributing

When adding new features:
1. Use the API client (`src/lib/api.ts`) for all backend communication
2. Never use Supabase client directly
3. Follow existing patterns for error handling
4. Update TypeScript types in `src/lib/api.ts`
5. Add API endpoints to this README

## License

Proprietary
