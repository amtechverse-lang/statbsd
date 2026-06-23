"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NormalCurve } from "@/components/visualizations/NormalCurve";
import { lookupZTable, normalCdf } from "@/lib/math/distributions";

export function ZTableVisualizer() {
  const [z, setZ] = useState(0);
  const area = useMemo(() => lookupZTable(z), [z]);

  const tableRows = useMemo(() => {
    const rows: { z: string; area: string }[] = [];
    for (let i = 0; i <= 30; i++) {
      const zVal = i / 10;
      rows.push({ z: zVal.toFixed(1), area: normalCdf(zVal).toFixed(4) });
    }
    return rows;
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Z-Table Visualizer</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <Label>z-score</Label>
              <Input type="number" step="0.01" value={z} onChange={(e) => setZ(Number(e.target.value))} className="w-32" />
            </div>
            <div className="text-sm space-y-1">
              <p>z = {z.toFixed(3)}</p>
              <p>P(Z &lt; z) = {area.toFixed(4)}</p>
              <p>P(Z &gt; z) = {(1 - area).toFixed(4)}</p>
            </div>
          </div>
          <NormalCurve z={z} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Standard Normal Table (P(Z &lt; z))</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">z</th>
                  <th className="p-2 text-left">P(Z &lt; z)</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr
                    key={row.z}
                    className={`border-b ${Math.abs(parseFloat(row.z) - z) < 0.05 ? "bg-primary/10 font-bold" : ""}`}
                  >
                    <td className="p-2">{row.z}</td>
                    <td className="p-2">{row.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
