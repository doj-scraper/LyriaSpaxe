import React, { useState, useMemo } from 'react';
import { ArrangementSection, SongDNA } from './types';
import { compileTrack, RenderMode } from './compileTrack';
import { DNARadar } from './components/DNARadar';
import { ArrangementTimeline } from './components/ArrangementTimeline';
import { EnergyCurve } from './components/EnergyCurve';
import { PromptCompiler } from './components/PromptCompiler';
import { DNASliders } from './components/DNASliders';
import { Layout, Binary, Lock, Eye, Pencil } from 'lucide-react';

export default function LyriaDNAArchitect() {
  // -------------------------------------------------------------------------
  // Live editable state
  // -------------------------------------------------------------------------
  const [dna, setDna] = useState<SongDNA>({
    darkness: 80,
    atmosphere: 70,
    emotion: 60,
    nostalgia: 40,
    energy: 50,
    aggression: 30,
  });

  const [arrangement, setArrangement] = useState<ArrangementSection[]>([
    { id: '1', type: 'Intro',  bars: 4,  energy: 20 },
    { id: '2', type: 'Hook',   bars: 8,  energy: 80 },
    { id: '3', type: 'Verse',  bars: 16, energy: 50 },
    { id: '4', type: 'Hook',   bars: 8,  energy: 85 },
    { id: '5', type: 'Outro',  bars: 4,  energy: 20 },
  ]);

  const [tempo, setTempo] = useState(120);
  const [songKey, setSongKey] = useState('A minor');

  // -------------------------------------------------------------------------
  // Render mode
  // -------------------------------------------------------------------------
  const [renderMode, setRenderMode] = useState<RenderMode>('LIVE_EDIT');

  // -------------------------------------------------------------------------
  // Compilation boundary
  // STATE → compileTrack() → IMMUTABLE SNAPSHOT
  // All downstream components consume `compiled`, never raw state directly.
  // -------------------------------------------------------------------------
  const compiled = useMemo(
    () => compileTrack({ dna, arrangement, tempo, key: songKey }),
    [dna, arrangement, tempo, songKey]
  );

  // -------------------------------------------------------------------------
  // Mutation handlers (only active during LIVE_EDIT)
  // -------------------------------------------------------------------------
  const updateDna = (key: keyof SongDNA, value: number) => {
    if (renderMode === 'EXPORT_LOCKED') return;
    setDna(prev => ({ ...prev, [key]: value }));
  };

  const updateSection = (id: string, updates: Partial<ArrangementSection>) => {
    if (renderMode === 'EXPORT_LOCKED') return;
    setArrangement(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const isLocked = renderMode === 'EXPORT_LOCKED';

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-8 bg-[#0A0B0F] text-[#F5F7FA] font-sans selection:bg-[#00D4FF]/30">
      <div className="max-w-7xl w-full flex flex-col gap-6">

        {/* Header */}
        <header className="flex justify-between items-end border-b border-[#252933] pb-6 mb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              LYRIA <span className="text-[#00D4FF]">DNA</span> ARCHITECT
            </h1>
            <p className="text-[#98A2B3] text-sm uppercase tracking-widest font-medium">
              Intent-Centric AI Music Design System
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Render mode selector */}
            <div className="flex border border-[#252933] rounded overflow-hidden">
              {(
                [
                  { mode: 'LIVE_EDIT',        icon: <Pencil className="w-3 h-3" />,  label: 'Edit'    },
                  { mode: 'PREVIEW_COMPILED', icon: <Eye    className="w-3 h-3" />,  label: 'Preview' },
                  { mode: 'EXPORT_LOCKED',    icon: <Lock   className="w-3 h-3" />,  label: 'Export'  },
                ] as { mode: RenderMode; icon: React.ReactNode; label: string }[]
              ).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setRenderMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-bold transition-colors ${
                    renderMode === mode
                      ? 'bg-[#00D4FF] text-[#0A0B0F]'
                      : 'bg-[#171A21] text-[#98A2B3] hover:text-white'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
            <div className="px-3 py-1 bg-[#171A21] border border-[#252933] rounded text-xs text-[#00D4FF] font-mono">
              808_HEAT_V1.json
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">

          {/* Layer 1: SONG DNA */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="bg-[#111318] border border-[#252933] rounded-xl p-6 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-6">
                <Binary className="w-4 h-4 text-[#00D4FF]" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-[#98A2B3]">
                  Song DNA
                </h2>
              </div>
              <div className="aspect-square w-full mb-8 relative">
                <DNARadar data={compiled.dna} />
              </div>
              <DNASliders dna={dna} onChange={updateDna} locked={isLocked} />
            </div>
          </section>

          {/* Layer 2 & 3: Arrangement & Energy */}
          <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#111318] border border-[#252933] rounded-xl p-6 flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-[#00D4FF]" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-[#98A2B3]">
                    Arrangement Designer
                  </h2>
                </div>
                <div className="flex gap-2 items-center">
                  {['Drill', 'Pop', 'Modern Hit'].map(p => (
                    <button
                      key={p}
                      disabled={isLocked}
                      className="px-2 py-1 text-[10px] uppercase font-bold border border-[#252933] hover:border-[#00D4FF] transition-colors rounded text-[#98A2B3] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {/* EnergyCurve consumes the compiled energy envelope */}
                <EnergyCurve energyFunction={compiled.energyFunction} />
                {/* Timeline shows compiled view; editing delegates back to live state */}
                <ArrangementTimeline
                  compiled={compiled}
                  onUpdate={updateSection}
                  locked={isLocked}
                />
              </div>

              <div className="flex gap-12 border-t border-[#252933] pt-6">
                <div>
                  <div className="text-[10px] text-[#98A2B3] uppercase font-bold mb-1 tracking-tighter">
                    Total Duration
                  </div>
                  <div className="text-2xl font-mono text-white">
                    {String(Math.floor(compiled.meta.durationSeconds / 60)).padStart(2, '0')}:
                    {String(compiled.meta.durationSeconds % 60).padStart(2, '0')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#98A2B3] uppercase font-bold mb-1 tracking-tighter">
                    Total Bars
                  </div>
                  <div className="text-2xl font-mono text-white">
                    {compiled.meta.durationBars}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#98A2B3] uppercase font-bold mb-1 tracking-tighter">
                    BPM
                  </div>
                  <input
                    type="number"
                    min={60}
                    max={240}
                    value={tempo}
                    disabled={isLocked}
                    onChange={e => setTempo(Number(e.target.value))}
                    className="text-2xl font-mono text-[#00D4FF] bg-transparent border-none outline-none w-16 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-[#98A2B3] uppercase font-bold mb-1 tracking-tighter">
                    Key
                  </div>
                  <select
                    value={songKey}
                    disabled={isLocked}
                    onChange={e => setSongKey(e.target.value)}
                    className="text-sm font-mono text-[#00D4FF] bg-transparent border-none outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {[
                      'A minor', 'B minor', 'C minor', 'D minor',
                      'E minor', 'F minor', 'G minor',
                      'A major', 'C major', 'D major', 'E major',
                      'F major', 'G major',
                    ].map(k => (
                      <option key={k} value={k} className="bg-[#111318]">{k}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Layer 4: Prompt Compiler — consumes the compiled artifact only */}
            <PromptCompiler compiled={compiled} />
          </section>

        </div>
      </div>
    </div>
  );
}
