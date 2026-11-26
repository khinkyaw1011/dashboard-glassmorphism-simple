"use client";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { AlertTriangle, CheckCircle2, ListChecks, Trash2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { Kpi } from "@/components/ui/Kpi";
import { ERROR_TYPES, ErrorType, WAGONS, WagonId } from "@/types";

export default function Page() {
  const { db, update } = useApp();
  const [type, setType] = useState("");
  const [f, setF] = useState<{ wagonId: WagonId; type: ErrorType; note: string }>({ wagonId: WAGONS[0], type: ERROR_TYPES[0], note: "" });
  if (!db) return <p>読み込み中…</p>;

  const counts = ERROR_TYPES.map((t) => [t, db.errors.filter((e) => e.type === t).length] as const).sort((a, b) => b[1] - a[1]);
  const rows = db.errors.filter((e) => !type || e.type === type).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const add = () => { update((d) => ({ ...d, errors: [{ id: crypto.randomUUID(), ...f, occurredAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"), resolved: false }, ...d.errors] }), "エラーを記録しました"); setF({ ...f, note: "" }); };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="エラー総数" value={`${db.errors.length} 件`} Icon={AlertTriangle} tone="rose" />
        <Kpi label="未解決" value={`${db.errors.filter((e) => !e.resolved).length} 件`} Icon={ListChecks} tone="amber" />
        <Kpi label="最多のエラー種別" value={counts[0][1] ? counts[0][0] : "なし"} Icon={CheckCircle2} tone="green" />
      </div>
      <div className="glass flex flex-wrap items-end gap-3 p-4">
        <select className="field !w-auto" value={f.wagonId} onChange={(e) => setF({ ...f, wagonId: e.target.value as WagonId })}>{WAGONS.map((w) => <option key={w}>{w}</option>)}</select>
        <select className="field !w-auto" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as ErrorType })}>{ERROR_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        <input className="field min-w-40 flex-1" placeholder="メモ" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        <button className="btn" onClick={add}>エラーを記録</button>
      </div>
      <select className="field !w-auto" value={type} onChange={(e) => setType(e.target.value)}><option value="">すべての種別</option>{ERROR_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
      <div className="glass overflow-x-auto p-3">
        <table className="w-full min-w-[640px] text-left text-sm">
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-t border-slate-400/20 first:border-0">
                <td className="px-3 py-2">{format(parseISO(e.occurredAt), "M/d HH:mm")}</td><td className="px-3 font-semibold">{e.wagonId}</td><td className="px-3">{e.type}</td><td className="px-3 opacity-70">{e.note}</td>
                <td className="px-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.resolved ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-red-500/20 text-red-600 dark:text-red-300"}`}>{e.resolved ? "解決済み" : "未解決"}</span></td>
                <td className="flex gap-3 px-3 py-2">
                  {!e.resolved && <button className="text-xs font-semibold underline" onClick={() => update((d) => ({ ...d, errors: d.errors.map((x) => (x.id === e.id ? { ...x, resolved: true } : x)) }), "解決済みにしました")}>解決</button>}
                  <button aria-label="削除" onClick={() => confirm("このエラー記録を削除しますか？") && update((d) => ({ ...d, errors: d.errors.filter((x) => x.id !== e.id) }), "削除しました")}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center opacity-60">エラー記録はありません。</p>}
      </div>
    </div>
  );
}
