import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { AppProvider } from "@/components/providers/AppProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const metadata: Metadata = { title: "Smart Wagon Management System" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body><AppProvider><DashboardLayout>{children}</DashboardLayout></AppProvider></body>
    </html>
  );
}
