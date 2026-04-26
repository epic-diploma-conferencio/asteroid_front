import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthModal, type AuthMode } from '@/widgets/AuthModal';

import { HeroScreen } from './HeroScreen';
import { HowItWorksScreen } from './HowItWorksScreen';
import './welcome-page.scss';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('register');

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <>
      <div className="welcome-page">
        <HeroScreen
          onCreateAccount={() => openAuth('register')}
          onUpload={() => void navigate('/load')}
        />
        <HowItWorksScreen />
      </div>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};
