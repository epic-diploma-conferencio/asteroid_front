import { ChevronDown, Moon, SunMedium } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '@/features/authorization';
import { useTheme } from '@/shared/utils/theme';
import { AuthModal, type AuthMode } from '@/widgets/AuthModal';
import './header.scss';

import { AccountDropdown } from './AccountDropdown';

const uploadStatusLabel = '0/1 загружено';

export const Header = () => {
  const isAuth = useAuthStore((state) => state.token !== null);
  const { resolvedTheme, setMode } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';

  const [authModalIsOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('register');

  const [accountDropdownIsOpen, setAccountDropdownOpen] = useState(false);

  const handleThemeToggle = () => {
    setMode(isDarkTheme ? 'light' : 'dark');
  };

  return (
    <>
      <header className="Header">
        <div className="Header__left">
          <Link to="/" className="Header__brand" aria-label="ASTeroid">
            <span className="Header__logo">ASTeroid</span>
          </Link>

          {!isAuth ? <span className="Header__status">{uploadStatusLabel}</span> : null}
        </div>

        <div className="Header__right">
          <button
            type="button"
            className="Header__theme-switch"
            onClick={handleThemeToggle}
            aria-label={isDarkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'}
            title={isDarkTheme ? 'Светлая тема' : 'Тёмная тема'}
          >
            {isDarkTheme ? <SunMedium size={24} /> : <Moon size={24} />}
          </button>

          <button type="button" className="Header__menu-link Header__menu-link--help">
            <ChevronDown size={16} strokeWidth={2.4} />
            <span>Помощь</span>
          </button>

          {isAuth ? (
            <AccountDropdown open={accountDropdownIsOpen} onOpenChange={setAccountDropdownOpen} />
          ) : (
            <div className="Header__auth-actions">
              <button
                type="button"
                className="Header__action Header__action--ghost"
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
              >
                Войти
              </button>
              <button
                type="button"
                className="Header__action Header__action--primary"
                onClick={() => {
                  setAuthModalMode('register');
                  setAuthModalOpen(true);
                }}
              >
                Регистрация
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        open={authModalIsOpen}
        onOpenChange={setAuthModalOpen}
        mode={authModalMode}
        onModeChange={setAuthModalMode}
      />
    </>
  );
};
