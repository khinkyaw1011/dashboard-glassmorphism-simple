"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, BarChart3, Bell, History, JapaneseYen, LayoutDashboard, Moon, Scale, Search, Sun } from "lucide-react";
import { ReactNode } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Logo } from "@/components/ui/Logo";

export const NAV = [
  { href: "/dashboard", label: "ダッシュボード", Icon: LayoutDashboard, color: "text-[#d99a00] dark:text-[#f5c84b]" },
  { href: "/history", label: "稼働履歴管理", Icon: History, color: "text-[#1e90d6] dark:text-[#7cc4f0]" },
  { href: "/errors", label: "エラー管理", Icon: AlertTriangle, color: "text-[#e0455e] dark:text-[#f58a9a]" },
  { href: "/costs", label: "コスト管理", Icon: JapaneseYen, color: "text-[#16a05a] dark:text-[#7ee0a4]" },
  { href: "/weights", label: "重量分析", Icon: Scale, color: "text-[#7059d6] dark:text-[#b5a4f0]" },
  { href: "/analytics", label: "統計・グラフ分析", Icon: BarChart3, color: "text-[#d99a00] dark:text-[#f5c84b]" },
];

const ON = "bg-[#0B192C] text-white shadow dark:bg-white dark:text-slate-900";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "";
  const router = useRouter();
  const { db, query, setQuery, dark, setDark, lang, setLang, t } = useApp();
  const open = db?.errors.filter((e) => !e.resolved).length ?? 0;
  const cur = NAV.find((n) => path.startsWith(n.href));

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1500px] flex-col gap-3 p-3 md:h-dvh md:overflow-hidden md:p-4">
      <header className="glass flex shrink-0 items-center gap-3 p-2 md:px-4">
        <Logo className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#20203F]" />
        <h1 className="hidden whitespace-nowrap text-lg font-bold md:block">{cur ? t(cur.label) : "Smart Wagon"}</h1>
        <label className="glass flex flex-1 items-center gap-2 rounded-full px-4 py-1.5">
          <Search size={16} />
          <input className="w-full bg-transparent text-sm outline-none" placeholder={t("ワゴンID・メモを検索（Enterで履歴へ）")} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && router.push("/history")} />
        </label>
        <div className="glass flex rounded-full p-1 text-sm font-semibold">
          {(["ja", "en"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} aria-label={l === "ja" ? "日本語" : "English"} className={`rounded-full px-3 py-1 transition ${lang === l ? ON : ""}`}>{l === "ja" ? "JA" : "EN"}</button>
          ))}
        </div>
        <div className="glass flex rounded-full p-1 text-sm font-semibold">
          {([false, true] as const).map((v) => (
            <button key={String(v)} onClick={() => setDark(v)} className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${dark === v ? ON : ""}`}>
              {v ? <Moon size={15} /> : <Sun size={15} />}<span className="hidden sm:inline">{v ? "Dark" : "Light"}</span>
            </button>
          ))}
        </div>
        <Link href="/errors" aria-label={t("未解決エラー")} className="glass relative grid size-10 shrink-0 place-items-center rounded-full">
          <Bell size={17} />
          {open > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[#0B192C] px-1.5 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">{open}</span>}
        </Link>
      </header>
      <div className="glass flex min-h-0 flex-1 flex-col gap-3 p-3 md:flex-row md:p-4">
        <nav className="flex shrink-0 gap-3 overflow-x-auto p-1 md:w-20 md:flex-col md:justify-between md:overflow-visible md:py-2">
          {NAV.map(({ href, label, Icon, color }) => {
            const active = path.startsWith(href);
            return (
              <Link key={href} href={href} title={t(label)} aria-label={t(label)} className="flex shrink-0 flex-col items-center gap-1.5">
                <span className={`orb transition ${color} ${active ? "scale-110 outline outline-2 outline-offset-2 outline-[#0B192C]/40 dark:outline-white/80" : "opacity-80 hover:-translate-y-0.5 hover:opacity-100"}`}>
                  <Icon size={22} strokeWidth={2.4} className="dark:drop-shadow-[0_0_4px_currentColor]" />
                </span>
                <span className={`max-w-[4.5rem] text-center text-[10px] leading-tight ${active ? "font-bold" : "opacity-70"}`}>{t(label)}</span>
              </Link>
            );
          })}
        </nav>
        <main className="min-h-0 min-w-0 flex-1 md:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
