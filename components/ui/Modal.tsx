"use client";
import { X } from "lucide-react";
import { ReactNode } from "react";

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-lg bg-white/85 p-6 dark:bg-slate-900/85" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="閉じる"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
