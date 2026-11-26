"use client";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { Modal } from "@/components/ui/Modal";
import { OperationForm, OperationValues } from "@/components/history/OperationForm";
import { hours } from "@/lib/calculations";
import { OpResult, Operation, RESULTS } from "@/types";

const tone: Record<OpResult, string> = { 完了: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300", 中断: "bg-amber-400/30 text-amber-700 dark:text-amber-200", エラー停止: "bg-red-500/20 text-red-600 dark:text-red-300" };

export default function Page() {
  const { db, update, query } = useApp();
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [edit, setEdit] = useState<Operation | "new" | null>(null);
  if (!db) return <p>読み込み中…</p>;

  const q = query.trim().toLowerCase();
  const rows = db.operations
    .filter((o) => (!q || `${o.wagonId} ${o.notes}`.toLowerCase().includes(q)) && (!status || o.result === status) && (!date || o.start.startsWith(date)))
    .sort((a, b) => b.start.localeCompare(a.start));
  const editId = edit && edit !== "new" ? edit.id : null;
  const save = (v: OperationValues) => {
    update((d) => ({ ...d, operations: editId ? d.operations.map((o) => (o.id === editId ? { ...v, id: o.id } : o)) : [{ ...v, id: crypto.randomUUID() }, ...d.operations] }), "保存しました");
    setEdit(null);
  };
  const del = (o: Operation) => { if (confirm(`${o.wagonId}（${o.start.replace("T", " ")}）を削除しますか？`)) update((d) => ({ ...d, operations: d.operations.filter((x) => x.id !== o.id) }), "削除しました"); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <select className="field !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">すべての結果</option>{RESULTS.map((r) => <option key={r}>{r}</option>)}</select>
        <input type="date" className="field !w-auto" value={date} onChange={(e) => setDate(e.target.value)} aria-label="日付で絞り込み" />
        <span className="text-sm opacity-60">{rows.length} 件</span>
        <button className="btn ml-auto flex items-center gap-1" onClick={() => setEdit("new")}><Plus size={16} />記録を追加</button>
      </div>
      <div className="glass overflow-x-auto p-3">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="opacity-60"><tr>{["ワゴンID", "開始", "終了", "稼働時間", "距離", "重量", "結果", "ルート・メモ", ""].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-slate-400/20">
                <td className="px-3 py-2 font-semibold">{o.wagonId}</td>
                <td className="px-3">{format(parseISO(o.start), "M/d HH:mm")}</td>
                <td className="px-3">{format(parseISO(o.end), "M/d HH:mm")}</td>
                <td className="px-3">{hours(o).toFixed(1)} h</td>
                <td className="px-3">{o.distanceKm} km</td>
                <td className="px-3">{o.weightKg} kg</td>
                <td className="px-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone[o.result]}`}>{o.result}</span></td>
                <td className="px-3">{o.notes}</td>
                <td className="flex gap-2 px-3 py-2"><button aria-label="編集" onClick={() => setEdit(o)}><Pencil size={16} /></button><button aria-label="削除" onClick={() => del(o)}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center opacity-60">該当する記録がありません。条件を変えるか、記録を追加してください。</p>}
      </div>
      {edit && <Modal title={editId ? "稼働記録の編集" : "稼働記録の追加"} onClose={() => setEdit(null)}><OperationForm initial={edit === "new" ? undefined : edit} onSubmit={save} onCancel={() => setEdit(null)} /></Modal>}
    </div>
  );
}
