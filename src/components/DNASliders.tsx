import { SongDNA } from '../types';

interface Props {
  dna: SongDNA;
  onChange: (key: keyof SongDNA, value: number) => void;
  locked?: boolean;
}

export const DNASliders = ({ dna, onChange, locked = false }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {(Object.keys(dna) as (keyof SongDNA)[]).map(key => (
        <div key={key} className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] uppercase tracking-tighter font-bold text-[#98A2B3]">
            <span>{key}</span>
            <span className="text-[#00D4FF]">{dna[key]}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dna[key]}
            disabled={locked}
            onChange={e => onChange(key, parseInt(e.target.value))}
            className="w-full h-1 bg-[#252933] rounded-full appearance-none cursor-pointer accent-[#00D4FF] disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
      ))}
    </div>
  );
};
