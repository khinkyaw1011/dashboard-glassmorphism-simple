"use client";
import "@/lib/chart";
import { Doughnut } from "react-chartjs-2";
import { PALETTE } from "@/lib/palette";

export function DistributionChart({ weights }: { weights: number[] }) {
  const bands = [0, 0, 0, 0];
  weights.forEach((w) => { bands[w < 40 ? 0 : w < 70 ? 1 : w < 100 ? 2 : 3]++; });
  const total = weights.length;

  return (
    <div className="relative h-60">
      <Doughnut
        data={{
          labels: ["軽量 (~40kg)", "標準 (40~70kg)", "重積載 (70~100kg)", "高負荷 (100kg~)"],
          datasets: [{ data: bands, backgroundColor: [...PALETTE.donut], borderWidth: 0, spacing: 2 }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12, usePointStyle: true } },
            tooltip: { callbacks: { label: (c) => `${c.label}: ${c.parsed} 件 (${total ? Math.round((c.parsed / total) * 100) : 0}%)` } },
          },
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
        <span className="text-2xl font-bold">{total}</span>
        <span className="text-xs opacity-60">運搬回数</span>
      </div>
    </div>
  );
}