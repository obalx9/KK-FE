import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, Store, Shield, Bot, Palette, Settings,
  ChevronRight, ChevronDown, Menu, X, ArrowLeft, Search,
  GraduationCap, Video, Image, FileText, Mic, File,
  Lock, Globe, Bell, Star, Megaphone, Crown,
  LogIn, UserPlus, Key, Zap, Database, Server,
  Hash, Link2, BarChart2, Eye, Download, Pin
} from 'lucide-react';
import KeyKursLogo from '../../components/KeyKursLogo';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';

interface Section {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: { id: string; label: string }[];
}

const SECTIONS: Section[] = [
  {
    id: 'overview',
    label: 'Обзор платформы',
    icon: BookOpen,
    children: [
      { id: 'overview-what', label: 'Что такое KeyKurs' },
      { id: 'overview-roles', label: 'Роли пользователей' },
      { id: 'overview-stack', label: 'Технологии' },
    ],
  },
  {
    id: 'auth',
    label: 'Авторизация',
    icon: LogIn,
    children: [
      { id: 'auth-telegram', label: 'Telegram Login' },
      { id: 'auth-oauth', label: 'OAuth (VK, Яндекс, Google)' },
      { id: 'auth-roles', label: 'Выбор роли' },
      { id: 'auth-security', label: 'Безопасность' },
    ],
  },
  {
    id: 'student',
    label: 'Кабинет студента',
    icon: GraduationCap,
    children: [
      { id: 'student-dashboard', label: 'Дашборд' },
      { id: 'student-course', label: 'Просмотр курса' },
      { id: 'student-pins', label: 'Закреплённые посты' },
      { id: 'student-search', label: 'Поиск по курсу' },
    ],
  },
  {
    id: 'seller',
    label: 'Кабинет продавца',
    icon: Store,
    children: [
      { id: 'seller-register', label: 'Регистрация' },
      { id: 'seller-dashboard', label: 'Дашборд' },
      { id: 'seller-course-create', label: 'Создание курса' },
      { id: 'seller-course-edit', label: 'Редактирование курса' },
      { id: 'seller-students', label: 'Управление студентами' },
      { id: 'seller-content', label: 'Контент и медиа' },
      { id: 'seller-settings', label: 'Настройки курса' },
    ],
  },
  {
    id: 'themes',
    label: 'Оформление курса',
    icon: Palette,
    children: [
      { id: 'themes-presets', label: 'Готовые темы' },
      { id: 'themes-custom', label: 'Кастомная тема' },
      { id: 'themes-emoji', label: 'Паттерны и фон' },
      { id: 'themes-watermark', label: 'Водяной знак' },
    ],
  },
  {
    id: 'telegram',
    label: 'Telegram интеграция',
    icon: Bot,
    children: [
      { id: 'telegram-main-bot', label: 'Главный бот' },
      { id: 'telegram-course-bot', label: 'Бот курса' },
      { id: 'telegram-sync', label: 'Синхронизация' },
    ],
  },
  {
    id: 'admin',
    label: 'Панель администратора',
    icon: Shield,
    children: [
      { id: 'admin-overview', label: 'Статистика' },
      { id: 'admin-sellers', label: 'Одобрение продавцов' },
      { id: 'admin-premium', label: 'Премиум' },
      { id: 'admin-ads', label: 'Реклама' },
      { id: 'admin-featured', label: 'Рекомендации' },
      { id: 'admin-bot', label: 'Настройка бота' },
    ],
  },
  {
    id: 'protection',
    label: 'Защита контента',
    icon: Lock,
    children: [
      { id: 'protection-basic', label: 'Базовая защита' },
      { id: 'protection-devtools', label: 'DevTools защита' },
      { id: 'protection-watermark', label: 'Динамический водяной знак' },
    ],
  },
  {
    id: 'settings',
    label: 'Настройки',
    icon: Settings,
    children: [
      { id: 'settings-theme', label: 'Тема (светлая/тёмная)' },
      { id: 'settings-language', label: 'Язык интерфейса' },
      { id: 'settings-scroll', label: 'Скролл-режим' },
    ],
  },
  {
    id: 'database',
    label: 'База данных',
    icon: Database,
    children: [
      { id: 'database-tables', label: 'Основные таблицы' },
      { id: 'database-rls', label: 'Row Level Security' },
    ],
  },
  {
    id: 'functions',
    label: 'Edge Functions',
    icon: Server,
    children: [
      { id: 'functions-list', label: 'Список функций' },
    ],
  },
];

function SectionNav({ sections, activeId, onSelect }: {
  sections: Section[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['overview']));

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <nav className="space-y-0.5">
      {sections.map(section => {
        const Icon = section.icon;
        const isExpanded = expanded.has(section.id);
        const isActive = activeId === section.id || section.children?.some(c => c.id === activeId);
        return (
          <div key={section.id}>
            <button
              onClick={() => {
                toggle(section.id);
                onSelect(section.id);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{section.label}</span>
              {section.children && (
                isExpanded
                  ? <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  : <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              )}
            </button>
            {section.children && isExpanded && (
              <div className="ml-4 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-0.5 mt-0.5 mb-1">
                {section.children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => onSelect(child.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all ${
                      activeId === child.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function Badge({ color, children }: { color: 'blue' | 'green' | 'amber' | 'red' | 'gray'; children: React.ReactNode }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

function InfoCard({ icon: Icon, title, children, color = 'blue' }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'amber';
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  };
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm mb-1">{title}</p>
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}

function TableRow({ cells }: { cells: React.ReactNode[] }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {cells.map((cell, i) => (
        <td key={i} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{cell}</td>
      ))}
    </tr>
  );
}

function DocTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => <TableRow key={i} cells={row} />)}
        </tbody>
      </table>
    </div>
  );
}

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4 scroll-mt-24 first:mt-0">
      {children}
    </h2>
  );
}
function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-3 scroll-mt-24">
      {children}
    </h3>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{children}</p>;
}
function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5 mb-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <hr className="border-gray-200 dark:border-gray-800 my-8" />;
}

function RoleCard({ icon: Icon, role, color, description, access }: {
  icon: React.ElementType;
  role: string;
  color: string;
  description: string;
  access: string[];
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{role}</h4>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
      <ul className="space-y-1">
        {access.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <ChevronRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DocsPage() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('overview-what');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollTo = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    document.querySelectorAll('[data-doc-section]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <KeyKursLogo className="w-7 h-7" />
              <span className="font-bold text-gray-900 dark:text-white hidden sm:inline">KeyKurs</span>
            </button>
            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">/</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">Документация</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Назад</span>
            </button>
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-900 dark:text-white">Разделы</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <SectionNav sections={SECTIONS} activeId={activeId} onSelect={scrollTo} />
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto flex">
        <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 border-r border-gray-200 dark:border-gray-800">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <SectionNav
            sections={searchQuery
              ? SECTIONS.filter(s =>
                  s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.children?.some(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
                )
              : SECTIONS
            }
            activeId={activeId}
            onSelect={scrollTo}
          />
        </aside>

        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 max-w-3xl">
          <section id="overview-what" data-doc-section>
            <H2 id="overview-what">Что такое KeyKurs</H2>
            <P>
              KeyKurs — многопользовательская платформа онлайн-обучения. Продавцы создают и продают курсы,
              студенты проходят их через удобный интерфейс. Платформа построена на стеке React + TypeScript
              (фронтенд) и Supabase (база данных, авторизация, хранилище, serverless-функции).
            </P>
            <P>
              Ключевые особенности: защита контента, кастомизация оформления курса, интеграция с Telegram,
              мультиязычность (RU/EN), поддержка нескольких провайдеров авторизации.
            </P>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              {[
                { icon: Users, label: 'Студентов', value: '10 000+' },
                { icon: Store, label: 'Продавцов', value: '150+' },
                { icon: BookOpen, label: 'Курсов', value: '500+' },
                { icon: Globe, label: 'Языков', value: '2' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="overview-roles" data-doc-section>
            <H3 id="overview-roles">Роли пользователей</H3>
            <P>Система трёхуровневых ролей с поддержкой мультироли (пользователь может одновременно быть студентом и продавцом).</P>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <RoleCard
                icon={Shield}
                role="super_admin"
                color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                description="Полный доступ к платформе. Управляет всеми участниками."
                access={['Одобрение продавцов', 'Управление премиум', 'Реклама и рекомендации', 'Настройка главного бота']}
              />
              <RoleCard
                icon={Store}
                role="seller"
                color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                description="Создаёт курсы и управляет студентами."
                access={['Создание курсов', 'Добавление студентов', 'Загрузка медиа', 'Кастомизация темы', 'Telegram-бот курса']}
              />
              <RoleCard
                icon={GraduationCap}
                role="student"
                color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                description="Проходит записанные курсы."
                access={['Просмотр курсов', 'Поиск по урокам', 'Закрепление постов', 'История обучения']}
              />
            </div>
          </section>

          <section id="overview-stack" data-doc-section>
            <H3 id="overview-stack">Технологии</H3>
            <DocTable
              headers={['Слой', 'Технология', 'Назначение']}
              rows={[
                ['Фронтенд', <Badge color="blue">React 18 + TypeScript</Badge>, 'SPA приложение'],
                ['Стили', <Badge color="blue">Tailwind CSS</Badge>, 'Утилитарный CSS, тёмная тема'],
                ['Иконки', <Badge color="gray">Lucide React</Badge>, 'Иконки интерфейса'],
                ['Роутинг', <Badge color="gray">React Router v7</Badge>, 'Клиентская навигация'],
                ['БД / Auth', <Badge color="green">Supabase</Badge>, 'PostgreSQL + JWT авторизация'],
                ['Хранилище', <Badge color="green">Supabase Storage</Badge>, 'Медиафайлы курсов'],
                ['Serverless', <Badge color="green">Supabase Edge Functions</Badge>, 'Telegram, OAuth, токены'],
                ['Real-time', <Badge color="green">Supabase Realtime</Badge>, 'Закреплённые посты'],
                ['Сборка', <Badge color="gray">Vite</Badge>, 'Быстрая сборка и HMR'],
              ]}
            />
          </section>

          <Divider />

          <section id="auth" data-doc-section>
            <H2 id="auth">Авторизация</H2>
            <P>Платформа не использует пароли. Вход возможен через Telegram или OAuth-провайдеры.</P>
          </section>

          <section id="auth-telegram" data-doc-section>
            <H3 id="auth-telegram">Telegram Login</H3>
            <P>Основной способ входа. Пользователь авторизуется через официальный виджет Telegram.</P>
            <UL items={[
              'Пользователь нажимает кнопку Telegram Login на странице /login',
              'Открывается окно авторизации Telegram',
              'Telegram возвращает подписанные данные (id, имя, username, фото, hash)',
              'Edge function telegram-auth проверяет подпись через HMAC-SHA256 с токеном бота',
              'Создаётся или обновляется запись в таблице users',
              'Возвращается JWT-токен Supabase, устанавливается сессия',
              'Перенаправление на /role-select (если нет роли) или на дашборд',
            ]} />
            <InfoCard icon={Key} title="Безопасность подписи">
              Каждый запрос к telegram-auth содержит hash, вычисленный Telegram по секретному ключу бота.
              Edge function проверяет его и отклоняет поддельные запросы.
            </InfoCard>
          </section>

          <section id="auth-oauth" data-doc-section>
            <H3 id="auth-oauth">OAuth (VK, Яндекс, Google)</H3>
            <P>Дополнительные провайдеры авторизации для пользователей без Telegram.</P>
            <UL items={[
              'Кнопки VK / Яндекс / Google отображаются на странице /login',
              'Клик перенаправляет на страницу авторизации провайдера',
              'После авторизации провайдер возвращает code на callback URL',
              'Edge function oauth-login обменивает code на данные пользователя',
              'Создаётся запись в users с полем oauth_provider',
              'Edge function oauth-create-session создаёт Supabase-сессию по user_id',
              'Перенаправление на /role-select?user_id=...',
            ]} />
            <DocTable
              headers={['Поле', 'Описание']}
              rows={[
                ['oauth_provider', 'Провайдер: vk, yandex, google'],
                ['email', 'Email из профиля OAuth'],
                ['user_id', 'Уникальный ID для ссылки на сессию (PKCE)'],
              ]}
            />
          </section>

          <section id="auth-roles" data-doc-section>
            <H3 id="auth-roles">Выбор роли (/role-select)</H3>
            <P>
              Страница выбора роли показывается при первом входе или при наличии нескольких ролей.
              Пользователь выбирает режим работы: студент или продавец.
            </P>
            <UL items={[
              'Если у пользователя нет роли — предлагается стать студентом или зарегистрироваться как продавец',
              'Если роль одна — автоматический редирект на соответствующий дашборд',
              'Если ролей несколько — показывается экран выбора режима',
            ]} />
          </section>

          <section id="auth-security" data-doc-section>
            <H3 id="auth-security">Безопасность авторизации</H3>
            <UL items={[
              'JWT с ролевыми claims (role: seller / student / super_admin)',
              'Автоматическое обновление сессии',
              'PKCE Flow для OAuth (защита от перехвата кода)',
              'Верификация подписи Telegram (HMAC-SHA256)',
              'RLS на все таблицы — данные доступны только авторизованным пользователям',
            ]} />
          </section>

          <Divider />

          <section id="student" data-doc-section>
            <H2 id="student">Кабинет студента</H2>
          </section>

          <section id="student-dashboard" data-doc-section>
            <H3 id="student-dashboard">Дашборд (/dashboard)</H3>
            <P>Главная страница для студентов. Показывает все записанные курсы в виде карточек.</P>
            <UL items={[
              'Список курсов с обложками, названиями и описаниями',
              'Кнопка перехода в курс',
              'Отображение своего user_id для записи на курсы',
              'Кнопка выхода и переключение режима (если есть роль продавца)',
            ]} />
          </section>

          <section id="student-course" data-doc-section>
            <H3 id="student-course">Просмотр курса (/course/:courseId)</H3>
            <P>Основная страница потребления контента. Отображает ленту уроков/постов курса.</P>
            <UL items={[
              'Лента уроков с пагинацией и бесконечным скроллом',
              'Поддержка типов контента: видео, изображения, текст, голос, файлы',
              'Медиагруппы (несколько файлов в одном посте)',
              'Автовоспроизведение видео (если включено продавцом)',
              'Поиск по содержимому курса',
              'Snap-скролл для удобной навигации между постами',
              'Боковая панель закреплённых постов (десктоп)',
            ]} />
            <InfoCard icon={Lock} title="Защита контента" color="amber">
              На странице курса активируется защита: запрещено правое меню, копирование,
              отслеживаются DevTools. Водяной знак с именем студента виден на всех материалах.
            </InfoCard>
          </section>

          <section id="student-pins" data-doc-section>
            <H3 id="student-pins">Закреплённые посты</H3>
            <P>Студент может закрепить важные уроки для быстрого доступа.</P>
            <UL items={[
              'Кнопка закрепления на каждом посте',
              'Закреплённые посты отображаются в боковой панели (десктоп)',
              'На мобильном — иконка в нижней навигации открывает список',
              'Синхронизация через Supabase Realtime в реальном времени',
              'Данные сохраняются в таблице student_pinned_posts',
            ]} />
          </section>

          <section id="student-search" data-doc-section>
            <H3 id="student-search">Поиск по курсу</H3>
            <P>Полнотекстовый поиск по заголовкам и описаниям уроков внутри курса.</P>
            <UL items={[
              'Строка поиска появляется при прокрутке (десктоп) или через кнопку (мобильный)',
              'Поиск в реальном времени по полям title и description постов',
              'Результаты фильтруются мгновенно без перезагрузки',
            ]} />
          </section>

          <Divider />

          <section id="seller" data-doc-section>
            <H2 id="seller">Кабинет продавца</H2>
          </section>

          <section id="seller-register" data-doc-section>
            <H3 id="seller-register">Регистрация продавца (/register-seller)</H3>
            <P>Для начала продаж нужно пройти регистрацию и дождаться одобрения администратором.</P>
            <UL items={[
              'Заполнение формы: название бизнеса, описание',
              'Заявка отправляется на рассмотрение администратору',
              'До одобрения интерфейс показывает статус "ожидание"',
              'После одобрения открывается полный доступ к инструментам',
            ]} />
          </section>

          <section id="seller-dashboard" data-doc-section>
            <H3 id="seller-dashboard">Дашборд продавца (/seller/dashboard)</H3>
            <P>Центральная точка управления. Список всех курсов с ключевыми действиями.</P>
            <UL items={[
              'Карточки курсов с обложкой, статусом публикации, числом студентов',
              'Кнопка создания нового курса',
              'Быстрые действия: редактировать, просмотреть, управлять студентами, удалить',
              'Переключатель публикации (черновик / опубликован)',
              'Кнопка настройки Telegram-бота для каждого курса',
            ]} />
          </section>

          <section id="seller-course-create" data-doc-section>
            <H3 id="seller-course-create">Создание курса</H3>
            <P>Новый курс создаётся из дашборда продавца кнопкой "Создать курс".</P>
            <UL items={[
              'Вводится название и описание',
              'Курс создаётся в статусе "черновик"',
              'Автоматический переход на страницу редактирования',
            ]} />
          </section>

          <section id="seller-course-edit" data-doc-section>
            <H3 id="seller-course-edit">Редактирование курса (/seller/course/:courseId)</H3>
            <P>Основное рабочее пространство продавца. Несколько вкладок для управления разными аспектами курса.</P>
            <DocTable
              headers={['Вкладка', 'Функции']}
              rows={[
                ['Контент', 'Управление уроками, добавление медиа, редактирование текстов, порядок постов'],
                ['Дизайн', 'Выбор темы, кастомизация цветов, паттерны, загрузка обложки'],
                ['Настройки', 'Публикация, автовоспроизведение, скачивание, порядок постов, водяной знак'],
                ['Студенты', 'Добавление/удаление студентов по user_id'],
              ]}
            />
          </section>

          <section id="seller-students" data-doc-section>
            <H3 id="seller-students">Управление студентами (/seller/course/:courseId/students)</H3>
            <P>Полный список студентов курса с возможностью добавления и отзыва доступа.</P>
            <UL items={[
              'Добавление студента по user_id (отображается в кабинете студента)',
              'Просмотр списка всех зачисленных студентов',
              'Установка даты истечения доступа',
              'Отзыв доступа (удаление из курса)',
              'Экспорт списка студентов',
            ]} />
          </section>

          <section id="seller-content" data-doc-section>
            <H3 id="seller-content">Контент и медиа</H3>
            <P>Поддерживаемые типы медиа в уроках курса:</P>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 mb-4">
              {[
                { icon: Video, label: 'Видео', desc: 'MP4, WebM' },
                { icon: Image, label: 'Изображения', desc: 'JPG, PNG, GIF, WebP' },
                { icon: FileText, label: 'Текст', desc: 'Форматированный текст' },
                { icon: Mic, label: 'Голос', desc: 'Аудиосообщения' },
                { icon: File, label: 'Файлы', desc: 'Любые форматы' },
                { icon: Hash, label: 'Медиагруппа', desc: 'Несколько файлов' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex items-start gap-2.5">
                  <Icon className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <UL items={[
              'Загрузка через drag-and-drop или выбор файла',
              'Прогресс загрузки отображается в реальном времени',
              'Файлы хранятся в Supabase Storage (бакет course-media)',
              'Медиагруппы объединяют несколько файлов в одном посте',
              'Поддержка превью для изображений и видео',
            ]} />
          </section>

          <section id="seller-settings" data-doc-section>
            <H3 id="seller-settings">Настройки курса</H3>
            <DocTable
              headers={['Настройка', 'По умолчанию', 'Описание']}
              rows={[
                ['autoplay_videos', <Badge color="gray">Выкл</Badge>, 'Автоматическое воспроизведение видео'],
                ['reverse_post_order', <Badge color="gray">Выкл</Badge>, 'Обратный порядок уроков (новые сверху)'],
                ['show_post_dates', <Badge color="green">Вкл</Badge>, 'Показывать дату создания урока'],
                ['show_lesson_numbers', <Badge color="green">Вкл</Badge>, 'Нумерация уроков'],
                ['compact_view', <Badge color="gray">Выкл</Badge>, 'Компактный режим отображения'],
                ['allow_downloads', <Badge color="gray">Выкл</Badge>, 'Разрешить скачивание медиафайлов'],
                ['watermark', '—', 'Текст водяного знака на материалах курса'],
              ]}
            />
          </section>

          <Divider />

          <section id="themes" data-doc-section>
            <H2 id="themes">Оформление курса</H2>
            <P>Каждый курс может иметь уникальное визуальное оформление, настраиваемое продавцом.</P>
          </section>

          <section id="themes-presets" data-doc-section>
            <H3 id="themes-presets">Готовые темы</H3>
            <P>5 встроенных тем на выбор:</P>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {[
                { name: 'Pure Light', desc: 'Чистый, минималистичный светлый (по умолчанию)', colors: ['#ffffff', '#f8fafc', '#0f172a'] },
                { name: 'Modern', desc: 'Бирюзовые акценты с градиентами', colors: ['#0f172a', '#134e4a', '#2dd4bf'] },
                { name: 'Vivid', desc: 'Насыщенные, яркие цвета', colors: ['#7c3aed', '#db2777', '#f97316'] },
                { name: 'Minimal', desc: 'Нейтральный серый, профессиональный', colors: ['#f9fafb', '#f3f4f6', '#111827'] },
                { name: 'Ocean', desc: 'Синие и бирюзовые оттенки', colors: ['#0c4a6e', '#0369a1', '#38bdf8'] },
              ].map(theme => (
                <div key={theme.name} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-3">
                  <div className="flex gap-1 flex-shrink-0">
                    {theme.colors.map(c => (
                      <div key={c} className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{theme.name}</div>
                    <div className="text-xs text-gray-500">{theme.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="themes-custom" data-doc-section>
            <H3 id="themes-custom">Кастомная тема</H3>
            <P>Расширенный редактор позволяет настроить каждый элемент дизайна курса.</P>
            <UL items={[
              'Цвет фона заголовка (с регулировкой прозрачности)',
              'Цвет текста и акцентов',
              'Фон ленты постов (градиент или сплошной цвет)',
              'Стиль карточек постов (стекло, заливка, обводка)',
              'Анимация градиента (плавная смена цветов)',
              'Живой предпросмотр всех изменений',
            ]} />
          </section>

          <section id="themes-emoji" data-doc-section>
            <H3 id="themes-emoji">Паттерны и фон</H3>
            <P>На фон курса можно добавить паттерн из эмодзи или символов.</P>
            <UL items={[
              'Выбор из набора готовых паттернов',
              'Регулировка размера и прозрачности',
              'Паттерн отображается поверх градиентного фона',
              'Предпросмотр в реальном времени',
            ]} />
          </section>

          <section id="themes-watermark" data-doc-section>
            <H3 id="themes-watermark">Водяной знак</H3>
            <P>Персональный водяной знак с именем студента защищает контент от несанкционированного распространения.</P>
            <UL items={[
              'Задаётся в настройках курса (поле watermark)',
              'Имя студента динамически добавляется к тексту водяного знака',
              'Отображается полупрозрачно поверх всего контента',
              'Перемещается по экрану для усложнения вырезания',
            ]} />
          </section>

          <Divider />

          <section id="telegram" data-doc-section>
            <H2 id="telegram">Telegram интеграция</H2>
            <P>Платформа использует Telegram в двух направлениях: авторизация пользователей через главный бот и импорт контента в курсы через бот курса. Импорт реализован двумя механизмами: пересылкой сообщений в личку боту и автосинхронизацией из канала.</P>
          </section>

          <section id="telegram-main-bot" data-doc-section>
            <H3 id="telegram-main-bot">Главный бот (авторизация)</H3>
            <P>Один главный бот обслуживает авторизацию всей платформы. Настраивается администратором.</P>
            <UL items={[
              'Создайте бота через @BotFather в Telegram',
              'Получите токен и username бота',
              'Введите данные в Admin → Обзор → Настройки Telegram Bot',
              'Бот используется исключительно для верификации Telegram-логинов (HMAC-SHA256)',
            ]} />
          </section>

          <section id="telegram-course-bot" data-doc-section>
            <H3 id="telegram-course-bot">Бот курса (импорт контента)</H3>
            <P>Ключевая фича платформы — импорт постов из закрытых Telegram-каналов прямо в ленту курса. Реализован двумя независимыми механизмами:</P>
            <UL items={[
              'Механизм 1 — Пересылка в личку боту: продавец открывает чат с ботом, отправляет /import, затем пересылает сообщения из любых каналов. Бот определяет forward по наличию forward_date или forward_origin и создаёт course_posts. Сессия хранится в telegram_import_sessions (telegram_user_id, course_id, is_active, message_count)',
              'Механизм 2 — Автосинхронизация: бот добавлен администратором в закрытый канал, все channel_post updates автоматически конвертируются в course_posts через webhook без участия продавца',
              'Маршрутизация в webhook: channel_post → автосинхронизация; private + forward_date/forward_origin → режим пересылки; private + text starting "/" → команды бота',
              'Дата поста при пересылке берётся из forward_date (оригинальная дата в канале), а не из date — сохраняется хронология контента',
              'Все типы медиа конвертируются: photo → image, video, voice, document, audio, animation',
              'Медиагруппы буферизируются в telegram_media_group_buffer по media_group_id, объединяются в единый пост через RPC process_media_group с задержкой 5 сек',
              'Файлы > 20 МБ недоступны через Bot API — создаётся пост с has_error=true и инструкцией загрузить вручную',
            ]} />
            <InfoCard icon={Bot} title="Логика пересылки (forward import)">
              Продавец пишет боту /import → создаётся запись в telegram_import_sessions с is_active=true.
              Все последующие сообщения с forward_date или forward_origin в этом чате попадают в курс.
              Команда /done деактивирует сессию. Команда /status показывает счётчик импортированных сообщений.
              Пересылать можно из каналов, к которым бот не имеет прямого доступа — достаточно прав самого продавца.
            </InfoCard>
          </section>

          <section id="telegram-sync" data-doc-section>
            <H3 id="telegram-sync">Edge Functions Telegram</H3>
            <P>Три edge function обеспечивают работу Telegram-интеграции:</P>
            <UL items={[
              'telegram-webhook — центральная функция: маршрутизирует updates по типу (channel_post / private forward / команды), создаёт course_posts',
              'telegram-chat-sync — ручная синхронизация истории: импорт сообщений из канала за указанный период через getHistory',
              'telegram-media — прокси для медиафайлов: получает file_path через getFile, отдаёт бинарные данные с проверкой токена доступа из media_access_tokens',
              'Все функции используют bot_token из таблицы telegram_bots, не главного бота платформы',
            ]} />
          </section>

          <Divider />

          <section id="admin" data-doc-section>
            <H2 id="admin">Панель администратора (/admin)</H2>
            <P>Доступна только пользователям с ролью super_admin. Четыре вкладки управления.</P>
          </section>

          <section id="admin-overview" data-doc-section>
            <H3 id="admin-overview">Статистика (Обзор)</H3>
            <UL items={[
              'Общее число пользователей, продавцов, курсов',
              'Количество заявок на одобрение',
              'Список продавцов ожидающих одобрения',
              'Настройка главного Telegram-бота',
            ]} />
          </section>

          <section id="admin-sellers" data-doc-section>
            <H3 id="admin-sellers">Одобрение продавцов</H3>
            <P>Все новые продавцы проходят ручную модерацию.</P>
            <UL items={[
              'Список заявок с именем, бизнесом, описанием',
              'Кнопки "Одобрить" и "Отклонить" для каждой заявки',
              'После одобрения продавец получает доступ к инструментам',
              'Уведомление в интерфейсе при появлении новых заявок',
            ]} />
          </section>

          <section id="admin-premium" data-doc-section>
            <H3 id="admin-premium">Премиум</H3>
            <P>Управление премиум-статусом для продавцов.</P>
            <UL items={[
              'Активация/деактивация премиума для выбранного продавца',
              'Варианты длительности: 1, 3, 6 месяцев, 1 год',
              'Дата истечения видна в интерфейсе',
              'Отзыв премиума в любой момент',
            ]} />
          </section>

          <section id="admin-ads" data-doc-section>
            <H3 id="admin-ads">Реклама</H3>
            <P>Управление рекламными постами платформы.</P>
            <UL items={[
              'Создание рекламного поста: заголовок, описание, изображение',
              'Привязка к продавцу (опционально)',
              'Установка позиции (порядка) отображения',
              'Включение/отключение каждого объявления',
            ]} />
          </section>

          <section id="admin-featured" data-doc-section>
            <H3 id="admin-featured">Рекомендации</H3>
            <P>Курсы в карусели на главной странице управляются отсюда.</P>
            <UL items={[
              'Добавление курса в рекомендованные: ID курса, заголовок, категория',
              'Имя преподавателя и изображение для карточки',
              'Порядковый номер (order_index) определяет позицию в карусели',
              'Включение/отключение каждого элемента',
            ]} />
          </section>

          <section id="admin-bot" data-doc-section>
            <H3 id="admin-bot">Настройка Telegram-бота</H3>
            <UL items={[
              'Поле Bot Token — токен от @BotFather',
              'Поле Bot Username — @username бота (без @)',
              'Кнопка Save сохраняет в таблицу telegram_main_bot',
              'Настройка применяется немедленно для всех новых авторизаций',
            ]} />
          </section>

          <Divider />

          <section id="protection" data-doc-section>
            <H2 id="protection">Защита контента</H2>
            <P>Многоуровневая защита применяется автоматически при открытии страницы курса студентом.</P>
          </section>

          <section id="protection-basic" data-doc-section>
            <H3 id="protection-basic">Базовая защита</H3>
            <UL items={[
              'Отключение контекстного меню (правой кнопки мыши)',
              'Запрет выделения и копирования текста',
              'Блокировка горячих клавиш копирования (Ctrl+C, Ctrl+A)',
              'Запрет перетаскивания изображений',
            ]} />
          </section>

          <section id="protection-devtools" data-doc-section>
            <H3 id="protection-devtools">Обнаружение DevTools</H3>
            <P>Платформа отслеживает попытки открыть инструменты разработчика.</P>
            <UL items={[
              'Мониторинг F12, Ctrl+Shift+I, Ctrl+Shift+J',
              'Отслеживание изменения размера окна (характерно для DevTools)',
              'При обнаружении показывается предупреждение',
              'Реализовано в contentProtection.ts через startDevToolsDetection()',
            ]} />
          </section>

          <section id="protection-watermark" data-doc-section>
            <H3 id="protection-watermark">Динамический водяной знак</H3>
            <P>Персональный водяной знак привязан к конкретному студенту.</P>
            <UL items={[
              'Текст формируется из имени студента + текста из настроек курса',
              'Отображается полупрозрачно поверх контента',
              'Позиция меняется с течением времени',
              'CSS user-select: none предотвращает выделение',
              'Включается функцией startDynamicWatermark() при загрузке курса',
            ]} />
          </section>

          <Divider />

          <section id="settings" data-doc-section>
            <H2 id="settings">Настройки интерфейса</H2>
          </section>

          <section id="settings-theme" data-doc-section>
            <H3 id="settings-theme">Тема (светлая/тёмная)</H3>
            <P>Переключатель темы доступен в шапке на всех страницах.</P>
            <UL items={[
              'Две темы: light и dark',
              'Выбор сохраняется в localStorage',
              'Применяется через CSS-класс на &lt;html&gt;: dark или light',
              'Tailwind dark: prefix управляет стилями',
            ]} />
          </section>

          <section id="settings-language" data-doc-section>
            <H3 id="settings-language">Язык интерфейса</H3>
            <P>Интерфейс доступен на русском и английском языках.</P>
            <UL items={[
              'Выбор через LanguageSelector в шапке',
              'Доступные языки: Русский (ru), English (en)',
              'Сохраняется в localStorage',
              'Переводы в src/locales/translations.ts',
              'Контекст LanguageContext предоставляет функцию t() для компонентов',
            ]} />
          </section>

          <section id="settings-scroll" data-doc-section>
            <H3 id="settings-scroll">Скролл-режим</H3>
            <P>На странице курса доступен режим snap-скролла для плавной навигации между постами.</P>
            <UL items={[
              'Управляется через ScrollPreferencesContext',
              'При включении каждый пост занимает весь экран',
              'Переключение через нижнюю навигацию на мобильном',
            ]} />
          </section>

          <Divider />

          <section id="database" data-doc-section>
            <H2 id="database">База данных</H2>
            <P>PostgreSQL через Supabase. Все таблицы имеют включённый RLS.</P>
          </section>

          <section id="database-tables" data-doc-section>
            <H3 id="database-tables">Основные таблицы</H3>
            <DocTable
              headers={['Таблица', 'Назначение', 'Ключевые поля']}
              rows={[
                ['users', 'Все пользователи платформы', 'id, telegram_id, email, oauth_provider, user_id'],
                ['user_roles', 'Роли пользователей', 'id, user_id, role (super_admin/seller/student)'],
                ['sellers', 'Профиль продавца', 'id, user_id, business_name, is_approved, premium_active'],
                ['courses', 'Курсы', 'id, seller_id, title, is_published, theme_config, watermark'],
                ['course_enrollments', 'Зачисление студентов', 'id, course_id, student_id, expires_at'],
                ['course_posts', 'Уроки/посты курса', 'id, course_id, title, description, order_index'],
                ['course_post_media', 'Медиа в уроках', 'id, post_id, media_type, media_url, order_index'],
                ['student_pinned_posts', 'Закреплённые посты', 'id, student_id, post_id, pinned_at'],
                ['telegram_bots', 'Боты курсов', 'id, seller_id, course_id, bot_token, bot_username'],
                ['telegram_main_bot', 'Главный бот авторизации', 'id, bot_token, bot_username, is_active'],
                ['ad_posts', 'Рекламные посты', 'id, title, description, image_url, position, is_active'],
                ['featured_courses', 'Рекомендованные курсы', 'id, course_id, title, category, order_index'],
                ['media_access_tokens', 'Временные токены медиа', 'id, user_id, course_id, token, expires_at'],
                ['pkce_sessions', 'OAuth PKCE сессии', 'id, code_challenge, user_id, expires_at'],
              ]}
            />
          </section>

          <section id="database-rls" data-doc-section>
            <H3 id="database-rls">Row Level Security (RLS)</H3>
            <P>Все таблицы защищены политиками RLS. Данные доступны только тем, кому они принадлежат.</P>
            <UL items={[
              'Студенты видят только свои зачисления и курсы',
              'Продавцы управляют только своими курсами',
              'Медиа токены проверяют зачисление на курс',
              'Администратор имеет доступ ко всем данным через service_role',
              'Неавторизованные пользователи не получают никаких данных',
            ]} />
            <InfoCard icon={Shield} title="Принцип минимальных прав">
              Каждая RLS политика проверяет auth.uid() и владение данными.
              Политики разделены по типам операций: SELECT, INSERT, UPDATE, DELETE.
            </InfoCard>
          </section>

          <Divider />

          <section id="functions" data-doc-section>
            <H2 id="functions">Edge Functions</H2>
            <P>10 Supabase Edge Functions (Deno runtime) обслуживают серверную логику.</P>
          </section>

          <section id="functions-list" data-doc-section>
            <H3 id="functions-list">Список функций</H3>
            <DocTable
              headers={['Функция', 'Метод', 'Назначение']}
              rows={[
                [<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">telegram-auth</code>, <Badge color="blue">POST</Badge>, 'Верификация Telegram-логина, создание/обновление пользователя'],
                [<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">oauth-login</code>, <Badge color="blue">POST</Badge>, 'Обработка OAuth callback (VK/Яндекс/Google)'],
                [<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">oauth-create-session</code>, <Badge color="blue">POST</Badge>, 'Создание Supabase-сессии из OAuth user_id'],
                [<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">generate-media-token</code>, <Badge color="green">GET</Badge>, 'Временный токен доступа к медиафайлу'],
                [<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">telegram-webhook</code>, <Badge color="blue">POST</Badge>, 'Обработка входящих сообщений Telegram'],
                [<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">telegram-chat-sync</code>, <Badge color="blue">POST</Badge>, 'Синхронизация зачисления с Telegram-каналами'],
                [<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">telegram-media</code>, <Badge color="green">GET</Badge>, 'Прокси медиафайлов из Telegram'],
                [<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">sync-user-metadata</code>, '—', 'Синхронизация метаданных из Auth в public.users'],
                [<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">update-user-roles</code>, <Badge color="blue">POST</Badge>, 'Обновление ролей в JWT из таблицы user_roles'],
                [<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">generate-admin-link</code>, <Badge color="blue">POST</Badge>, 'Генерация специальных ссылок для администратора'],
              ]}
            />
            <InfoCard icon={Zap} title="CORS">
              Все функции возвращают заголовки CORS и обрабатывают preflight OPTIONS-запросы.
              Разрешены заголовки: Content-Type, Authorization, X-Client-Info, Apikey.
            </InfoCard>
          </section>

          <div className="h-20" />
        </main>
      </div>
    </div>
  );
}
