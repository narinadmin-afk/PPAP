import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  Plus,
  ShieldCheck,
  ChevronDown,
  Globe,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Notification, SupportedLanguage, UserRole } from '../../types/ppap';

interface NavbarProps {
  onOpenNewProject: () => void;
  onOpenAIGenerator: () => void;
  onNavigate: (view: 'dashboard' | 'projects' | 'completeness' | 'audit' | 'files') => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewProject,
  onOpenAIGenerator,
  onNavigate,
  isSidebarCollapsed = false,
  onToggleSidebar
}) => {
  const { currentUser, allUsers, switchUser, switchRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    api.getNotifications()
      .then(res => setNotifications(res))
      .catch(err => console.warn('Could not load notifications:', err));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    loadNotifications();
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await api.markNotificationRead(notif.id);
      loadNotifications();
    }
  };

  const roles: UserRole[] = [
    'Administrator',
    'Quality Manager',
    'Quality Engineer',
    'Production Engineer',
    'R&D Engineer',
    'Inspector',
    'Viewer'
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Sidebar Toggle + Brand */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
              title={isSidebarCollapsed ? "Expand Sidebar (ขยายแถบเมนู)" : "Collapse Sidebar (ย่อแถบเมนูเพื่อขยายเต็มจอ)"}
              aria-label="Toggle Sidebar"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-blue-400" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-base sm:text-lg text-white whitespace-nowrap">PPAP Manager</span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                  IATF 16949
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                AI-Powered Automotive Quality Assurance
              </p>
            </div>
          </div>
        </div>

        {/* Center / Quick Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={onOpenAIGenerator}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-medium shadow-sm transition-all duration-150"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{t.aiGenerator}</span>
          </button>

          <button
            onClick={onOpenNewProject}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{t.newProject}</span>
          </button>
        </div>

        {/* Right tools: Fullscreen, Language, Notifications, Role Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition hidden sm:flex items-center space-x-1.5"
            title={isFullscreen ? "Exit Fullscreen (ออกจากโหมดเต็มจอ)" : "Fullscreen Mode (แสดงผลเต็มหน้าจอ)"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-300" />
            )}
            <span className="hidden xl:inline text-[11px] font-medium">
              {isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}
            </span>
          </button>
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 transition"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="font-semibold uppercase">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs">
                <button
                  onClick={() => { setLanguage('th'); setShowLangMenu(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700 ${language === 'th' ? 'text-blue-400 font-semibold' : 'text-slate-200'}`}
                >
                  <span>🇹🇭 ภาษาไทย</span>
                  {language === 'th' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700 ${language === 'en' ? 'text-blue-400 font-semibold' : 'text-slate-200'}`}
                >
                  <span>🇺🇸 English</span>
                  {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setLanguage('zh'); setShowLangMenu(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700 ${language === 'zh' ? 'text-blue-400 font-semibold' : 'text-slate-200'}`}
                >
                  <span>🇨🇳 中文</span>
                  {language === 'zh' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
                setShowLangMenu(false);
              }}
              className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title={t.notifications}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-white">{t.notifications}</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-rose-500/20 text-rose-400 rounded-full font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 text-xs cursor-pointer hover:bg-slate-700/50 transition flex space-x-3 ${!notif.read ? 'bg-slate-750/70' : 'opacity-80'}`}
                      >
                        <div className="mt-0.5">
                          {notif.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {notif.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{notif.title}</span>
                            {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                          </div>
                          <p className="text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1.5 block">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setShowLangMenu(false);
              }}
              className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition"
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-blue-400"
              />
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-blue-400 font-medium truncate max-w-[130px]">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-700">
                  <div className="font-semibold text-sm text-white">{currentUser.name}</div>
                  <div className="text-slate-400 text-xs">{currentUser.email}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{currentUser.department}</div>
                </div>

                {/* Switch Role Fast Bar */}
                <div className="px-4 py-2 border-b border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {t.roleSwitcher}
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    {roles.map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setShowUserMenu(false);
                        }}
                        className={`text-left px-2.5 py-1.5 rounded flex items-center justify-between text-xs transition ${
                          currentUser.role === r
                            ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40'
                            : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>{r}</span>
                        {currentUser.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switch User List */}
                <div className="px-4 py-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Switch Personnel
                  </span>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {allUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded flex items-center space-x-2 text-xs transition ${
                          currentUser.id === u.id ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:bg-slate-700/60'
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{u.name} ({u.role})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
