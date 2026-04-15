import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState, type Dispatch, type SetStateAction } from 'react';

import { LoginForm } from '@/features/authorization/ui/LoginForm';
import { RegForm } from '@/features/authorization/ui/RegForm';
import { BadgeWithName } from '@/shared/ui/BadgeWithName';
import { Modal } from '@/shared/ui/Modal';
import { ModalSkeleton } from '@/shared/ui/ModalSkeleton';
import { Text } from '@/shared/ui/Text';
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

  const switchMode = (newMode: AuthMode) => {
    setIsLoading(true);
    setTimeout(() => {
      onModeChange(newMode);
      setIsLoading(false);
      setTimeout(() => containerRef.current?.focus(), 0);
    }, 500);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Добро пожаловать"
      description={`Форма ${mode === 'register' ? 'регистрации' : 'входа в аккаунт'}`}
      showCloseButton={!isDesktop}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
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
            className="dialog__content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            tabIndex={-1}
          >
            <BadgeWithName />
            <div className="dialog__text-block">
              <Text style="Heading">Добро пожаловать</Text>
              <Text style="UnderHeading">
                {mode === 'register'
                  ? 'Введите данные для регистрации'
                  : 'Войдите в свой аккаунт для продолжения'}
              </Text>
            </div>
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
