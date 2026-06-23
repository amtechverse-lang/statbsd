"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BinomialChart } from "@/components/visualizations/BinomialChart";
import { NormalCurve } from "@/components/visualizations/NormalCurve";
import {
  generatePoissonData,
  generateHypergeometricData,
} from "@/lib/math/distributions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function DistributionExplorer() {
  const [binomial, setBinomial] = useState({ n: 10, p: 0.5 });
  const [hyper, setHyper] = useState({ N: 50, K: 10, n: 5 });
  const [poisson, setPoisson] = useState({ lambda: 3 });
  const [normal, setNormal] = useState({ mu: 0, sigma: 1 });

  const poissonData = useMemo(() => generatePoissonData(poisson.lambda), [poisson.lambda]);
  const hyperData = useMemo(() => generateHypergeometricData(hyper.N, hyper.K, hyper.n), [hyper]);

  return (
    <Tabs defaultValue="binomial">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="binomial">Binomial</TabsTrigger>
        <TabsTrigger value="hypergeometric">Hypergeometric</TabsTrigger>
        <TabsTrigger value="poisson">Poisson</TabsTrigger>
        <TabsTrigger value="normal">Normal</TabsTrigger>
      </TabsList>

      <TabsContent value="binomial" className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Binomial Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>n (trials): {binomial.n}</Label>
              <Slider value={[binomial.n]} min={1} max={50} step={1} onValueChange={([n]) => setBinomial({ ...binomial, n })} />
            </div>
            <div><Label>p (probability): {binomial.p.toFixed(2)}</Label>
              <Slider value={[binomial.p * 100]} min={1} max={99} step={1} onValueChange={([v]) => setBinomial({ ...binomial, p: v / 100 })} />
            </div>
            <BinomialChart n={binomial.n} p={binomial.p} />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>μ = {(binomial.n * binomial.p).toFixed(2)}</div>
              <div>σ² = {(binomial.n * binomial.p * (1 - binomial.p)).toFixed(2)}</div>
              <div>σ = {Math.sqrt(binomial.n * binomial.p * (1 - binomial.p)).toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hypergeometric" className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Hypergeometric Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>N (population): {hyper.N}</Label>
              <Slider value={[hyper.N]} min={10} max={100} step={1} onValueChange={([N]) => setHyper({ ...hyper, N })} />
            </div>
            <div><Label>K (successes in pop): {hyper.K}</Label>
              <Slider value={[hyper.K]} min={1} max={hyper.N} step={1} onValueChange={([K]) => setHyper({ ...hyper, K })} />
            </div>
            <div><Label>n (sample size): {hyper.n}</Label>
              <Slider value={[hyper.n]} min={1} max={hyper.N} step={1} onValueChange={([n]) => setHyper({ ...hyper, n })} />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer>
                <BarChart data={hyperData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" /><YAxis /><Tooltip />
                  <Bar dataKey="probability" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="poisson" className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Poisson Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>λ (rate): {poisson.lambda.toFixed(1)}</Label>
              <Slider value={[poisson.lambda * 10]} min={1} max={100} step={1} onValueChange={([v]) => setPoisson({ lambda: v / 10 })} />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer>
                <BarChart data={poissonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" /><YAxis /><Tooltip />
                  <Bar dataKey="probability" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm">μ = σ² = {poisson.lambda.toFixed(1)}</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="normal" className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Normal Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>μ (mean): {normal.mu}</Label>
              <Slider value={[normal.mu + 50]} min={0} max={100} step={1} onValueChange={([v]) => setNormal({ ...normal, mu: v - 50 })} />
            </div>
            <div><Label>σ (std dev): {normal.sigma.toFixed(1)}</Label>
              <Slider value={[normal.sigma * 10]} min={1} max={50} step={1} onValueChange={([v]) => setNormal({ ...normal, sigma: v / 10 })} />
            </div>
            <NormalCurve mean={normal.mu} sigma={normal.sigma} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
