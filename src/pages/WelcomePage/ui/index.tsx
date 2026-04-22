import { useState } from 'react';

import { AuthModal, type AuthMode } from '@/widgets/AuthModal';

import { HeroScreen } from './HeroScreen';
import { HowItWorksScreen } from './HowItWorksScreen';
import './welcome-page.scss';

export const WelcomePage = () => {
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
          onUpload={() => {
            // TODO: open file upload flow
          }}
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
