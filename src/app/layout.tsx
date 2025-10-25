import "./globals.css";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ImmunoStat Web",
  description: "Statistical analysis & visualization for immunology data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}