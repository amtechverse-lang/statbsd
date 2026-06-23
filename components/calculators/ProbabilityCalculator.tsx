"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepByStepSolution } from "@/components/practice/StepByStepSolution";
import { calculateProbability, type DistributionType } from "@/lib/math/distributions";

export function ProbabilityCalculator() {
  const [distribution, setDistribution] = useState<DistributionType>("binomial");
  const [calcType, setCalcType] = useState<"exact" | "lessThan" | "greaterThan">("exact");
  const [x, setX] = useState(3);
  const [params, setParams] = useState({ n: 10, p: 0.5, N: 50, K: 10, lambda: 3, mu: 0, sigma: 1 });
  const [result, setResult] = useState<{ result: number; steps: { step: number; title: string; content: string; explanation: string }[] } | null>(null);

  function calculate() {
    const res = calculateProbability(distribution, params, x, calcType);
    setResult(res);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Probability Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Distribution</Label>
              <Select value={distribution} onValueChange={(v) => setDistribution(v as DistributionType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="binomial">Binomial</SelectItem>
                  <SelectItem value="poisson">Poisson</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="hypergeometric">Hypergeometric</SelectItem>
                  <SelectItem value="geometric">Geometric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Probability Type</Label>
              <Select value={calcType} onValueChange={(v) => setCalcType(v as typeof calcType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">P(X = x)</SelectItem>
                  <SelectItem value="lessThan">P(X ≤ x)</SelectItem>
                  <SelectItem value="greaterThan">P(X ≥ x)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>x value</Label>
              <Input type="number" value={x} onChange={(e) => setX(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {distribution === "binomial" && (
              <>
                <div><Label>n</Label><Input type="number" value={params.n} onChange={(e) => setParams({ ...params, n: Number(e.target.value) })} /></div>
                <div><Label>p</Label><Input type="number" step="0.01" value={params.p} onChange={(e) => setParams({ ...params, p: Number(e.target.value) })} /></div>
              </>
            )}
            {distribution === "poisson" && (
              <div><Label>λ</Label><Input type="number" step="0.1" value={params.lambda} onChange={(e) => setParams({ ...params, lambda: Number(e.target.value) })} /></div>
            )}
            {distribution === "normal" && (
              <>
                <div><Label>μ</Label><Input type="number" value={params.mu} onChange={(e) => setParams({ ...params, mu: Number(e.target.value) })} /></div>
                <div><Label>σ</Label><Input type="number" step="0.1" value={params.sigma} onChange={(e) => setParams({ ...params, sigma: Number(e.target.value) })} /></div>
              </>
            )}
            {distribution === "hypergeometric" && (
              <>
                <div><Label>N</Label><Input type="number" value={params.N} onChange={(e) => setParams({ ...params, N: Number(e.target.value) })} /></div>
                <div><Label>K</Label><Input type="number" value={params.K} onChange={(e) => setParams({ ...params, K: Number(e.target.value) })} /></div>
                <div><Label>n</Label><Input type="number" value={params.n} onChange={(e) => setParams({ ...params, n: Number(e.target.value) })} /></div>
              </>
            )}
            {distribution === "geometric" && (
              <div><Label>p</Label><Input type="number" step="0.01" value={params.p} onChange={(e) => setParams({ ...params, p: Number(e.target.value) })} /></div>
            )}
          </div>

          <Button onClick={calculate}>Calculate</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-2xl font-bold">Result: {result.result}</p>
            <StepByStepSolution steps={result.steps} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
