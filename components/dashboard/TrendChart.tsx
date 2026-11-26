"use client";
import "@/lib/chart";
import type { ChartOptions } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { PALETTE } from "@/lib/palette";

type Props = {
  data: Record<string, string | number>[];
  k: string;
  unit: string;
  color?: string;
  variant?: "bar" | "line" | "area";
  className?: string;
};

export function TrendChart({ data, k, unit, color = PALETTE.bar, variant = "bar", className = "h-52" }: Props) {
  const isArea = variant === "area";
  const chartData = {
    labels: data.map((d) => String(d.label)),
    datasets: [
      {
        label: unit,
        data: data.map((d) => Number(d[k])),
        backgroundColor: isArea ? `${color}33` : color,
        borderColor: color,
        fill: isArea,
        borderRadius: 4,
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c) => `${c.parsed.y} ${unit}` } },
    },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: "#ffffff55" } } },
  };

  return (
    <div className={`relative ${className}`}>
      {variant === "bar" ? (
        <Bar data={chartData} options={options as ChartOptions<"bar">} />
      ) : (
        <Line data={chartData} options={options as ChartOptions<"line">} />
      )}
    </div>
  );
}