"use client";
import { useState } from "react";
import { format, subDays } from "date-fns";
import { useApp } from "@/components/providers/AppProvider";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CorrelationChart } from "@/components/analytics/CorrelationChart";
import { bucket, hours, Unit } from "@/lib/calculations";

const CHARTS = [
  ["稼働時間の推移", "hours", "h", "#1E3A5F", "bar"],
  ["走行距離の推移", "km", "km", "#0284C7", "line"],
  ["運搬重量の推移", "kg", "kg", "#4F46E5", "bar"],
  ["エラー発生頻度", "errors", "件", "#E11D48", "bar"],
  ["運用コストの推移", "cost", "円", "#D97706", "line"],
] as const;

export default function Page() {
  const { db, t } = useApp();
  const [from, setFrom] = useState(() => format(subDays(new Date(), 13), "yyyy-MM-dd"));
  const [to, setTo] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [unit, setUnit] = useState<Unit>("day");
  if (!db) return <p>{t("読み込み中…")}</p>;

  const data = bucket(db, from, to, unit);
  const pts = db.operations.filter((o) => o.start.slice(0, 10) >= from && o.start.slice(0, 10) <= to).map((o) => ({ h: +hours(o).toFixed(2), kg: o.weightKg }));

  return (
    <div className="flex flex-col gap-3 md:h-full">
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <input type="date" className="field !w-auto" value={from} max={to} onChange={(e) => setFrom(e.target.value)} aria-label={t("開始日")} />
        <span>〜</span>
        <input type="date" className="field !w-auto" value={to} min={from} onChange={(e) => setTo(e.target.value)} aria-label={t("終了日")} />
        <select className="field !w-auto" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}><option value="day">{t("日別")}</option><option value="week">{t("週別")}</option><option value="month">{t("月別")}</option></select>
      </div>
      <div className="grid gap-3 md:min-h-0 md:flex-1 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2">
        {CHARTS.map(([title, k, u, color, variant]) => (
          <section key={k} className="glass flex min-h-0 flex-col p-4">
            <h2 className="mb-2 shrink-0 text-sm font-bold">{t(title)}</h2>
            <div className="min-h-40 flex-1"><TrendChart data={data} k={k} unit={t(u)} color={color} variant={variant} className="h-full" /></div>
          </section>
        ))}
        <section className="glass flex min-h-0 flex-col p-4">
          <h2 className="mb-2 shrink-0 text-sm font-bold">{t("運搬重量 × 稼働時間の相関")}</h2>
          <div className="min-h-40 flex-1"><CorrelationChart points={pts} className="h-full" /></div>
        </section>
      </div>
    </div>
  );
}
