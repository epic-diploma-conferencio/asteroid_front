import type { GraphMetrics, RuleResult, RuleStyle } from '@/entities/research';

const styleMultiplier = (style: RuleStyle): number => {
  if (style === 'strict') {
    return 0.65;
  }
  if (style === 'soft') {
    return 1.35;
  }
  return 1;
};

export interface RuleDriver {
  label: string;
  value: string;
  detail: string;
}

export interface RuleExplainer {
  summary: string;
  formula: string;
  drivers: (metrics: GraphMetrics, style: RuleStyle) => RuleDriver[];
}

const fmtNumber = (n: number, digits = 2) =>
  Number.isFinite(n) ? n.toFixed(digits).replace(/\.?0+$/, '') : '—';

const fmtPercent = (n: number) =>
  Number.isFinite(n) ? `${(n * 100).toFixed(1).replace(/\.?0+$/, '')}%` : '—';

export const RULE_EXPLAINERS: Record<string, RuleExplainer> = {
  structure_analysis: {
    summary: 'Проверяет, разбит ли проект на достаточное число модулей.',
    formula: '100 − (max(0, 3 − modules) × 15 + (nodes < 10 ? 10 : 0)) × k',
    drivers: (m, style) => {
      const k = styleMultiplier(style);
      const missing = Math.max(0, 3 - m.moduleCount);
      const sparse = m.totalNodes < 10;
      return [
        {
          label: 'Модулей',
          value: String(m.moduleCount),
          detail:
            missing > 0
              ? `Не хватает ${missing} до порога в 3 (−${(missing * 15 * k).toFixed(1)})`
              : 'Достаточное количество модулей',
        },
        {
          label: 'Узлов в графе',
          value: String(m.totalNodes),
          detail: sparse
            ? `Меньше 10 — мало сигнала для анализа (−${(10 * k).toFixed(1)})`
            : 'Граф достаточно насыщенный',
        },
      ];
    },
  },

  architecture_analysis: {
    summary: 'Оценивает плотность вызовов между модулями.',
    formula: '100 − min(85, (calls / modules) × 9 × k)',
    drivers: (m, style) => {
      const k = styleMultiplier(style);
      const ratio = m.moduleCount ? m.callEdgeCount / Math.max(m.moduleCount, 1) : m.callEdgeCount;
      const penalty = Math.min(85, ratio * 9 * k);
      return [
        {
          label: 'Вызовов между файлами',
          value: String(m.callEdgeCount),
          detail: `На каждый модуль приходится ≈ ${fmtNumber(ratio)} вызова`,
        },
        {
          label: 'Штраф',
          value: `−${fmtNumber(penalty)}`,
          detail: 'Чем больше cross-module вызовов, тем сильнее связность.',
        },
      ];
    },
  },

  dependency_analysis: {
    summary: 'Считает, насколько плотно файлы импортируют друг друга.',
    formula: '100 − min(90, (imports / nodes) × 18 × k)',
    drivers: (m, style) => {
      const k = styleMultiplier(style);
      const ratio = m.importEdgeCount / Math.max(m.totalNodes || 1, 1);
      const penalty = Math.min(90, ratio * 18 * k);
      return [
        {
          label: 'Импортов',
          value: String(m.importEdgeCount),
          detail: `На каждый узел приходится ≈ ${fmtNumber(ratio)} импорта`,
        },
        {
          label: 'Штраф',
          value: `−${fmtNumber(penalty)}`,
          detail: 'Высокая плотность импортов = риск циклов и тесной связности.',
        },
      ];
    },
  },

  build_analysis: {
    summary: 'Проверяет наличие минимальной структуры и импортов для сборки.',
    formula: '100 − (max(0, 4 − modules) × 10 + (imports === 0 ? 20 : 0)) × k',
    drivers: (m, style) => {
      const k = styleMultiplier(style);
      const missing = Math.max(0, 4 - m.moduleCount);
      const noImports = m.importEdgeCount === 0;
      return [
        {
          label: 'Модулей',
          value: String(m.moduleCount),
          detail:
            missing > 0
              ? `Не хватает ${missing} до порога в 4 (−${(missing * 10 * k).toFixed(1)})`
              : 'Структура достаточна для сборки',
        },
        {
          label: 'Импортов',
          value: String(m.importEdgeCount),
          detail: noImports
            ? `Импортов нет вовсе (−${(20 * k).toFixed(1)})`
            : 'Импорты есть, связи между файлами обнаружены',
        },
      ];
    },
  },

  lint_analysis: {
    summary: 'Грубая оценка «шумности» графа.',
    formula: '100 − (density > 0.12 ? 22 : 8) × k',
    drivers: (m, style) => {
      const k = styleMultiplier(style);
      const noisy = m.density > 0.12;
      return [
        {
          label: 'Плотность',
          value: fmtNumber(m.density, 4),
          detail: noisy ? 'Плотность выше 0.12 — граф «шумный»' : 'Граф разреженный',
        },
        {
          label: 'Штраф',
          value: `−${fmtNumber((noisy ? 22 : 8) * k)}`,
          detail: 'Линт даёт фиксированные штрафы при превышении порогов.',
        },
      ];
    },
  },

  unused_analysis: {
    summary: 'Ищет «висячие» узлы — без входящих и исходящих рёбер.',
    formula: '100 − min(90, max(0, nodes − calls − imports) × 2.5 × k)',
    drivers: (m, style) => {
      const k = styleMultiplier(style);
      const dangling = Math.max(0, m.totalNodes - m.callEdgeCount - m.importEdgeCount);
      const penalty = Math.min(90, dangling * 2.5 * k);
      return [
        {
          label: 'Изолированных узлов',
          value: String(dangling),
          detail:
            dangling > 0
              ? `${dangling} узлов не связаны ни с чем (−${fmtNumber(penalty)})`
              : 'Узлов без связей нет',
        },
        {
          label: 'Узлов всего',
          value: String(m.totalNodes),
          detail: `Связей: ${m.callEdgeCount + m.importEdgeCount}`,
        },
      ];
    },
  },

  vulnerability_analysis: {
    summary: 'Эвристика по соотношению импортов и модулей.',
    formula: '100 − (imports > modules × 4 ? 30 : 12) × k',
    drivers: (m, style) => {
      const k = styleMultiplier(style);
      const risky = m.importEdgeCount > m.moduleCount * 4;
      return [
        {
          label: 'Импортов на модуль',
          value: m.moduleCount ? fmtNumber(m.importEdgeCount / m.moduleCount) : '—',
          detail: risky
            ? `Импортов > 4× модулей — повышенный риск (−${fmtNumber(30 * k)})`
            : `Соотношение в норме (−${fmtNumber(12 * k)})`,
        },
        {
          label: 'Модулей',
          value: String(m.moduleCount),
          detail: 'Чем больше модулей, тем легче «распылить» зависимости.',
        },
      ];
    },
  },

  complexity_analysis: {
    summary: 'Объединяет число вызовов и плотность графа.',
    formula: '100 − min(92, (calls × 1.7 + density × 120) × k)',
    drivers: (m, style) => {
      const k = styleMultiplier(style);
      const weight = m.callEdgeCount * 1.7 + m.density * 120;
      const penalty = Math.min(92, weight * k);
      return [
        {
          label: 'Вызовов',
          value: String(m.callEdgeCount),
          detail: `Вклад в штраф: ${fmtNumber(m.callEdgeCount * 1.7 * k)}`,
        },
        {
          label: 'Плотность',
          value: fmtPercent(m.density),
          detail: `Вклад в штраф: ${fmtNumber(m.density * 120 * k)}`,
        },
        {
          label: 'Итоговый штраф',
          value: `−${fmtNumber(penalty)}`,
          detail: 'Чем сложнее граф, тем сильнее.',
        },
      ];
    },
  },
};

export const explainerForRule = (ruleName: string): RuleExplainer | null =>
  RULE_EXPLAINERS[ruleName] ?? null;

export const ruleNameFromCardId = (cardId: string): string | null => {
  const match = cardId.match(/^card-\d+-(.+)$/);
  return match ? match[1] : null;
};

export const findRuleResult = (
  ruleName: string,
  byRules: { groups?: { groupA?: RuleResult[]; groupB?: RuleResult[] } } | undefined,
): RuleResult | null => {
  if (!byRules?.groups) {
    return null;
  }
  const all = [...(byRules.groups.groupA ?? []), ...(byRules.groups.groupB ?? [])];
  return all.find((r) => r.ruleName === ruleName) ?? null;
};

export const formatMetricLabel = (key: keyof GraphMetrics): string => {
  switch (key) {
    case 'totalNodes':
      return 'Всего узлов';
    case 'totalEdges':
      return 'Всего связей';
    case 'moduleCount':
      return 'Модулей';
    case 'importEdgeCount':
      return 'Импортов';
    case 'callEdgeCount':
      return 'Вызовов';
    case 'density':
      return 'Плотность';
    default:
      return key;
  }
};
