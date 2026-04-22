import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState, type Dispatch, type SetStateAction } from 'react';

import { LoginForm } from '@/features/authorization/ui/LoginForm';
import { RegForm } from '@/features/authorization/ui/RegForm';
import { Modal } from '@/shared/ui/Modal';
import { ModalSkeleton } from '@/shared/ui/ModalSkeleton';
import { breakpoints, useMediaQuery } from '@/shared/utils/use-media-query';
import './auth-modal.scss';

interface AuthModalProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  mode: AuthMode;
  onModeChange: Dispatch<SetStateAction<AuthMode>>;
}

export type AuthMode = 'login' | 'register';

export const AuthModal = ({ open, onOpenChange, mode, onModeChange }: AuthModalProps) => {
  const isDesktop = useMediaQuery(breakpoints.xs);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const title = mode === 'register' ? 'Регистрация' : 'Вход в аккаунт';

  const switchMode = (newMode: AuthMode) => {
    setIsLoading(true);
    setTimeout(() => {
      onModeChange(newMode);
      setIsLoading(false);
      setTimeout(() => containerRef.current?.focus(), 0);
    }, 250);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={`Форма ${mode === 'register' ? 'регистрации' : 'авторизации'}`}
      showCloseButton={!isDesktop}
      className="dialog--auth"
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            className="auth-modal auth-modal--loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ModalSkeleton />
          </motion.div>
        ) : (
          <motion.div
            ref={containerRef}
            key={mode}
            className="auth-modal"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            tabIndex={-1}
          >
            {mode === 'register' ? (
              <RegForm onSwitch={() => switchMode('login')} onClose={onOpenChange} />
            ) : (
              <LoginForm onSwitch={() => switchMode('register')} onClose={onOpenChange} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
