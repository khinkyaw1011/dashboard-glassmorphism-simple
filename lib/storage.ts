import { format, startOfDay, subDays } from "date-fns";
import { DB, ERROR_TYPES, Operation, WagonError, WAGONS } from "@/types";

const KEY = "smart-wagon-db-v1";
const iso = (t: number) => format(t, "yyyy-MM-dd'T'HH:mm");

function seed(): DB {
  const base = startOfDay(new Date()).getTime();
  const operations: Operation[] = [];
  const errors: WagonError[] = [];
  const routes = ["厨房→客室A棟", "客室B棟→リネン室", "食器回収→洗浄室"];
  for (let d = 13; d >= 0; d--)
    for (let k = 0; k < 3; k++) {
      const s = subDays(base, d).getTime() + (8 + k * 3) * 36e5;
      const failed = (d + k) % 9 === 0;
      operations.push({
        id: `op-${d}-${k}`,
        wagonId: WAGONS[k],
        start: iso(s),
        end: iso(s + (90 + ((d * 7 + k * 13) % 60)) * 6e4),
        distanceKm: +(3.2 + ((d + k) % 5) * 0.8).toFixed(1),
        weightKg: 60 + ((d * 11 + k * 17) % 55),
        result: failed ? "エラー停止" : "完了",
        notes: routes[k],
      });
      if (failed)
        errors.push({
          id: `er-${d}-${k}`,
          wagonId: WAGONS[k],
          type: ERROR_TYPES[(d + k) % 5],
          occurredAt: iso(s + 36e5),
          resolved: d > 2,
          note: "自動検知",
        });
    }
  return {
    operations,
    errors,
    expenses: [{ id: "ex1", label: "車輪交換", amount: 18000 }],
    costs: { electricityRate: 31, maintenanceRate: 42, monthlyFixed: 25000 },
  };
}

/** Service layer: replace the bodies with fetch() calls to the Flask API later. */
export const repo = {
  async load(): Promise<DB> {
    try {
      const r = localStorage.getItem(KEY);
      if (r) return JSON.parse(r) as DB;
    } catch {
      /* fall through to seed */
    }
    return repo.reset();
  },
  async save(db: DB): Promise<void> {
    localStorage.setItem(KEY, JSON.stringify(db));
  },
  async reset(): Promise<DB> {
    const db = seed();
    await repo.save(db);
    return db;
  },
};
