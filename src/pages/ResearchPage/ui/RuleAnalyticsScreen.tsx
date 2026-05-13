import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { GraphOverview, ResearchCard, RuleResult } from '@/entities/research';

import { ScoreGauge } from './ScoreGauge';
import { explainerForRule, formatMetricLabel } from '../lib/rule-explainers';

import './rule-analytics.scss';

interface Props {
  card: ResearchCard;
  rule: RuleResult | null;
  overview: GraphOverview | undefined;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  passed: 'Пройдено',
  warning: 'Требует внимания',
  failed: 'Критично',
};

const STATUS_COLOR = {
  passed: '#2a9d8f',
  warning: '#e9a23b',
  failed: '#d4634c',
} as const;

const SHRINK_MS = 220;
const BLUR_DELAY_MS = 120;
const BLUR_MS = 260;

export const RuleAnalyticsScreen = ({ card, rule, overview, onClose }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shrinkAnimationRef = useRef<Animation | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [blurActive, setBlurActive] = useState(false);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      shrinkAnimationRef.current?.cancel();
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    },
    [],
  );

  const explainer = rule ? explainerForRule(rule.ruleName) : null;

  const metricsBarData = useMemo(() => {
    if (!rule) {
      return [];
    }
    const m = rule.metrics;
    return [
      { name: formatMetricLabel('moduleCount'), value: m.moduleCount, fill: '#264653' },
      { name: formatMetricLabel('totalNodes'), value: m.totalNodes, fill: '#2a9d8f' },
      { name: formatMetricLabel('totalEdges'), value: m.totalEdges, fill: '#577590' },
      { name: formatMetricLabel('importEdgeCount'), value: m.importEdgeCount, fill: '#f4a261' },
      { name: formatMetricLabel('callEdgeCount'), value: m.callEdgeCount, fill: '#b56576' },
    ];
  }, [rule]);

  const drivers = useMemo(() => {
    if (!rule || !explainer) {
      return [];
    }
    return explainer.drivers(rule.metrics, rule.style);
  }, [rule, explainer]);

  const scorePieData = useMemo(() => {
    if (!rule) {
      return [];
    }
    return [
      { name: 'Получено', value: rule.score },
      { name: 'Потеряно', value: 100 - rule.score },
    ];
  }, [rule]);

  const moduleList = useMemo(() => overview?.graph?.modules ?? [], [overview]);

  const handleClose = () => {
    if (closing) {
      return;
    }

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

    flushSync(() => {
      setClosing(true);
      setBlurActive(false);
    });

    shrinkAnimationRef.current?.cancel();

    frameRef.current = window.requestAnimationFrame(() => {
      detailEl.getBoundingClientRect();
      shrinkAnimationRef.current = detailEl.animate(
        [
          { transform: 'translate(0px, 0px) scale(1, 1)' },
          { transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})` },
        ],
        { duration: SHRINK_MS, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'forwards' },
      );
      blurTimeoutRef.current = window.setTimeout(() => setBlurActive(true), BLUR_DELAY_MS);
      closeTimeoutRef.current = window.setTimeout(() => onClose(), SHRINK_MS);
    });
  };

  return (
    <motion.div
      ref={containerRef}
      layoutId={closing ? undefined : `research-card-${card.id}`}
      className="rule-analytics"
      transition={{ type: 'spring', stiffness: 180, damping: 30, mass: 0.7 }}
    >
      <motion.div
        className="rule-analytics__inner"
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
          className="rule-analytics__back"
          onClick={handleClose}
          aria-label="Вернуться к результатам"
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Назад
        </button>

        <header className="rule-analytics__header">
          <div className="rule-analytics__title-wrap">
            <h2 className="rule-analytics__title">{card.title}</h2>
            {explainer ? <p className="rule-analytics__summary">{explainer.summary}</p> : null}
          </div>
          {rule ? (
            <span className="rule-analytics__badge" data-status={rule.status}>
              {STATUS_LABEL[rule.status]}
            </span>
          ) : null}
        </header>

        {!rule ? (
          <div className="rule-analytics__empty">
            Данные по этому правилу недоступны. Это исследование могло быть создано в старой версии
            бэка.
          </div>
        ) : (
          <>
            <div className="rule-analytics__grid">
              <article className="rule-analytics__panel rule-analytics__panel--score">
                <h3>Итоговая оценка</h3>
                <div className="rule-analytics__score-wrap">
                  <ScoreGauge score={rule.score} status={rule.status} size={170} thickness={14} />
                </div>
                <div className="rule-analytics__score-pie">
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie
                        data={scorePieData}
                        dataKey="value"
                        innerRadius={36}
                        outerRadius={56}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        <Cell fill={STATUS_COLOR[rule.status]} />
                        <Cell fill="rgba(120,120,120,0.18)" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(value) => [`${value}/100`, '']}
                      />
                      <Legend
                        iconSize={8}
                        formatter={(value) => (
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="rule-analytics__panel rule-analytics__panel--bars">
                <h3>Метрики графа</h3>
                <div className="rule-analytics__chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metricsBarData}
                      margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--gauge-grid, rgba(150,150,150,0.18))"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(120,120,120,0.08)' }}
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {metricsBarData.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="rule-analytics__density">
                  <span>Плотность графа</span>
                  <strong>{rule.metrics.density.toFixed(3).replace(/\.?0+$/, '')}</strong>
                </div>
              </article>

              <article className="rule-analytics__panel rule-analytics__panel--drivers">
                <h3>Что повлияло на оценку</h3>
                {explainer ? (
                  <code className="rule-analytics__formula">{explainer.formula}</code>
                ) : null}
                <ul className="rule-analytics__driver-list">
                  {drivers.map((d, i) => (
                    <li key={i} className="rule-analytics__driver">
                      <div className="rule-analytics__driver-head">
                        <span className="rule-analytics__driver-label">{d.label}</span>
                        <span className="rule-analytics__driver-value">{d.value}</span>
                      </div>
                      <p className="rule-analytics__driver-detail">{d.detail}</p>
                    </li>
                  ))}
                </ul>
                <div className="rule-analytics__meta">
                  <span>Стиль:</span>
                  <strong>{rule.style}</strong>
                  <span>·</span>
                  <span>Серьёзность:</span>
                  <strong data-severity={rule.severity}>{rule.severity}</strong>
                </div>
              </article>
            </div>

            {moduleList.length ? (
              <section className="rule-analytics__modules">
                <h3>Файлы, попавшие в анализ ({moduleList.length})</h3>
                <ul className="rule-analytics__module-list">
                  {moduleList.map((mod) => (
                    <li key={mod.id} className="rule-analytics__module">
                      <span className="rule-analytics__module-name">{mod.name || mod.path}</span>
                      {mod.language ? (
                        <span className="rule-analytics__module-lang">{mod.language}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
