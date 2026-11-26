import { differenceInMinutes, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subDays } from "date-fns";
import { DB, Operation } from "@/types";

export const MAX_LOAD = 120;
export type Unit = "day" | "week" | "month";
export const yen = (n: number) => `¥${Math.round(n).toLocaleString("ja-JP")}`;
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const hours = (o: Operation) => Math.max(0, differenceInMinutes(parseISO(o.end), parseISO(o.start)) / 60);
export const thisMonth = (ops: Operation[]) => ops.filter((o) => isSameMonth(parseISO(o.start), new Date()));

export function cost(ops: Operation[], db: DB) {
  const electricity = sum(ops.map(hours)) * db.costs.electricityRate;
  const maintenance = sum(ops.map((o) => o.distanceKm)) * db.costs.maintenanceRate;
  const fixed = db.costs.monthlyFixed;
  const additional = sum(db.expenses.map((e) => e.amount));
  return { electricity, maintenance, fixed, additional, total: electricity + maintenance + fixed + additional };
}

export function daily(ops: Operation[], n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = subDays(new Date(), n - 1 - i);
    const xs = ops.filter((o) => isSameDay(parseISO(o.start), d));
    return { label: format(d, "M/d"), hours: +sum(xs.map(hours)).toFixed(1), km: +sum(xs.map((o) => o.distanceKm)).toFixed(1), kg: sum(xs.map((o) => o.weightKg)), trips: xs.length };
  });
}

export function bucket(db: DB, from: string, to: string, unit: Unit) {
  const key = (s: string) => {
    const d = parseISO(s);
    return unit === "month" ? format(startOfMonth(d), "yyyy-MM") : format(unit === "week" ? startOfWeek(d, { weekStartsOn: 1 }) : d, "yyyy-MM-dd");
  };
  const inRange = (s: string) => s.slice(0, 10) >= from && s.slice(0, 10) <= to;
  const m = new Map<string, { label: string; hours: number; km: number; kg: number; errors: number; cost: number }>();
  const get = (s: string) => {
    const k = key(s);
    const b = m.get(k) ?? { label: k, hours: 0, km: 0, kg: 0, errors: 0, cost: 0 };
    m.set(k, b);
    return b;
  };
  db.operations.filter((o) => inRange(o.start)).forEach((o) => {
    const b = get(o.start), h = hours(o);
    b.hours += h; b.km += o.distanceKm; b.kg += o.weightKg;
    b.cost += h * db.costs.electricityRate + o.distanceKm * db.costs.maintenanceRate;
  });
  db.errors.filter((e) => inRange(e.occurredAt)).forEach((e) => { get(e.occurredAt).errors += 1; });
  return [...m.values()].sort((a, b) => a.label.localeCompare(b.label)).map((b) => ({ ...b, hours: +b.hours.toFixed(1), km: +b.km.toFixed(1), cost: Math.round(b.cost) }));
}
