import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { ResearchCard } from '@/entities/research';

import './ast-tree-detail.scss';

interface Props {
  card: ResearchCard;
  onClose: () => void;
}

const defaultFiles = ['main.ts', 'modules.ts', 'config.ts'];

const intro = (card: ResearchCard): string => {
  switch (card.kind) {
    case 'ast':
      return 'Система анализа считала AST-структуры всех выбранных файлов. Вы можете ознакомиться подробнее с каждой из них, кликнув по соответствующей карточке:';
    case 'arch':
      return 'Здесь собраны все выявленные отклонения от заявленной архитектуры. Кликните по карточке, чтобы увидеть подробный отчёт по конкретному нарушению:';
    case 'structure':
      return 'Соотнесение структуры проекта с эталонным FSD и другими критериями. Раскрывайте карточки ниже, чтобы увидеть, где есть отклонения:';
    case 'deps':
      return 'Зависимости проекта с разбивкой по уровню уязвимостей. Смотрите подробнее по каждой группе ниже:';
    default:
      return '';
  }
};

const contentLabel = (card: ResearchCard, index: number): string => {
  const files = card.files ?? defaultFiles;
  return files[index] ?? `item-${index + 1}`;
};

const SHRINK_MS = 220;
const BLUR_DELAY_MS = 120;
const BLUR_MS = 260;

export const ASTTreeDetailScreen = ({ card, onClose }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [blurActive, setBlurActive] = useState(false);
  const [shrinkStyle, setShrinkStyle] = useState<{
    transform: string;
    transition: string;
  } | null>(null);

  const files = card.files ?? defaultFiles;
  const tiles = files.length ? files : [...Array(6)].map((_, i) => `item-${i + 1}`);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    },
    [],
  );

  const handleClose = () => {
    if (closing) {
      return;
    }
    setClosing(true);

    const detailEl = containerRef.current;
    const cardEl = document.querySelector<HTMLElement>(`[data-card-id="${card.id}"]`);

    if (!detailEl || !cardEl) {
      onClose();
      return;
    }

    const detailRect = detailEl.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();

    const tx = cardRect.left + cardRect.width / 2 - (detailRect.left + detailRect.width / 2);
    const ty = cardRect.top + cardRect.height / 2 - (detailRect.top + detailRect.height / 2);
    const sx = cardRect.width / detailRect.width;
    const sy = cardRect.height / detailRect.height;

    setClosing(true);
    setBlurActive(false);

    // Commit the fullscreen state first, then start shrink on the next frame.
    // This avoids the "extra grow" flash before the real collapse begins.
    setShrinkStyle({
      transform: 'translate(0px, 0px) scale(1, 1)',
      transition: 'none',
    });

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = window.requestAnimationFrame(() => {
        setShrinkStyle({
          transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`,
          transition: `transform ${SHRINK_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
        });

        blurTimeoutRef.current = window.setTimeout(() => {
          setBlurActive(true);
        }, BLUR_DELAY_MS);

        closeTimeoutRef.current = window.setTimeout(() => {
          onClose();
        }, SHRINK_MS);
      });
    });
  };

  return (
    <motion.div
      ref={containerRef}
      layoutId={closing ? undefined : `research-card-${card.id}`}
      className="ast-detail"
      transition={{ type: 'spring', stiffness: 180, damping: 30, mass: 0.7 }}
      style={
        shrinkStyle
          ? { transform: shrinkStyle.transform, transition: shrinkStyle.transition }
          : undefined
      }
    >
      <motion.div
        className="ast-detail__inner"
        initial={{ opacity: 0 }}
        animate={{
          opacity: closing && blurActive ? 0 : 1,
          filter: blurActive ? 'blur(10px)' : 'blur(0px)',
        }}
        transition={{
          duration: closing ? BLUR_MS / 1000 : 0.38,
          delay: closing ? 0 : 0.32,
          ease: closing ? 'easeIn' : 'easeOut',
        }}
      >
        <button
          type="button"
          className="ast-detail__back"
          onClick={handleClose}
          aria-label="Вернуться к результатам"
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Назад
        </button>

        <h2 className="ast-detail__title">{card.title}</h2>
        <p className="ast-detail__intro">{intro(card)}</p>

        <div className="ast-detail__grid">
          {tiles.map((name, idx) => (
            <article key={`${name}-${idx}`} className="ast-tile">
              <div className="ast-tile__preview">
                <img
                  src={`https://picsum.photos/seed/${card.id}-${idx}/480/320`}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="ast-tile__label">{contentLabel(card, idx)}</div>
            </article>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
