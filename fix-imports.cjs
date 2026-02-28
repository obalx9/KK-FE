const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/pages/admin/AdsTab.tsx',
  'src/pages/admin/FeaturedTab.tsx',
  'src/pages/admin/PremiumTab.tsx',
  'src/pages/StudentsManager.tsx',
  'src/pages/StudentDashboard.tsx',
  'src/pages/SellerRegistrationPage.tsx',
  'src/pages/SellerDashboard.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/CourseView.tsx',
  'src/pages/CourseEdit.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/components/TelegramBotConfig.tsx',
  'src/components/PinnedPostsSidebar.tsx',
  'src/components/MediaGroupEditor.tsx',
  'src/components/MediaGallery.tsx',
  'src/components/CourseFeed.tsx',
  'src/utils/mediaCache.ts'
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');

  content = content.replace(/from ['"]\.\.\/lib\/supabase['"]/g, "from '../lib/api'");
  content = content.replace(/from ['"]\.\.\/\.\.\/lib\/supabase['"]/g, "from '../../lib/api'");
  content = content.replace(/from ['"]\.\/lib\/supabase['"]/g, "from './lib/api'");

  content = content.replace(/import \{ supabase \}/g, "import { /* supabase removed */ }");

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed: ${filePath}`);
});

console.log('Done!');
