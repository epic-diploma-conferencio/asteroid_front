import { useMemo } from 'react';

import type { RuleScoreStatus } from '@/entities/research';

interface Props {
  score: number;
  status?: RuleScoreStatus;
  size?: number;
  thickness?: number;
  caption?: string;
  className?: string;
}

const STATUS_COLOR: Record<RuleScoreStatus, string> = {
  passed: 'var(--gauge-success, #2a9d8f)',
  warning: 'var(--gauge-warning, #e9a23b)',
  failed: 'var(--gauge-danger, #d4634c)',
};

const toneFromScore = (score: number): RuleScoreStatus => {
  if (score >= 75) {
    return 'passed';
  }
  if (score >= 50) {
    return 'warning';
  }
  return 'failed';
};

export const ScoreGauge = ({
  score,
  status,
  size = 120,
  thickness = 10,
  caption,
  className,
}: Props) => {
  const safeScore = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const resolvedStatus = status ?? toneFromScore(safeScore);
  const color = STATUS_COLOR[resolvedStatus];

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const sweep = 0.78;
  const arcLength = circumference * sweep;
  const filled = (safeScore / 100) * arcLength;
  const dashOffset = arcLength - filled;
  const rotation = useMemo(() => 90 + (1 - sweep) * 180, []);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-block',
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gauge-track, rgba(120, 120, 120, 0.18))"
          strokeWidth={thickness}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading, inherit)',
            fontWeight: 700,
            fontSize: size * 0.28,
            color: 'var(--color-text, inherit)',
            lineHeight: 1,
          }}
        >
          {Math.round(safeScore)}
        </span>
        <span
          style={{
            fontSize: size * 0.1,
            color: 'var(--color-text-muted, inherit)',
            marginTop: 4,
            letterSpacing: 0.5,
          }}
        >
          {caption ?? 'из 100'}
        </span>
      </div>
    </div>
  );
};
