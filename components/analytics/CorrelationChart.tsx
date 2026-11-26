"use client";
import "@/lib/chart";
import { Scatter } from "react-chartjs-2";
import { PALETTE } from "@/lib/palette";

export function CorrelationChart({ points, className = "h-52" }: { points: { h: number; kg: number }[]; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Scatter
        data={{
          datasets: [
            {
              label: "積載重量(kg) vs 所要時間(分)",
              data: points.map((p) => ({ x: p.kg, y: Math.round(p.h * 60) })),
              backgroundColor: PALETTE.accent,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: "運搬重量 (kg)" } },
            y: { title: { display: true, text: "所要時間 (分)" } },
          },
        }}
      />
    </div>
  );
}