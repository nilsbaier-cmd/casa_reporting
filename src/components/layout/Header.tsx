'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { SwissCoat } from '@/components/ui/swiss-coat';
import { LanguagePicker } from '@/components/ui/LanguagePicker';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Plane,
  FileWarning,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  labelKey: string;
  icon: React.ReactNode;
  href: string;
}

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isAdmin?: boolean;
  isViewer?: boolean;
}

export function Header({ activeTab = 'dashboard', onTabChange, isAdmin = false, isViewer = false }: HeaderProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('header');

  // Different nav items for admin vs viewer
  const adminNavItems: NavItem[] = [
    { labelKey: 'nav.dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: 'dashboard' },
    { labelKey: 'nav.pax', icon: <Plane className="w-4 h-4" />, href: 'pax' },
    { labelKey: 'nav.inad', icon: <FileWarning className="w-4 h-4" />, href: 'inad' },
    { labelKey: 'nav.trends', icon: <BarChart3 className="w-4 h-4" />, href: 'trends' },
    { labelKey: 'nav.docs', icon: <FileText className="w-4 h-4" />, href: 'docs' },
  ];

  const viewerNavItems: NavItem[] = [
    { labelKey: 'nav.dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: 'dashboard' },
    { labelKey: 'nav.pax', icon: <Plane className="w-4 h-4" />, href: 'pax' },
    { labelKey: 'nav.inad', icon: <FileWarning className="w-4 h-4" />, href: 'inad' },
    { labelKey: 'nav.trends', icon: <BarChart3 className="w-4 h-4" />, href: 'trends' },
    { labelKey: 'nav.docs', icon: <FileText className="w-4 h-4" />, href: 'docs' },
  ];

  const navItems = isViewer ? viewerNavItems : adminNavItems;

  const handleNavClick = (href: string) => {
    onTabChange?.(href);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    if (isViewer) {
      router.push('/viewer/login');
    } else {
      router.push('/admin/login');
    }
  };

  // Accent color based on mode
  const accentColor = isViewer ? 'bg-blue-600' : 'bg-red-600';
  const accentTextColor = isViewer ? 'text-blue-600' : 'text-red-600';
  const accentBgHover = isViewer ? 'bg-blue-50' : 'bg-red-50';

  return (
    <header className="sticky top-0 z-50">
      {/* Federal identity bar - Black with Swiss precision */}
      <div className={isViewer ? 'bg-neutral-800' : 'bg-neutral-900'}>
        <div className="sem-container">
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center gap-4">
              <SwissCoat size="sm" />
              <span className="hidden sm:inline text-sm text-neutral-300">
                {t('sem')}
              </span>
              <span className="sm:hidden text-white text-sm font-medium">SEM</span>
              {/* Mode indicator */}
              {isViewer && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded">
                  Viewer
                </span>
              )}
              {isAdmin && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <LanguagePicker />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-300 hover:text-white transition-colors"
                aria-label={t('logout')}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accent line */}
      <div className={cn('h-1', accentColor)} aria-hidden="true" />

      {/* Main navigation bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="sem-container">
          <div className="flex items-center justify-between h-16">
            {/* Title block */}
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-neutral-900">
                  {t('title')}
                </h1>
                <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Desktop Navigation - Underline style */}
            <nav
              className="hidden lg:flex items-center h-full"
              role="navigation"
              aria-label={t('mainNav')}
            >
              {navItems.map((item, index) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'relative flex items-center gap-2 px-5 h-16 text-sm font-medium transition-colors',
                    'focus:outline-none focus-visible:bg-neutral-100',
                    'animate-sem-fade-in opacity-0',
                    activeTab === item.href
                      ? accentTextColor
                      : 'text-neutral-600 hover:text-neutral-900'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  aria-current={activeTab === item.href ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{t(item.labelKey)}</span>
                  {/* Active indicator - Bold underline */}
                  {activeTab === item.href && (
                    <span
                      className={cn('absolute bottom-0 left-0 right-0 h-0.5', accentColor)}
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 text-neutral-700 hover:bg-neutral-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? t('menuClose') : t('menuOpen')}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Slide down */}
      <div
        className={cn(
          'lg:hidden bg-white border-b border-neutral-200 overflow-hidden transition-all duration-200',
          mobileMenuOpen ? 'max-h-80' : 'max-h-0'
        )}
      >
        <nav className="sem-container py-3" role="navigation" aria-label={t('mobileNav')}>
          <div className="flex flex-col">
            {navItems.map((item, index) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left',
                  'border-l-2',
                  activeTab === item.href
                    ? cn(accentTextColor, accentBgHover, isViewer ? 'border-blue-600' : 'border-red-600')
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border-transparent'
                )}
                style={{ animationDelay: `${index * 30}ms` }}
                aria-current={activeTab === item.href ? 'page' : undefined}
              >
                {item.icon}
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
