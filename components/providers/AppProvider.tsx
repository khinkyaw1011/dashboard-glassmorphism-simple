"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { repo } from "@/lib/storage";
import { DB } from "@/types";

export type Lang = "ja" | "en";

interface Ctx {
  db: DB | null;
  update: (fn: (d: DB) => DB, msg?: string) => void;
  reset: () => void;
  query: string;
  setQuery: (q: string) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}
const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error("AppProvider が必要です");
  return c;
}

const EN: Record<string, string> = {
  "ダッシュボード": "Dashboard",
  "稼働履歴管理": "Operation History",
  "エラー管理": "Errors",
  "コスト管理": "Costs",
  "重量分析": "Weight Analytics",
  "統計・グラフ分析": "Statistics & Charts",
  "ワゴンID・メモを検索（Enterで履歴へ）": "Search wagon ID / notes (Enter for history)",
  "未解決エラー": "Unresolved errors",
  "読み込み中…": "Loading…",
  "本日の稼働時間": "Today's operating hours",
  "本日の走行距離": "Today's distance",
  "本日の運搬重量": "Today's carried weight",
  "本日の運搬回数": "Today's trips",
  "{n} 回": "{n} trips",
  "エラー発生回数": "Error count",
  "{n} 件": "{n} errors",
  "今月の推定運用コスト": "Estimated cost this month",
  "サンプルデータを初期化しますか？": "Reset to the sample data?",
  "サンプルに戻す": "Reset sample",
  "手動登録": "Add manually",
  "直近7日間の運搬重量・稼働時間推移": "Weight & hours trend (last 7 days)",
  "ワゴンの状態（直近の積載率）": "Wagon status (latest load ratio)",
  "未解決エラーあり": "Unresolved errors",
  "正常稼働": "Operating normally",
  "最新の稼働ログ": "Latest operation log",
  "稼働記録の手動登録": "Manual operation entry",
  "開始日": "From",
  "終了日": "To",
  "日別": "Daily",
  "週別": "Weekly",
  "月別": "Monthly",
  "稼働時間の推移": "Operating hours trend",
  "走行距離の推移": "Distance trend",
  "運搬重量の推移": "Weight trend",
  "エラー発生頻度": "Error frequency",
  "運用コストの推移": "Cost trend",
  "運搬重量 × 稼働時間の相関": "Weight × hours correlation",
  "件": "cases",
  "円": "JPY",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB | null>(null);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<Lang>("ja");
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useCallback((m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2200);
  }, []);

  useEffect(() => {
    void repo.load().then(setDb);
    setDark(localStorage.getItem("sw-dark") === "1");
    const saved = localStorage.getItem("sw-lang");
    if (saved === "ja" || saved === "en") setLang(saved);
  }, []);
  useEffect(() => {
    if (db) void repo.save(db);
  }, [db]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("sw-dark", dark ? "1" : "0");
  }, [dark]);
  useEffect(() => {
    localStorage.setItem("sw-lang", lang);
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = lang === "ja" ? key : EN[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          s = s.split(`{${k}}`).join(String(v));
        });
      }
      return s;
    },
    [lang],
  );

  const update = useCallback(
    (fn: (d: DB) => DB, m?: string) => {
      setDb((p) => (p ? fn(p) : p));
      if (m) toast(m);
    },
    [toast],
  );
  const reset = useCallback(() => {
    void repo.reset().then((d) => {
      setDb(d);
      toast("サンプルデータを初期化しました");
    });
  }, [toast]);

  return (
    <AppCtx.Provider
      value={{ db, update, reset, query, setQuery, dark, setDark, lang, setLang, t }}
    >
      {children}
      {msg && (
        <div
          role="status"
          className="glass fixed bottom-5 right-5 z-50 bg-white/90 px-5 py-3 text-sm font-semibold dark:bg-slate-800/90"
        >
          {msg}
        </div>
      )}
    </AppCtx.Provider>
  );
}
