export const WAGONS = ["WAGON-FB01", "WAGON-FB02", "WAGON-FB03"] as const;
export const RESULTS = ["完了", "中断", "エラー停止"] as const;
export const ERROR_TYPES = ["障害物検知停止", "積載重量超過", "バッテリー低下", "通信・センサー異常", "ルート逸脱"] as const;
export type WagonId = (typeof WAGONS)[number];
export type OpResult = (typeof RESULTS)[number];
export type ErrorType = (typeof ERROR_TYPES)[number];
export interface Operation { id: string; wagonId: WagonId; start: string; end: string; distanceKm: number; weightKg: number; result: OpResult; notes: string }
export interface WagonError { id: string; wagonId: WagonId; type: ErrorType; occurredAt: string; resolved: boolean; note: string }
export interface Expense { id: string; label: string; amount: number }
export interface CostSettings { electricityRate: number; maintenanceRate: number; monthlyFixed: number }
export interface DB { operations: Operation[]; errors: WagonError[]; expenses: Expense[]; costs: CostSettings }
