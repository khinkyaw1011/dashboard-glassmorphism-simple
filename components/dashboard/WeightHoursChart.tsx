"use client";
import "@/lib/chart";
import { Chart } from "react-chartjs-2";
import { PALETTE } from "@/lib/palette";

export function WeightHoursChart({ data, className = "h-72" }: { data: { label: string; kg: number; hours: number }[]; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Chart
        type="bar"
        data={{
          labels: data.map((d) => d.label),
          datasets: [
            {
              type: "bar" as const,
              label: "運搬重量 (kg)",
              data: data.map((d) => d.kg),
              backgroundColor: PALETTE.bar,
              borderRadius: 4,
              yAxisID: "y",
            },
            {
              type: "line" as const,
              label: "稼働時間 (h)",
              data: data.map((d) => d.hours),
              borderColor: PALETTE.line,
              backgroundColor: PALETTE.line,
              tension: 0.3,
              yAxisID: "y1",
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "重量 (kg)" } },
            y1: {
              beginAtZero: true,
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: "時間 (h)" },
            },
          },
        }}
      />
    </div>
  );
}