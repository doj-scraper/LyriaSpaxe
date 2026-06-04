import { useState } from 'react';
import { Copy, Sparkles, CheckCircle2, Download } from 'lucide-react';
import { CompiledTrack, exportForModel } from '../compileTrack';

interface Props {
  /** Immutable compiled track artifact — the single source of truth. */
  compiled: CompiledTrack;
}

const SCORES = [
  { label: 'Prompt Quality',       key: 'prompt'      },
  { label: 'Commercial Structure', key: 'structure'   },
  { label: 'Hook Timing',          key: 'hook'        },
  { label: 'Replayability',        key: 'replay'      },
] as const;

/**
 * Derives a simple heuristic score from the compiled artifact.
 * All values come from `compiled` — no independent re-computation.
 */
function deriveScores(compiled: CompiledTrack): Record<string, number> {
  const { timeline, dna } = compiled;
  const hookCount = timeline.filter(t => t.type === 'Hook').length;
  const avgEnergy =
    timeline.reduce((acc, t) => acc + t.energy, 0) / (timeline.length || 1);
  const dominantTraits = Object.values(dna).filter(v => v > 50).length;

  return {
    prompt:    Math.min(100, 70 + dominantTraits * 4),
    structure: Math.min(100, 75 + hookCount * 6 + (timeline.length > 3 ? 5 : 0)),
    hook:      Math.min(100, hookCount > 0 ? 80 + hookCount * 6 : 60),
    replay:    Math.min(100, Math.round(avgEnergy * 100 * 0.6 + 40)),
  };
}

/**
 * PromptCompiler reads exclusively from the compiled artifact.
 * It performs no re-derivation of prompt text, structure, or energy —
 * those values are owned by the compiler pipeline.
 */
export const PromptCompiler = ({ compiled }: Props) => {
  const [copied, setCopied] = useState(false);

  const scores = deriveScores(compiled);

  const handleCopyJSON = () => {
    const exportPayload = exportForModel(compiled);
    navigator.clipboard
      .writeText(JSON.stringify(exportPayload, null, 2))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Fallback for environments without clipboard API
        const el = document.createElement('textarea');
        el.value = JSON.stringify(exportPayload, null, 2);
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleDownloadJSON = () => {
    const exportPayload = exportForModel(compiled);
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyria-track-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#111318] border border-[#252933] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00D4FF]" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#98A2B3]">
            Prompt Compiler
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-3 py-1 bg-[#171A21] border border-[#252933] rounded text-xs text-white hover:border-[#00D4FF] transition-colors"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-2 px-3 py-1 bg-[#171A21] border border-[#252933] rounded text-xs text-white hover:border-[#00D4FF] transition-colors"
          >
            {copied ? (
              <CheckCircle2 className="w-3 h-3 text-[#00D4FF]" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
      </div>

      {/* Quality scores derived from compiled artifact */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {SCORES.map(s => (
          <div
            key={s.key}
            className="bg-[#171A21] border border-[#252933] p-4 rounded-lg"
          >
            <div className="text-[10px] text-[#98A2B3] uppercase font-bold mb-1 tracking-tighter leading-none">
              {s.label}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono text-white">
                {scores[s.key]}
              </span>
              <div className="flex-1 h-1 bg-[#252933] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00D4FF] transition-all duration-500"
                  style={{ width: `${scores[s.key]}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generated prompt — directly from compiled.exports.prompt */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-[#00D4FF]/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />
        <div className="relative bg-[#0A0B0F] border border-[#252933] rounded-lg p-5 font-mono text-sm text-[#F5F7FA] leading-relaxed">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
              <span className="text-[10px] text-[#00D4FF] uppercase tracking-widest font-bold">
                Generated Prompt
              </span>
            </div>
            <span className="text-[10px] text-[#98A2B3] font-mono">
              {compiled.meta.key} · {compiled.meta.bpm} BPM · {compiled.meta.durationBars} bars
            </span>
          </div>
          {compiled.exports.prompt}
        </div>
      </div>

      {/* Active modules summary */}
      {compiled.modules.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {compiled.modules.map(m => (
            <span
              key={m.name}
              className="px-2 py-0.5 bg-[#171A21] border border-[#252933] rounded text-[10px] text-[#98A2B3] font-mono"
            >
              {m.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
