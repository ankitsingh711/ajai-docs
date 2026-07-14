import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import UserSwitcher from "@/components/UserSwitcher";

export const metadata: Metadata = {
  title: "Ajaia Docs",
  description: "A lightweight collaborative document editor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <Link href="/" className="brand">
            Ajaia Docs
          </Link>
          <UserSwitcher />
        </header>
        {children}
      </body>
    </html>
  );
}
