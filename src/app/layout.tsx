import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import UserSwitcher from "@/components/UserSwitcher";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Ajaia Docs",
  description: "A lightweight collaborative document editor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <header className="app-header">
          <Link href="/" className="brand">
            <span className="brand-mark">A</span>
            Ajaia Docs
          </Link>
          <UserSwitcher />
        </header>
        {children}
      </body>
    </html>
  );
}
