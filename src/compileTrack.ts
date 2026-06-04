import { SongDNA, ArrangementSection, SectionType } from './types';

// ---------------------------------------------------------------------------
// Compilation context — the input to the compiler.
// ---------------------------------------------------------------------------
export type CompilationContext = {
  dna: SongDNA;
  arrangement: ArrangementSection[];
  tempo: number;
  key: string;
};

// ---------------------------------------------------------------------------
// Canonical compiled artifact — the immutable output of the compiler.
// UI components and export targets MUST consume this; they must NOT
// independently re-derive values from raw state.
// ---------------------------------------------------------------------------
export type CompiledTrack = {
  meta: {
    bpm: number;
    key: string;
    durationBars: number;
    durationSeconds: number;
  };
  dna: SongDNA;
  timeline: {
    sectionId: string;
    type: SectionType;
    startBar: number;
    endBar: number;
    /** Normalised 0–1 */
    energy: number;
  }[];
  /** Normalised energy envelope: x = time 0–1, y = energy 0–1 */
  energyFunction: { x: number; y: number }[];
  modules: {
    name: string;
    /** Bar ranges during which this module is present */
    presence: [number, number][];
  }[];
  exports: {
    prompt: string;
    llmReadyJSON: string;
  };
};

// ---------------------------------------------------------------------------
// Render mode — controls how the UI surfaces state.
//
//   LIVE_EDIT       — raw state mutates freely; components read live values.
//   PREVIEW_COMPILED — compiled artifact is shown (default "playback" view).
//   EXPORT_LOCKED   — frozen snapshot forwarded to external model consumers.
// ---------------------------------------------------------------------------
export type RenderMode = 'LIVE_EDIT' | 'PREVIEW_COMPILED' | 'EXPORT_LOCKED';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Infer which instrument/element modules are active based on DNA and timeline.
 * Returns a list of modules with bar-range presence markers.
 */
function inferModules(
  dna: SongDNA,
  timeline: CompiledTrack['timeline'],
  totalBars: number
): CompiledTrack['modules'] {
  const modules: CompiledTrack['modules'] = [];

  const always: [number, number][] = [[0, totalBars]];

  // 808 / sub bass — always present on high-energy/aggression tracks
  if (dna.energy > 40 || dna.aggression > 40) {
    modules.push({ name: '808 Sub Bass', presence: always });
  }

  // Kick — present in high-energy sections
  const kickPresence: [number, number][] = timeline
    .filter(t => t.energy > 0.5)
    .map(t => [t.startBar, t.endBar]);
  if (kickPresence.length) {
    modules.push({ name: 'Kick', presence: kickPresence });
  }

  // Hi-hats — aggressive / energetic sections
  if (dna.aggression > 30 || dna.energy > 40) {
    modules.push({ name: 'Hi-Hats', presence: always });
  }

  // Atmospheric pads — high atmosphere DNA
  if (dna.atmosphere > 40) {
    modules.push({ name: 'Atmospheric Pads', presence: always });
  }

  // Lead melody — emotional content
  if (dna.emotion > 40) {
    const leadPresence: [number, number][] = timeline
      .filter(t => t.type !== 'Intro' && t.type !== 'Outro')
      .map(t => [t.startBar, t.endBar]);
    if (leadPresence.length) {
      modules.push({ name: 'Lead Melody', presence: leadPresence });
    }
  }

  // Nostalgic texture — piano / guitar layer
  if (dna.nostalgia > 35) {
    modules.push({ name: 'Nostalgic Texture', presence: always });
  }

  // Dark string/choir — darkness + atmosphere
  if (dna.darkness > 50 && dna.atmosphere > 50) {
    modules.push({ name: 'Dark Strings', presence: always });
  }

  return modules;
}

/**
 * Build a natural-language Lyria-compatible prompt from the compiled context.
 */
function buildPrompt(
  input: CompilationContext,
  timeline: CompiledTrack['timeline']
): string {
  const { dna } = input;

  // Dominant moods (above threshold)
  const dominantMoods = (Object.entries(dna) as [string, number][])
    .filter(([, val]) => val > 50)
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => key);

  const moodPhrase =
    dominantMoods.length > 0
      ? dominantMoods.join(', ')
      : 'balanced, neutral';

  const structure = timeline
    .map(t => `${t.type} (${t.endBar - t.startBar} bars)`)
    .join(' → ');

  const energyRange = {
    min: Math.min(...timeline.map(t => t.energy)),
    max: Math.max(...timeline.map(t => t.energy)),
  };

  const dynamicNote =
    energyRange.max - energyRange.min > 0.4
      ? 'High dynamic contrast between sections.'
      : 'Consistent energy throughout.';

  return (
    `A ${moodPhrase} track in ${input.key} at ${input.tempo} BPM. ` +
    `Structure: ${structure}. ` +
    `${dynamicNote} ` +
    `Focus on emotional depth and harmonic minor colors. ` +
    `Sparse arrangement with 3–5 core elements. Decisive ending.`
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Deterministically compile a {@link CompilationContext} into an immutable
 * {@link CompiledTrack} artifact.  This is the single source of truth for
 * all downstream consumers (UI, exports, external models).
 */
export function compileTrack(input: CompilationContext): CompiledTrack {
  const totalBars = input.arrangement.reduce((acc, s) => acc + s.bars, 0);
  // Seconds per bar = (60 / bpm) * 4 (assuming 4/4 time)
  const secondsPerBar = (60 / input.tempo) * 4;
  const durationSeconds = Math.round(totalBars * secondsPerBar);

  // Build timeline
  let cursor = 0;
  const timeline: CompiledTrack['timeline'] = input.arrangement.map(section => {
    const startBar = cursor;
    const endBar = cursor + section.bars;
    cursor = endBar;
    return {
      sectionId: section.id,
      type: section.type,
      startBar,
      endBar,
      energy: section.energy / 100,
    };
  });

  // Build normalised energy envelope (two points per section: start + end)
  const energyFunction: CompiledTrack['energyFunction'] = timeline.flatMap(t => [
    { x: t.startBar / totalBars, y: t.energy },
    { x: t.endBar / totalBars, y: t.energy },
  ]);

  const modules = inferModules(input.dna, timeline, totalBars);

  const prompt = buildPrompt(input, timeline);

  return {
    meta: {
      bpm: input.tempo,
      key: input.key,
      durationBars: totalBars,
      durationSeconds,
    },
    dna: { ...input.dna },
    timeline,
    energyFunction,
    modules,
    exports: {
      prompt,
      llmReadyJSON: JSON.stringify(
        { timeline, modules, dna: input.dna, meta: { bpm: input.tempo, key: input.key } },
        null,
        2
      ),
    },
  };
}

/**
 * Strict export gate for external model consumption.
 * External systems receive ONLY the compiled artifact payload — never raw
 * React state, partial graphs, or intermediate UI structures.
 */
export function exportForModel(compiled: CompiledTrack): {
  type: string;
  payload: string;
} {
  return {
    type: 'music.intent.v1',
    payload: compiled.exports.llmReadyJSON,
  };
}
