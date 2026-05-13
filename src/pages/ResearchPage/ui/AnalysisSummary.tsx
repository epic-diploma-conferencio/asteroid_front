import { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type { GraphOverview, RuleResult } from '@/entities/research';

import './analysis-summary.scss';

interface Props {
  overview: GraphOverview | undefined;
  rules: RuleResult[];
  language: string;
}

const truncateRussian = (name: string, max = 18): string =>
  name.length > max ? `${name.slice(0, max - 1)}…` : name;

export const AnalysisSummary = ({ overview, rules, language }: Props) => {
  const summary = overview?.summary;
  const modules = overview?.graph?.modules ?? [];

  const radarData = useMemo(
    () =>
      rules.map((r) => ({
        rule: truncateRussian(r.ruleRussian),
        fullRule: r.ruleRussian,
        score: r.score,
      })),
    [rules],
  );

  const avgScore = useMemo(() => {
    if (!rules.length) {
      return 0;
    }
    return rules.reduce((acc, r) => acc + r.score, 0) / rules.length;
  }, [rules]);

  const worstRule = useMemo(
    () =>
      rules.reduce<RuleResult | null>((acc, r) => (!acc || r.score < acc.score ? r : acc), null),
    [rules],
  );

  if (!summary && !rules.length) {
    return null;
  }

  return (
    <section className="analysis-summary">
      <div className="analysis-summary__metrics">
        <header className="analysis-summary__heading">
          <span className="analysis-summary__eyebrow">Срез по проекту</span>
          <h2 className="analysis-summary__title">Сводка анализа</h2>
        </header>

        <div className="analysis-summary__tile-grid">
          <Tile
            label="Средняя оценка"
            value={`${avgScore.toFixed(0)}`}
            suffix="/100"
            accent={avgScore >= 75 ? 'success' : avgScore >= 50 ? 'neutral' : 'danger'}
          />
          <Tile
            label="Файлов в проекте"
            value={String(modules.length || summary?.moduleCount || 0)}
          />
          <Tile label="Узлов AST" value={String(summary?.totalNodes ?? 0)} />
          <Tile label="Связей" value={String(summary?.totalEdges ?? 0)} />
          <Tile label="Импортов" value={String(summary?.importEdgeCount ?? 0)} />
          <Tile label="Вызовов" value={String(summary?.callEdgeCount ?? 0)} />
          <Tile
            label="Плотность"
            value={(summary?.density ?? 0).toFixed(3).replace(/\.?0+$/, '')}
          />
          <Tile label="Язык" value={language} />
        </div>

        {worstRule ? (
          <div className="analysis-summary__hotspot">
            <span className="analysis-summary__hotspot-eyebrow">Самое слабое правило</span>
            <strong>{worstRule.ruleRussian}</strong>
            <span className="analysis-summary__hotspot-score" data-tone={worstRule.status}>
              {worstRule.score}/100
            </span>
          </div>
        ) : null}
      </div>

      {radarData.length >= 3 ? (
        <div className="analysis-summary__radar">
          <h3 className="analysis-summary__radar-title">Профиль по правилам</h3>
          <div className="analysis-summary__radar-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="78%">
                <PolarGrid stroke="var(--gauge-grid, rgba(150,150,150,0.25))" />
                <PolarAngleAxis
                  dataKey="rule"
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888)' }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Оценка"
                  dataKey="score"
                  stroke="var(--color-primary, #2a9d8f)"
                  fill="var(--color-primary, #2a9d8f)"
                  fillOpacity={0.35}
                  isAnimationActive
                />
                <Tooltip
                  cursor={{ fill: 'rgba(120,120,120,0.08)' }}
                  contentStyle={{
                    background: 'var(--color-surface, #fff)',
                    border: '1px solid var(--color-border, #ccc)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value}/100`, 'Оценка']}
                  labelFormatter={(_, payload) =>
                    payload && payload[0]
                      ? (payload[0].payload as { fullRule: string }).fullRule
                      : ''
                  }
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </section>
  );
};

interface TileProps {
  label: string;
  value: string;
  suffix?: string;
  accent?: 'success' | 'danger' | 'neutral';
}

const Tile = ({ label, value, suffix, accent = 'neutral' }: TileProps) => (
  <div className="analysis-summary__tile" data-accent={accent}>
    <span className="analysis-summary__tile-label">{label}</span>
    <span className="analysis-summary__tile-value">
      {value}
      {suffix ? <span className="analysis-summary__tile-suffix">{suffix}</span> : null}
    </span>
  </div>
);
