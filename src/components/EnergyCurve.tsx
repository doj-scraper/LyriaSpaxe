import { THEME } from '../types';
import { CompiledTrack } from '../compileTrack';

interface Props {
  /** Normalised energy envelope from the compiled track artifact. */
  energyFunction: CompiledTrack['energyFunction'];
}

/**
 * Renders the energy curve from the compiled artifact's `energyFunction`.
 * Does NOT independently recalculate energy — all values come from the
 * compiler to ensure consistency with every other consumer.
 */
export const EnergyCurve = ({ energyFunction }: Props) => {
  if (energyFunction.length === 0) return null;

  // Map normalised (0–1, 0–1) coordinates into SVG space (0–100, 0–100)
  // SVG y-axis is inverted: energy=1 → y=0 (top), energy=0 → y=100 (bottom)
  const toSVG = (pt: { x: number; y: number }) => ({
    x: pt.x * 100,
    y: (1 - pt.y) * 100,
  });

  const svgPoints = energyFunction.map(toSVG);

  const pathData =
    `M ${svgPoints[0].x},${svgPoints[0].y} ` +
    svgPoints
      .slice(1)
      .map(p => `L ${p.x},${p.y}`)
      .join(' ');

  const areaPath = `${pathData} V 100 H 0 Z`;

  return (
    <div className="w-full h-24 mb-2">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="curve-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={`${THEME.accent}33`} />
            <stop offset="100%" stopColor={`${THEME.accent}00`} />
          </linearGradient>
        </defs>

        {/* Filled area under curve */}
        <path
          d={areaPath}
          fill="url(#curve-gradient)"
          className="transition-all duration-500 ease-in-out"
        />

        {/* Main curve line */}
        <path
          d={pathData}
          fill="none"
          stroke={THEME.accent}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-500 ease-in-out"
          style={{ filter: 'drop-shadow(0 0 4px #00D4FF)' }}
        />
      </svg>
    </div>
  );
};
