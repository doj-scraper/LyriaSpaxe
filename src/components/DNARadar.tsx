import { SongDNA, THEME } from '../types';

export const DNARadar = ({ data }: { data: SongDNA }) => {
  const keys = Object.keys(data) as (keyof SongDNA)[];
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;

  const points = keys.map((key, i) => {
    const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
    const val = data[key] / 100;
    return {
      x: center + Math.cos(angle) * radius * val,
      y: center + Math.sin(angle) * radius * val,
      labelX: center + Math.cos(angle) * (radius + 25),
      labelY: center + Math.sin(angle) * (radius + 25),
      key,
    };
  });

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
    >
      {/* Background circles */}
      {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={radius * r}
          fill="none"
          stroke={THEME.border}
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {keys.map((_, i) => {
        const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * radius}
            y2={center + Math.sin(angle) * radius}
            stroke={THEME.border}
            strokeWidth="1"
          />
        );
      })}

      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          fill={THEME.textSecondary}
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          className="uppercase tracking-widest"
        >
          {p.key}
        </text>
      ))}

      {/* Data shape */}
      <path
        d={pathData}
        fill={`${THEME.accent}22`}
        stroke={THEME.accent}
        strokeWidth="2"
        className="transition-all duration-300 ease-out"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill={THEME.accent}
          className="transition-all duration-300 ease-out"
        />
      ))}

      {/* Glow filter */}
      <defs>
        <filter id="dna-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
};
