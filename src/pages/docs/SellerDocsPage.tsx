import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Plus, Users, Send, Palette, Settings,
  ChevronRight, Eye, Trash2, Edit, GraduationCap, CheckCircle,
  AlertCircle, Info, Bot, Image, Video, Mic, File, Hash,
  Star, Lock, Globe, Menu, X
} from 'lucide-react';
import KeyKursLogo from '../../components/KeyKursLogo';
import ThemeToggle from '../../components/ThemeToggle';

interface Step {
  num: number;
  title: string;
  desc: string;
}

interface GuideSection {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
}

const SECTIONS: GuideSection[] = [
  { id: 'getting-started', icon: CheckCircle, title: 'Начало работы', color: 'text-teal-600' },
  { id: 'create-course', icon: Plus, title: 'Создание курса', color: 'text-blue-600' },
  { id: 'manage-content', icon: BookOpen, title: 'Управление контентом', color: 'text-blue-600' },
  { id: 'manage-students', icon: Users, title: 'Управление студентами', color: 'text-green-600' },
  { id: 'telegram-bot', icon: Bot, title: 'Импорт из Telegram', color: 'text-sky-600' },
  { id: 'course-design', icon: Palette, title: 'Оформление курса', color: 'text-amber-600' },
  { id: 'course-settings', icon: Settings, title: 'Настройки курса', color: 'text-gray-600' },
  { id: 'content-protection', icon: Lock, title: 'Защита контента', color: 'text-red-600' },
  { id: 'publish', icon: Globe, title: 'Публикация', color: 'text-teal-600' },
];

function SideNav({ activeId, onSelect, open, onClose }: {
  activeId: string;
  onSelect: (id: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  const content = (
    <nav className="space-y-0.5">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-3">Разделы</p>
      {SECTIONS.map(s => {
        const Icon = s.icon;
        const isActive = activeId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => { onSelect(s.id); onClose(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
              isActive
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : s.color}`} />
            <span className="text-left">{s.title}</span>
            {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 overflow-y-auto p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-900 dark:text-white">Навигация</span>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
      <aside className="hidden md:block w-60 lg:w-64 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 border-r border-gray-200 dark:border-gray-800">
        {content}
      </aside>
    </>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} data-doc-section className="scroll-mt-20 mb-12">
      {children}
    </section>
  );
}

function SectionTitle({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

function StepList({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-3">
      {steps.map(step => (
        <div key={step.num} className="flex gap-4">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mt-0.5">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300">{step.num}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{step.title}</p>
            {step.desc && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Tip({ type, children }: { type: 'info' | 'warning' | 'success'; children: React.ReactNode }) {
  const config = {
    info: { icon: Info, classes: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200' },
    warning: { icon: AlertCircle, classes: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200' },
    success: { icon: CheckCircle, classes: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200' },
  };
  const { icon: Icon, classes } = config[type];
  return (
    <div className={`flex items-start gap-3 border rounded-xl p-4 ${classes}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ActionRow({ icon: Icon, label, desc, color }: { icon: React.ElementType; label: string; desc: string; color: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default function SellerDocsPage() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('getting-started');
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/seller/dashboard')} className="flex items-center gap-2">
              <KeyKursLogo size={28} color="#0d9488" />
              <span className="font-bold text-gray-900 dark:text-white hidden sm:inline text-sm">KeyKurs</span>
            </button>
            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">/</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">Руководство продавца</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Дашборд</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto flex">
        <SideNav activeId={activeId} onSelect={scrollTo} open={menuOpen} onClose={() => setMenuOpen(false)} />

        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 max-w-3xl">

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Руководство продавца</h1>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
              Всё, что нужно знать для создания и управления курсами на платформе KeyKurs.
            </p>
          </div>

          <Section id="getting-started">
            <SectionTitle icon={CheckCircle} title="Начало работы" color="text-teal-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              После регистрации ваша заявка отправляется на рассмотрение администратору. Как только она будет одобрена, вам откроется полный доступ к инструментам продавца.
            </p>
            <StepList steps={[
              { num: 1, title: 'Войдите в систему', desc: 'Используйте Telegram Login или OAuth (VK, Яндекс, Google) на странице входа.' },
              { num: 2, title: 'Выберите роль "Продавец"', desc: 'На странице выбора роли нажмите "Стать продавцом" и заполните форму регистрации.' },
              { num: 3, title: 'Заполните данные', desc: 'Укажите название вашего бизнеса и краткое описание деятельности.' },
              { num: 4, title: 'Дождитесь одобрения', desc: 'Администратор рассмотрит заявку. Вы увидите статус на странице ожидания.' },
              { num: 5, title: 'Начните работу', desc: 'После одобрения вы попадёте в дашборд продавца и сможете создавать курсы.' },
            ]} />
            <div className="mt-5">
              <Tip type="info">
                Если у вас уже есть роль студента — её можно совмещать. Переключение между режимами происходит через кнопку в шапке дашборда.
              </Tip>
            </div>
          </Section>

          <Section id="create-course">
            <SectionTitle icon={Plus} title="Создание курса" color="text-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Новый курс создаётся за несколько секунд. После создания вы сразу попадаете в редактор.
            </p>
            <StepList steps={[
              { num: 1, title: 'Нажмите "Создать курс"', desc: 'Кнопка находится в правом верхнем углу дашборда.' },
              { num: 2, title: 'Введите название', desc: 'Название курса — это первое, что увидят студенты.' },
              { num: 3, title: 'Добавьте описание', desc: 'Кратко опишите, чему посвящён курс.' },
              { num: 4, title: 'Нажмите "Сохранить"', desc: 'Курс создаётся в статусе "Черновик". Студенты его не видят до публикации.' },
            ]} />
            <div className="mt-5">
              <Tip type="success">
                Курс в статусе черновика виден только вам. Вы можете добавить весь контент и настроить оформление перед тем, как открыть доступ студентам.
              </Tip>
            </div>
          </Section>

          <Section id="manage-content">
            <SectionTitle icon={BookOpen} title="Управление контентом" color="text-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Перейдите в редактор курса нажав кнопку редактирования (карандаш) на карточке курса. Вкладка "Контент" — основное рабочее место.
            </p>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Типы медиа в уроках</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {[
                { icon: Video, label: 'Видео', desc: 'MP4, WebM — основной формат урока' },
                { icon: Image, label: 'Изображения', desc: 'JPG, PNG, GIF, WebP' },
                { icon: Mic, label: 'Голос', desc: 'Аудиосообщения и подкасты' },
                { icon: File, label: 'Файлы', desc: 'PDF, документы, архивы' },
                { icon: Hash, label: 'Медиагруппа', desc: 'Несколько файлов в одном уроке' },
                { icon: BookOpen, label: 'Текст', desc: 'Форматированные текстовые блоки' },
              ].map(({ icon: Icon, label, desc }) => (
                <Card key={label} className="flex items-start gap-2.5 p-3">
                  <Icon className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">{label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                  </div>
                </Card>
              ))}
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Добавление урока</h3>
            <StepList steps={[
              { num: 1, title: 'Нажмите "Добавить урок"', desc: 'Кнопка внизу списка уроков или вверху страницы.' },
              { num: 2, title: 'Введите название и описание', desc: 'Описание видно студентам в ленте курса.' },
              { num: 3, title: 'Загрузите медиафайл', desc: 'Перетащите файл или нажмите на область загрузки. Прогресс отображается в реальном времени.' },
              { num: 4, title: 'Сохраните урок', desc: 'Урок появится в ленте курса сразу после сохранения.' },
            ]} />
            <div className="mt-4 space-y-3">
              <Tip type="info">
                Медиагруппа позволяет объединить несколько изображений или файлов в один урок — студент увидит их как галерею.
              </Tip>
              <Tip type="warning">
                Максимальный размер загружаемого файла ограничен хранилищем. Для больших видео рекомендуем использовать сжатие перед загрузкой.
              </Tip>
            </div>
          </Section>

          <Section id="manage-students">
            <SectionTitle icon={Users} title="Управление студентами" color="text-green-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Студенты добавляются вручную по их уникальному ID. Каждый студент видит свой ID в личном кабинете.
            </p>
            <StepList steps={[
              { num: 1, title: 'Откройте управление студентами', desc: 'Нажмите иконку студентов на карточке курса или кнопку в меню.' },
              { num: 2, title: 'Введите User ID студента', desc: 'Студент должен сообщить вам свой ID из кабинета студента.' },
              { num: 3, title: 'Укажите дату окончания (опционально)', desc: 'Если доступ временный — установите дату истечения. Без даты доступ бессрочный.' },
              { num: 4, title: 'Нажмите "Добавить"', desc: 'Студент мгновенно получает доступ к курсу.' },
            ]} />

            <div className="mt-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Действия со студентами</h3>
              <Card>
                <ActionRow icon={Eye} label="Просмотр списка" desc="Все зачисленные студенты с датами добавления и истечения доступа" color="text-teal-600" />
                <ActionRow icon={Edit} label="Изменение даты" desc="Продлить или ограничить срок доступа к курсу" color="text-blue-600" />
                <ActionRow icon={Trash2} label="Отзыв доступа" desc="Удалить студента из курса — он потеряет возможность просматривать материалы" color="text-red-500" />
              </Card>
            </div>

            <div className="mt-4">
              <Tip type="info">
                User ID студента отображается в его кабинете в разделе "Мои курсы". Это уникальная строка вида <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">abc-123...</code>
              </Tip>
            </div>
          </Section>

          <Section id="telegram-bot">
            <SectionTitle icon={Bot} title="Импорт из Telegram" color="text-sky-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Каждый курс подключается к своему Telegram-боту. Через него можно как автоматически получать новые посты из канала, так и вручную импортировать историю — пересылая старые сообщения прямо в чат с ботом.
            </p>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Как это работает</h3>
            <div className="space-y-3 mb-5">
              {[
                { icon: Bot, label: 'Отслеживание новых постов', desc: 'Добавьте бота администратором в ваш закрытый канал — и каждое новое сообщение будет автоматически появляться в ленте курса. Подходит для ongoing-рассылки: опубликовали в канале — студенты сразу увидели в курсе.' },
                { icon: Send, label: 'Импорт истории через пересылку', desc: 'Наша главная фишка. Откройте личку с ботом, нажмите "Начать импорт" и пересылайте старые сообщения из канала. Бот принимает их и создаёт уроки в курсе. Можно импортировать историю из любого канала, где вы состоите — даже если бот там не добавлен.' },
                { icon: Image, label: 'Поддержка всех типов медиа', desc: 'Текст, фото, видео, голосовые сообщения, документы, анимации, GIF. Альбомы из нескольких файлов автоматически собираются в единый урок.' },
              ].map(({ icon: Icon, label, desc }) => (
                <Card key={label} className="flex items-start gap-3 p-4">
                  <Icon className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </Card>
              ))}
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Поддерживаемые типы медиа</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
              {[
                { icon: Image, label: 'Фото', desc: 'JPG, PNG, WebP', color: 'text-blue-500' },
                { icon: Video, label: 'Видео', desc: 'MP4 и другие форматы', color: 'text-purple-500' },
                { icon: Mic, label: 'Голосовые', desc: 'Голосовые сообщения', color: 'text-green-500' },
                { icon: File, label: 'Документы', desc: 'PDF, ZIP, любые файлы', color: 'text-orange-500' },
                { icon: Hash, label: 'Альбомы', desc: 'Несколько файлов в уроке', color: 'text-sky-500' },
                { icon: BookOpen, label: 'Текст', desc: 'Сообщения с форматированием', color: 'text-teal-500' },
              ].map(({ icon: Icon, label, desc, color }) => (
                <Card key={label} className="flex items-start gap-2.5 p-3">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                  <div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">{label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                  </div>
                </Card>
              ))}
            </div>
            <Tip type="warning">
              <strong>Ограничение Telegram: файлы до 20 МБ.</strong> Telegram Bot API позволяет передавать файлы размером не более 20 МБ. Файлы крупнее этого лимита не будут импортированы — бот пропустит их и сообщит об этом. Для передачи больших видео сжимайте их перед отправкой в канал или загружайте напрямую через редактор курса.
            </Tip>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Настройка</h3>
            <StepList steps={[
              { num: 1, title: 'Создайте бота через @BotFather', desc: 'Отправьте команду /newbot, задайте имя и username. Сохраните выданный токен вида 123456789:AAH...' },
              { num: 2, title: 'Узнайте ID вашего канала', desc: 'Перешлите любое сообщение из канала боту @userinfobot — он ответит данными, где "Chat ID" — это и есть ID канала. Формат: -1001234567890 (начинается с -100).' },
              { num: 3, title: 'Подключите бота к курсу', desc: 'В дашборде нажмите иконку Telegram на карточке курса, введите токен, @username бота и ID канала, сохраните.' },
              { num: 4, title: 'Добавьте бота в канал', desc: 'Откройте настройки вашего закрытого канала → Администраторы → добавьте @username бота. После этого все новые посты будут автоматически попадать в курс.' },
            ]} />

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 mt-5 text-sm">Как импортировать историю через пересылку</h3>
            <StepList steps={[
              { num: 1, title: 'Откройте личку с ботом', desc: 'Найдите @username бота в Telegram или перейдите по ссылке из дашборда. Напишите /start — бот покажет меню.' },
              { num: 2, title: 'Нажмите "Начать импорт"', desc: 'Бот активирует сессию и подтвердит, в какой курс идёт импорт.' },
              { num: 3, title: 'Пересылайте сообщения из канала', desc: 'Откройте нужный канал в Telegram, выберите сообщения и пересылайте их в чат с ботом. Можно по одному или сразу пачками.' },
              { num: 4, title: 'Нажмите "Завершить импорт"', desc: 'Бот покажет итог — сколько сообщений импортировано. Все они уже доступны студентам в ленте курса.' },
            ]} />

            <div className="mt-5 space-y-3">
              <Tip type="success">
                Импорт через пересылку работает с любыми каналами, где вы состоите как участник или администратор — боту не нужен туда доступ. Это позволяет переносить весь накопленный контент из старых каналов буквально за несколько минут.
              </Tip>
              <Tip type="warning">
                Токен бота — секретный ключ. Не передавайте его третьим лицам. Если токен скомпрометирован — сгенерируйте новый через @BotFather командой /revoke и обновите в настройках курса.
              </Tip>
            </div>
          </Section>

          <Section id="course-design">
            <SectionTitle icon={Palette} title="Оформление курса" color="text-amber-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Вкладка "Дизайн" в редакторе курса. Каждый курс имеет уникальное визуальное оформление.
            </p>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Готовые темы</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {[
                { name: 'Pure Light', desc: 'Чистый, минималистичный светлый дизайн', colors: ['#ffffff', '#f8fafc', '#0f172a'] },
                { name: 'Modern', desc: 'Тёмный фон с бирюзовыми акцентами', colors: ['#0f172a', '#134e4a', '#2dd4bf'] },
                { name: 'Vivid', desc: 'Яркие насыщенные цвета', colors: ['#7c3aed', '#db2777', '#f97316'] },
                { name: 'Minimal', desc: 'Нейтральный серый, профессиональный стиль', colors: ['#f9fafb', '#f3f4f6', '#111827'] },
                { name: 'Ocean', desc: 'Синие и морские оттенки', colors: ['#0c4a6e', '#0369a1', '#38bdf8'] },
              ].map(theme => (
                <Card key={theme.name} className="flex items-center gap-3 p-3">
                  <div className="flex gap-1 flex-shrink-0">
                    {theme.colors.map(c => (
                      <div key={c} className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{theme.name}</div>
                    <div className="text-xs text-gray-500">{theme.desc}</div>
                  </div>
                </Card>
              ))}
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Кастомная тема</h3>
            <BulletList items={[
              'Цвет и прозрачность фона шапки курса',
              'Цвет текста и акцентных элементов',
              'Фон ленты постов (градиент или сплошной цвет)',
              'Стиль карточек: стекло, заливка, обводка',
              'Фоновый паттерн из символов или эмодзи',
              'Живой предпросмотр всех изменений перед сохранением',
            ]} />
            <div className="mt-4">
              <Tip type="info">
                Обложку курса (thumbnail) можно загрузить в настройках — она отображается на карточке курса в дашборде студента.
              </Tip>
            </div>
          </Section>

          <Section id="course-settings">
            <SectionTitle icon={Settings} title="Настройки курса" color="text-gray-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Вкладка "Настройки" в редакторе курса. Управляйте поведением и отображением курса.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Автовоспроизведение видео', desc: 'Видеоуроки начинают играть автоматически при прокрутке к ним.' },
                { label: 'Обратный порядок уроков', desc: 'Новые уроки отображаются в начале ленты (удобно для ведения в формате канала).' },
                { label: 'Показывать даты уроков', desc: 'Под каждым уроком видна дата его добавления.' },
                { label: 'Нумерация уроков', desc: 'Порядковый номер отображается рядом с заголовком урока.' },
                { label: 'Компактный вид', desc: 'Уменьшенный размер карточек уроков для более плотной ленты.' },
                { label: 'Разрешить скачивание', desc: 'Студенты смогут скачивать медиафайлы курса.' },
              ].map(item => (
                <Card key={item.label} className="flex items-start gap-3 p-4">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section id="content-protection">
            <SectionTitle icon={Lock} title="Защита контента" color="text-red-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Платформа автоматически защищает материалы курса от копирования и несанкционированного распространения.
            </p>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Автоматическая защита</h3>
            <BulletList items={[
              'Запрет правого меню и перетаскивания изображений',
              'Блокировка выделения и копирования текста',
              'Обнаружение попыток открыть инструменты разработчика',
              'Запрет скачивания (если отключено в настройках)',
            ]} />

            <div className="mt-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Водяной знак</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Настройте водяной знак в разделе "Настройки" курса. Он будет автоматически персонализирован для каждого студента.
              </p>
              <Card className="flex items-start gap-3 p-4">
                <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Пример</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Если задать текст <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">KeyKurs</code>, студент с именем "Алексей" увидит на экране: <em className="text-gray-700 dark:text-gray-300">"Алексей · KeyKurs"</em>
                  </p>
                </div>
              </Card>
            </div>

            <div className="mt-4">
              <Tip type="success">
                Водяной знак отображается полупрозрачно поверх контента и периодически меняет положение, что существенно затрудняет его вырезание.
              </Tip>
            </div>
          </Section>

          <Section id="publish">
            <SectionTitle icon={Globe} title="Публикация" color="text-teal-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Когда курс готов к обучению, его нужно опубликовать. До публикации курс виден только вам.
            </p>
            <StepList steps={[
              { num: 1, title: 'Откройте редактор курса', desc: 'Нажмите иконку карандаша на карточке курса.' },
              { num: 2, title: 'Перейдите на вкладку "Настройки"', desc: '' },
              { num: 3, title: 'Включите переключатель "Опубликован"', desc: 'Статус курса сменится с "Черновик" на "Опубликован".' },
              { num: 4, title: 'Добавьте студентов', desc: 'Даже после публикации студенты получают доступ только после явного зачисления.' },
            ]} />

            <div className="mt-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Действия из дашборда</h3>
              <Card>
                <ActionRow icon={Edit} label="Редактировать" desc="Открыть полный редактор курса с вкладками Контент, Дизайн, Настройки" color="text-teal-600" />
                <ActionRow icon={Eye} label="Посмотреть как студент" desc="Увидеть курс глазами студента — проверить внешний вид перед публикацией" color="text-teal-600" />
                <ActionRow icon={Users} label="Студенты" desc="Перейти к управлению списком зачисленных студентов" color="text-green-600" />
                <ActionRow icon={Send} label="Telegram-бот" desc="Настроить бота для уведомлений" color="text-sky-600" />
                <ActionRow icon={Trash2} label="Удалить курс" desc="Безвозвратно удалить курс и все его материалы" color="text-red-500" />
              </Card>
            </div>

            <div className="mt-5">
              <Tip type="warning">
                Удаление курса необратимо. Все материалы, зачисления и настройки будут потеряны. Перед удалением убедитесь, что сохранили нужные файлы.
              </Tip>
            </div>

            <div className="mt-6 p-5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="font-semibold text-teal-800 dark:text-teal-200">Готовы начать?</span>
              </div>
              <p className="text-sm text-teal-700 dark:text-teal-300 mb-3">
                Вернитесь в дашборд и создайте свой первый курс.
              </p>
              <button
                onClick={() => navigate('/seller/dashboard')}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                Перейти в дашборд
              </button>
            </div>
          </Section>

          <div className="h-16" />
        </main>
      </div>
    </div>
  );
}
