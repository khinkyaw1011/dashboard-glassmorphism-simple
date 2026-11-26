"use client";
import { useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { AlertTriangle, JapaneseYen, Plus, RotateCcw, Repeat, Route, Timer, Weight } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { Kpi, Ring } from "@/components/ui/Kpi";
import { Modal } from "@/components/ui/Modal";
import { WeightHoursChart } from "@/components/dashboard/WeightHoursChart";
import { OperationForm, OperationValues } from "@/components/history/OperationForm";
import { cost, daily, hours, MAX_LOAD, sum, thisMonth, yen } from "@/lib/calculations";
import { WAGONS } from "@/types";

export default function Page() {
  const { db, update, reset, t, lang } = useApp();
  const [open, setOpen] = useState(false);
  if (!db) return <p>{t("読み込み中…")}</p>;

  const now = new Date();
  const today = db.operations.filter((o) => isSameDay(parseISO(o.start), now));
  const trend = daily(db.operations, 7);
  const sorted = [...db.operations].sort((a, b) => b.start.localeCompare(a.start));
  const errs = db.errors.filter((e) => isSameDay(parseISO(e.occurredAt), now)).length;
  const kpis: Parameters<typeof Kpi>[0][] = [
    { label: t("本日の稼働時間"), value: `${sum(today.map(hours)).toFixed(1)} h`, Icon: Timer, tone: "amber" },
    { label: t("本日の走行距離"), value: `${sum(today.map((o) => o.distanceKm)).toFixed(1)} km`, Icon: Route, tone: "sky" },
    { label: t("本日の運搬重量"), value: `${sum(today.map((o) => o.weightKg))} kg`, Icon: Weight, tone: "violet" },
    { label: t("本日の運搬回数"), value: t("{n} 回", { n: today.length }), Icon: Repeat, tone: "green" },
    { label: t("エラー発生回数"), value: t("{n} 件", { n: errs }), Icon: AlertTriangle, tone: "rose" },
    { label: t("今月の推定運用コスト"), value: yen(cost(thisMonth(db.operations), db).total), Icon: JapaneseYen, tone: "amber" },
  ];
  const add = (v: OperationValues) => { update((d) => ({ ...d, operations: [{ ...v, id: crypto.randomUUID() }, ...d.operations] }), "稼働記録を登録しました"); setOpen(false); };

  return (
    <div className="flex flex-col gap-3 md:h-full">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="text-xl font-bold">{format(now, lang === "ja" ? "yyyy年M月d日" : "MMMM d, yyyy")}</p>
        <div className="flex gap-2">
          <button className="btn btn-ghost flex items-center gap-1" onClick={() => confirm(t("サンプルデータを初期化しますか？")) && reset()}><RotateCcw size={15} />{t("サンプルに戻す")}</button>
          <button className="btn flex items-center gap-1" onClick={() => setOpen(true)}><Plus size={16} />{t("手動登録")}</button>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{kpis.map((k) => <Kpi key={k.label} {...k} />)}</div>

      <div className="grid gap-3 md:min-h-0 md:flex-1 lg:grid-cols-12">
        <section className="glass flex min-h-0 flex-col p-4 lg:col-span-5">
          <h2 className="mb-2 shrink-0 text-sm font-bold">{t("直近7日間の運搬重量・稼働時間推移")}</h2>
          <div className="min-h-48 flex-1"><WeightHoursChart data={trend} className="h-full" /></div>
        </section>

        <section className="glass flex min-h-0 flex-col p-4 lg:col-span-3">
          <h2 className="mb-2 shrink-0 text-sm font-bold">{t("ワゴンの状態（直近の積載率）")}</h2>
          <div className="flex min-h-0 flex-1 flex-col justify-around gap-2">
            {WAGONS.map((w) => {
              const last = sorted.find((o) => o.wagonId === w);
              const bad = db.errors.some((e) => e.wagonId === w && !e.resolved);
              return (
                <div key={w} className="flex items-center gap-3">
                  <Ring pct={((last?.weightKg ?? 0) / MAX_LOAD) * 100} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{w}</p>
                    <p className={`text-xs font-medium ${bad ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>{bad ? t("未解決エラーあり") : t("正常稼働")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass flex min-h-0 flex-col p-4 lg:col-span-4">
          <h2 className="mb-2 shrink-0 text-sm font-bold">{t("最新の稼働ログ")}</h2>
          <ul className="min-h-0 flex-1 space-y-2 overflow-hidden text-sm">
            {sorted.slice(0, 5).map((o) => (
              <li key={o.id} className="grid grid-cols-[1fr_auto] gap-x-3 rounded-2xl bg-slate-100 px-3 py-2 dark:bg-white/5">
                <span className="truncate">{format(parseISO(o.start), "M/d HH:mm")} {o.wagonId}</span>
                <span className="font-semibold">{o.weightKg}kg</span>
                <span className="col-span-2 truncate text-xs opacity-70">{t(o.notes)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {open && <Modal title={t("稼働記録の手動登録")} onClose={() => setOpen(false)}><OperationForm onSubmit={add} onCancel={() => setOpen(false)} /></Modal>}
    </div>
  );
}
