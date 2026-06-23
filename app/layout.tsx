import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "@/components/shared/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StatMaster — Probability & Statistics Learning",
    template: "%s | StatMaster",
  },
  description:
    "Interactive self-paced learning platform for Probability & Statistics. Master distributions, practice 370+ questions, and prepare for exams.",
  keywords: ["probability", "statistics", "binomial", "normal distribution", "learning"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
