"use client";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Operation, RESULTS, WAGONS } from "@/types";

const schema = z
  .object({
    wagonId: z.enum(WAGONS),
    start: z.string().min(1, "開始日時を入力してください"),
    end: z.string().min(1, "終了日時を入力してください"),
    distanceKm: z
      .number({ invalid_type_error: "数値を入力してください" })
      .min(0, "0以上")
      .max(100, "100km以下"),
    weightKg: z
      .number({ invalid_type_error: "数値を入力してください" })
      .min(0, "0以上")
      .max(200, "200kg以下"),
    result: z.enum(RESULTS),
    notes: z.string().max(100, "100文字以内"),
  })
  .refine((v) => v.end > v.start, {
    message: "終了は開始より後にしてください",
    path: ["end"],
  });
export type OperationValues = z.infer<typeof schema>;

const F = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) => (
  <label className="block text-sm font-semibold">
    {label}
    {children}
    {error && (
      <span className="block text-xs font-normal text-red-500">{error}</span>
    )}
  </label>
);

export function OperationForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Operation;
  onSubmit: (v: OperationValues) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors: e },
  } = useForm<OperationValues>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? {
      wagonId: "WAGON-FB01",
      start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      end: "",
      distanceKm: 0,
      weightKg: 0,
      result: "完了",
      notes: "",
    },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
      <F label="ワゴンID">
        <select className="field" {...register("wagonId")}>
          {WAGONS.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
      </F>
      <F label="運行結果">
        <select className="field" {...register("result")}>
          {RESULTS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </F>
      <F label="開始日時" error={e.start?.message}>
        <input type="datetime-local" className="field" {...register("start")} />
      </F>
      <F label="終了日時" error={e.end?.message}>
        <input type="datetime-local" className="field" {...register("end")} />
      </F>
      <F label="走行距離 (km)" error={e.distanceKm?.message}>
        <input
          type="number"
          step="0.1"
          className="field"
          {...register("distanceKm", { valueAsNumber: true })}
        />
      </F>
      <F label="運搬重量 (kg)" error={e.weightKg?.message}>
        <input
          type="number"
          className="field"
          {...register("weightKg", { valueAsNumber: true })}
        />
      </F>
      <div className="col-span-2">
        <F label="ルート・メモ" error={e.notes?.message}>
          <input className="field" {...register("notes")} />
        </F>
      </div>
      <div className="col-span-2 flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          キャンセル
        </button>
        <button className="btn">保存</button>
      </div>
    </form>
  );
}
