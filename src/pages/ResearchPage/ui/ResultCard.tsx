import { motion } from 'framer-motion';

import type { ResearchCard, RuleResult } from '@/entities/research';

import { ScoreGauge } from './ScoreGauge';
import { explainerForRule } from '../lib/rule-explainers';

export type ResultCardData = ResearchCard;

interface Props {
  card: ResearchCard;
  rule?: RuleResult | null;
  onClick?: (id: string) => void;
  isHidden?: boolean;
  isGhosted?: boolean;
}

const parseScore = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }
  const m = value.match(/^(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
};

export const ResultCard = ({ card, rule, onClick, isHidden = false, isGhosted = false }: Props) => {
  const score = rule?.score ?? parseScore(card.stat?.value);
  const status = rule?.status;

  const explainer = rule ? explainerForRule(rule.ruleName) : null;
  const drivers = rule && explainer ? explainer.drivers(rule.metrics, rule.style) : [];
  const primaryDriver = drivers[0];

  const ruleSummary = explainer?.summary ?? card.preview;

  return (
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
      <motion.div layoutId={`research-card-preview-${card.id}`} className="research-card__hero">
        {score !== null ? (
          <ScoreGauge score={score} status={status} size={132} thickness={12} />
        ) : (
          <div className="research-card__hero-empty">—</div>
        )}
      </motion.div>

      <div className="research-card__body">
        <h3 className="research-card__title">{card.title}</h3>
        {ruleSummary ? <p className="research-card__summary">{ruleSummary}</p> : null}

        {primaryDriver ? (
          <div className="research-card__driver">
            <span className="research-card__driver-label">{primaryDriver.label}</span>
            <span className="research-card__driver-value">{primaryDriver.value}</span>
          </div>
        ) : null}
      </div>
    </motion.button>
  );
};
