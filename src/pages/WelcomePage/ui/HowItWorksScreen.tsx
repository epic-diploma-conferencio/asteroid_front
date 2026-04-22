import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { FeatureCard } from './FeatureCard';
import { welcomeFeatures } from './features';

const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 80 * dir }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -80 * dir }),
};

export const HowItWorksScreen = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = welcomeFeatures.length;
  const current = welcomeFeatures[index];

  const paginate = (step: 1 | -1) => {
    setDirection(step);
    setIndex((i) => (i + step + total) % total);
  };

  const goTo = (target: number) => {
    if (target === index) {
      return;
    }
    setDirection(target > index ? 1 : -1);
    setIndex(target);
  };

  return (
    <section className="welcome-how">
      <div className="welcome-how__inner">
        <h2 className="welcome-how__title">Как это работает?</h2>

        <div className="welcome-how__body">
          <p className="welcome-how__lead">
            Мы используем технологию AST-парсинга для получения всей необходимой информации о слабых
            местах проекта: зависимости с уязвимостями, грубые архитектурные нарушения,
            использование небезопасных технологий, и еще множество критериев для анализа - к вашим
            услугам!
          </p>

          <div className="welcome-how__carousel-group">
            <div className="welcome-how__carousel">
              <button
                type="button"
                className="welcome-how__arrow welcome-how__arrow--left"
                onClick={() => paginate(-1)}
                aria-label="Предыдущий"
              >
                <ChevronLeft size={32} strokeWidth={1.5} />
              </button>

              <div className="welcome-how__slide-viewport">
                <AnimatePresence custom={direction} mode="wait" initial={false}>
                  <motion.div
                    key={index}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="welcome-how__slide"
                    transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                  >
                    <FeatureCard feature={current} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                type="button"
                className="welcome-how__arrow welcome-how__arrow--right"
                onClick={() => paginate(1)}
                aria-label="Следующий"
              >
                <ChevronRight size={32} strokeWidth={1.5} />
              </button>
            </div>

            <div className="welcome-how__dots" role="tablist" aria-label="Шаги">
              {welcomeFeatures.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Шаг ${i + 1}`}
                  className={`welcome-how__dot${i === index ? ' welcome-how__dot--active' : ''}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </div>
        </div>

        <footer className="welcome-how__footer">
          © 2026 Консорциум Злодеяний им. Чубухчиева и Ермолова, все права защищены
        </footer>
      </div>
    </section>
  );
};
