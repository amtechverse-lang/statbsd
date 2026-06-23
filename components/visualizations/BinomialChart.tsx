"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function BinomialChart({ n, p }: { n: number; p: number }) {
  const data = useMemo(() => {
    return Array.from({ length: n + 1 }, (_, x) => {
      let prob = 1;
      for (let i = 0; i < x; i++) prob *= (n - i) / (i + 1);
      prob *= Math.pow(p, x) * Math.pow(1 - p, n - x);
      return { x, probability: Math.round(prob * 100000) / 100000 };
    });
  }, [n, p]);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" label={{ value: "x", position: "insideBottom", offset: -5 }} />
          <YAxis label={{ value: "P(X=x)", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(v) => (typeof v === "number" ? v.toFixed(5) : String(v))} />
          <Bar dataKey="probability" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
