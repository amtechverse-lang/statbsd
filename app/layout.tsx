import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "@/components/shared/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StatMaster — Exam Prep for Probability & Statistics",
    template: "%s | StatMaster",
  },
  description:
    "Fast exam preparation for Probability & Statistics. Practice real exam-style problems with step-by-step solutions. Revise any topic, skip what you know.",
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
