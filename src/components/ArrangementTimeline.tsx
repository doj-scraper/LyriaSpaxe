import { ArrangementSection } from '../types';
import { CompiledTrack } from '../compileTrack';

interface Props {
  compiled: CompiledTrack;
  onUpdate: (id: string, updates: Partial<ArrangementSection>) => void;
  locked?: boolean;
}

export const ArrangementTimeline = ({
  compiled,
  onUpdate,
  locked = false,
}: Props) => {
  const { timeline, meta } = compiled;
  const totalBars = meta.durationBars;

  return (
    <div className="w-full h-24 bg-[#0A0B0F] border border-[#252933] rounded-lg overflow-hidden flex relative">
      {/* Bar grid lines */}
      <div
        className="absolute inset-0 flex"
        style={{ pointerEvents: 'none' }}
      >
        {Array.from({ length: totalBars }).map((_, i) => (
          <div
            key={i}
            className="h-full border-l border-[#252933]/30"
            style={{ width: `${100 / totalBars}%` }}
          />
        ))}
      </div>

      {timeline.map(section => {
        const widthPct =
          ((section.endBar - section.startBar) / totalBars) * 100;

        return (
          <div
            key={section.sectionId}
            className="h-full border-r border-[#252933] flex flex-col items-center justify-center relative group cursor-pointer hover:bg-[#00D4FF]/5 transition-colors"
            style={{ width: `${widthPct}%` }}
          >
            <div className="text-[10px] font-bold text-[#00D4FF] mb-1">
              {section.type.toUpperCase()}
            </div>
            <div className="text-[10px] text-[#98A2B3] font-mono">
              {section.endBar - section.startBar} Bars
            </div>
            <div className="text-[8px] text-[#98A2B3] mt-1">
              {Math.round(
                (section.endBar - section.startBar) * ((60 / meta.bpm) * 4)
              )}
              s
            </div>

            {/* Bar ± controls */}
            {!locked && (
              <div className="absolute bottom-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    onUpdate(section.sectionId, {
                      bars: Math.max(
                        1,
                        section.endBar - section.startBar - 1
                      ),
                    })
                  }
                  className="w-4 h-4 flex items-center justify-center bg-[#252933] rounded text-[8px]"
                >
                  -
                </button>
                <button
                  onClick={() =>
                    onUpdate(section.sectionId, {
                      bars: section.endBar - section.startBar + 1,
                    })
                  }
                  className="w-4 h-4 flex items-center justify-center bg-[#252933] rounded text-[8px]"
                >
                  +
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
