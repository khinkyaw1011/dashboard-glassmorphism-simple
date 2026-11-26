"use client";
import { useState } from "react";
import { format, isSameDay, parseISO, startOfDay, subDays } from "date-fns";
import { Gauge, Scale, Sigma, TrendingUp, Weight } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { Kpi } from "@/components/ui/Kpi";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { daily, MAX_LOAD, sum, thisMonth } from "@/lib/calculations";

export default function Page() {
  const { db } = useApp();
  const [days, setDays] = useState(14);
  if (!db) return <p>読み込み中…</p>;

  const ops = db.operations;
  const kgs = ops.map((o) => o.weightKg);
  const since = subDays(startOfDay(new Date()), days - 1);
  const trips = ops
    .filter((o) => parseISO(o.start) >= since)
    .sort((a, b) => b.start.localeCompare(a.start));
  const kpis: Parameters<typeof Kpi>[0][] = [
    {
      label: "本日の総重量",
      value: `${sum(ops.filter((o) => isSameDay(parseISO(o.start), new Date())).map((o) => o.weightKg))} kg`,
      Icon: Weight,
      tone: "violet",
    },
    {
      label: "直近7日間の総重量",
      value: `${sum(daily(ops, 7).map((d) => d.kg))} kg`,
      Icon: TrendingUp,
      tone: "green",
    },
    {
      label: "今月の総重量",
      value: `${sum(thisMonth(ops).map((o) => o.weightKg))} kg`,
      Icon: Sigma,
      tone: "sky",
    },
    {
      label: "1回あたり平均",
      value: `${(sum(kgs) / (kgs.length || 1)).toFixed(1)} kg`,
      Icon: Scale,
      tone: "amber",
    },
    {
      label: "1回あたり最大",
      value: `${Math.max(0, ...kgs)} kg`,
      sub: `推奨上限 ${MAX_LOAD} kg`,
      Icon: Gauge,
      tone: "rose",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>
      <section className="glass p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-bold">日別の運搬重量</h2>
          <select
            className="field !w-auto"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {[7, 14].map((n) => (
              <option key={n} value={n}>
                直近{n}日間
              </option>
            ))}
          </select>
        </div>
        <TrendChart data={daily(ops, days)} k="kg" unit="kg" variant="area"/>
      </section>
      <section className="glass overflow-x-auto p-3">
        <table className="w-full min-w-[560px] text-left text-sm">
          <tbody>
            {trips.slice(0, 15).map((o) => {
              const pct = (o.weightKg / MAX_LOAD) * 100;
              return (
                <tr
                  key={o.id}
                  className="border-t border-slate-400/20 first:border-0"
                >
                  <td className="px-3 py-2">
                    {format(parseISO(o.start), "M/d HH:mm")}
                  </td>
                  <td className="px-3 font-semibold">{o.wagonId}</td>
                  <td className="px-3">{o.weightKg} kg</td>
                  <td className="px-3">
                    <div className="h-2 w-32 rounded-full bg-slate-400/30">
                      <div
                        className={`h-2 rounded-full ${pct > 100 ? "bg-red-500" : pct > 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 opacity-70">{Math.round(pct)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
