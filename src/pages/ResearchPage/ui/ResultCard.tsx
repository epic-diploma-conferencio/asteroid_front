import type { ReactNode } from 'react';

export interface ResultCardData {
  id: string;
  title: string;
  subtitle: ReactNode;
  preview: string;
}

interface Props {
  card: ResultCardData;
  onClick?: (id: string) => void;
}

export const ResultCard = ({ card, onClick }: Props) => (
  <button
    type="button"
    className="research-card"
    onClick={() => onClick?.(card.id)}
    aria-label={card.title}
  >
    <div className="research-card__preview">
      <img src={card.preview} alt="" loading="lazy" />
    </div>
    <div className="research-card__body">
      <h3 className="research-card__title">{card.title}</h3>
      <p className="research-card__subtitle">{card.subtitle}</p>
    </div>
  </button>
);
