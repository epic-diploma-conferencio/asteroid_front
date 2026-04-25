import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import type { ResearchCard } from '@/entities/research';

export type ResultCardData = ResearchCard;

interface Props {
  card: ResearchCard;
  onClick?: (id: string) => void;
  isHidden?: boolean;
  isGhosted?: boolean;
}

const renderSubtitle = (card: ResearchCard): ReactNode => {
  if (!card.stat) {
    return null;
  }
  const tone = card.stat.tone;
  const className =
    tone === 'danger'
      ? 'research-card__value research-card__value--danger'
      : tone === 'success'
        ? 'research-card__value research-card__value--success'
        : 'research-card__value';
  return (
    <>
      {card.stat.label}: <span className={className}>{card.stat.value}</span>
    </>
  );
};

export const ResultCard = ({ card, onClick, isHidden = false, isGhosted = false }: Props) => (
  <motion.button
    type="button"
    layoutId={`research-card-${card.id}`}
    animate={{
      opacity: isHidden || isGhosted ? 0 : 1,
      pointerEvents: isHidden || isGhosted ? 'none' : 'auto',
    }}
    transition={{
      opacity: {
        duration: isHidden ? 0.22 : 0.16,
        ease: 'easeOut',
      },
    }}
    className="research-card"
    onClick={() => onClick?.(card.id)}
    aria-label={card.title}
    data-card-id={card.id}
  >
    <motion.div layoutId={`research-card-preview-${card.id}`} className="research-card__preview">
      <img src={card.preview} alt="" loading="lazy" />
    </motion.div>
    <div className="research-card__body">
      <h3 className="research-card__title">{card.title}</h3>
      <p className="research-card__subtitle">{renderSubtitle(card)}</p>
    </div>
  </motion.button>
);
