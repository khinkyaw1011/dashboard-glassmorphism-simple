"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { cost, sum, thisMonth, yen } from "@/lib/calculations";
import { CostSettings } from "@/types";

const FIELDS: [keyof CostSettings, string][] = [
  ["electricityRate", "電力単価 (¥/時間)"],
  ["maintenanceRate", "保守単価 (¥/km)"],
  ["monthlyFixed", "月額固定費 (¥)"],
];

function Rates({
  init,
  onSave,
}: {
  init: CostSettings;
  onSave: (c: CostSettings) => void;
}) {
  const [s, setS] = useState(init);
  return (
    <section className="glass space-y-3 p-5">
      <h2 className="font-bold">コスト設定</h2>
      {FIELDS.map(([k, l]) => (
        <label key={k} className="block text-sm font-semibold">
          {l}
          <input
            type="number"
            min={0}
            className="field"
            value={s[k]}
            onChange={(e) => setS({ ...s, [k]: Number(e.target.value) })}
          />
        </label>
      ))}
      <button className="btn" onClick={() => onSave(s)}>
        設定を保存
      </button>
    </section>
  );
}

export default function Page() {
  const { db, update } = useApp();
  const [ex, setEx] = useState({ label: "", amount: "" });
  if (!db) return <p>読み込み中…</p>;

  const m = thisMonth(db.operations);
  const c = cost(m, db);
  const kg = sum(m.map((o) => o.weightKg));
  const rows: [string, number][] = [
    ["電力コスト", c.electricity],
    ["保守コスト", c.maintenance],
    ["月額固定費", c.fixed],
    ["追加経費", c.additional],
  ];
  const addExpense = () => {
    const amount = Number(ex.amount);
    if (!ex.label.trim() || !(amount > 0)) return;
    update(
      (d) => ({
        ...d,
        expenses: [
          ...d.expenses,
          { id: crypto.randomUUID(), label: ex.label.trim(), amount },
        ],
      }),
      "経費を追加しました",
    );
    setEx({ label: "", amount: "" });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Rates
        key={JSON.stringify(db.costs)}
        init={db.costs}
        onSave={(s) =>
          update((d) => ({ ...d, costs: s }), "コスト設定を保存しました")
        }
      />
      <section className="glass space-y-3 p-5">
        <h2 className="font-bold">今月のコスト内訳</h2>
        <p className="text-4xl font-extrabold">{yen(c.total)}</p>
        <p className="text-sm opacity-70">
          運搬1kgあたり {kg ? yen(c.total / kg) : "–"}
        </p>
        {rows.map(([l, v]) => (
          <div key={l}>
            <div className="flex justify-between text-sm">
              <span>{l}</span>
              <span className="font-semibold">{yen(v)}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-400/30">
              <div
                className="h-2 rounded-full bg-purple-500"
                style={{ width: `${c.total ? (v / c.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </section>
      <section className="glass space-y-3 p-5 lg:col-span-2">
        <h2 className="font-bold">保守・その他の経費</h2>
        <div className="flex flex-wrap gap-3">
          <input
            className="field min-w-40 flex-1"
            placeholder="内容（例：タイヤ交換）"
            value={ex.label}
            onChange={(e) => setEx({ ...ex, label: e.target.value })}
          />
          <input
            className="field !w-40"
            type="number"
            min={1}
            placeholder="金額 (¥)"
            value={ex.amount}
            onChange={(e) => setEx({ ...ex, amount: e.target.value })}
          />
          <button className="btn" onClick={addExpense}>
            経費を追加
          </button>
        </div>
        <ul className="text-sm">
          {db.expenses.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between border-t border-slate-400/20 py-2 first:border-0"
            >
              <span>{e.label}</span>
              <span className="flex items-center gap-3 font-semibold">
                {yen(e.amount)}
                <button
                  aria-label="削除"
                  onClick={() =>
                    update(
                      (d) => ({
                        ...d,
                        expenses: d.expenses.filter((x) => x.id !== e.id),
                      }),
                      "削除しました",
                    )
                  }
                >
                  <Trash2 size={15} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
