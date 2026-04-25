import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/features/authorization';

type Props = {
  onCreateAccount: () => void;
  onUpload: () => void;
};

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 2, ease: [0.22, 0.61, 0.36, 1] as const },
  },
};

export const HeroScreen = ({ onCreateAccount, onUpload }: Props) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  const isAuth = useAuthStore((state) => state.token !== null);
  const navigate = useNavigate();

  return (
    <section ref={ref} className="welcome-hero">
      <div className="welcome-hero__backdrop" aria-hidden />
      <motion.div
        className="welcome-hero__content"
        variants={container}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        <motion.h1 className="welcome-hero__title" variants={item}>
          Система анализа исходного кода.
        </motion.h1>

        <motion.p className="welcome-hero__line" variants={item}>
          ASTeroid - ваш уникальный помощник, использующий технологию AST-анализа.
        </motion.p>
        <motion.p className="welcome-hero__line" variants={item}>
          Он расскажет все архитектурные недостатки вашего проекта.
        </motion.p>
        <motion.p className="welcome-hero__line" variants={item}>
          Опробуйте его прямо сейчас без регистрации.
        </motion.p>

        <motion.div className="welcome-hero__actions" variants={item}>
          {isAuth ? (
            <button
              type="button"
              className="welcome-hero__btn welcome-hero__btn--ghost"
              onClick={() => void navigate('/saved')}
            >
              Мои исследования
            </button>
          ) : (
            <button
              type="button"
              className="welcome-hero__btn welcome-hero__btn--ghost"
              onClick={onCreateAccount}
            >
              Создать аккаунт
            </button>
          )}
          <button
            type="button"
            className="welcome-hero__btn welcome-hero__btn--primary"
            onClick={onUpload}
          >
            Загрузить файл
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};
