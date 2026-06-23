"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export function NormalCurve({
  mean = 0,
  sigma = 1,
  z,
  shadeTo,
}: {
  mean?: number;
  sigma?: number;
  z?: number;
  shadeTo?: number;
}) {
  const data = useMemo(() => {
    const min = mean - 4 * sigma;
    const max = mean + 4 * sigma;
    const points = 100;
    const step = (max - min) / points;
    return Array.from({ length: points + 1 }, (_, i) => {
      const x = min + i * step;
      const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sigma, 2));
      const xVal = Math.round(x * 100) / 100;
      const shaded = shadeTo !== undefined ? x <= shadeTo : z !== undefined ? x <= mean + z * sigma : false;
      return { x: xVal, pdf: Math.round(pdf * 10000) / 10000, shadedPdf: shaded ? pdf : 0 };
    });
  }, [mean, sigma, z, shadeTo]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="pdf" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
          <Area type="monotone" dataKey="shadedPdf" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
          {z !== undefined && <ReferenceLine x={mean + z * sigma} stroke="red" strokeDasharray="3 3" label={`z=${z}`} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
