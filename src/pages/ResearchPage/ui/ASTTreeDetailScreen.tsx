import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

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

const CONTENT_FADE_MS = 320;

export const ASTTreeDetailScreen = ({ card, onClose }: Props) => {
  const [closing, setClosing] = useState(false);
  const files = card.files ?? defaultFiles;
  const tiles = files.length ? files : [...Array(6)].map((_, i) => `item-${i + 1}`);

  const handleClose = () => {
    if (closing) {
      return;
    }
    setClosing(true);
    window.setTimeout(onClose, CONTENT_FADE_MS);
  };

  return (
    <motion.div
      layoutId={`research-card-${card.id}`}
      className="ast-detail"
      transition={{ type: 'spring', stiffness: 180, damping: 30, mass: 0.7 }}
    >
      <motion.div
        className="ast-detail__inner"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{
          delay: closing ? 0 : 0.35,
          duration: closing ? CONTENT_FADE_MS / 1000 : 0.4,
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
