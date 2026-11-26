import type { LucideIcon } from "lucide-react";

const TONES = {
  amber: "text-[#d99a00] dark:text-[#f5c84b]",
  sky: "text-[#1e90d6] dark:text-[#7cc4f0]",
  green: "text-[#16a05a] dark:text-[#7ee0a4]",
  violet: "text-[#7059d6] dark:text-[#b5a4f0]",
  rose: "text-[#e0455e] dark:text-[#f58a9a]",
} as const;

export type Tone = keyof typeof TONES;

export function Kpi({ label, value, sub, Icon, tone = "sky" }: { label: string; value: string; sub?: string; Icon: LucideIcon; tone?: Tone }) {
  return (
    <div className="glass flex items-center gap-3 p-3 transition hover:-translate-y-0.5" title={label}>
      <span className={`orb size-11 ${TONES[tone]}`}>
        <Icon size={20} strokeWidth={2.4} className="dark:drop-shadow-[0_0_4px_currentColor]" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold opacity-70">{label}</p>
        <p className="truncate text-xl font-extrabold leading-tight tracking-tight">{value}</p>
        {sub && <p className="truncate text-[11px] opacity-60">{sub}</p>}
      </div>
    </div>
  );
}

export function Ring({ pct }: { pct: number }) {
  const p = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#94a3b855" strokeWidth="10" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f0a33a" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${p * 2.513} 251.3`} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-base font-bold">{Math.round(p)}%</span>
    </div>
  );
}
