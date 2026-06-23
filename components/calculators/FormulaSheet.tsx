"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MathRenderer } from "@/components/shared/MathRenderer";
import formulasData from "@/data/formulas.json";

interface FormulaItem {
  name: string;
  formula: string;
  variables: string;
  mean: string;
  variance: string;
}

export function FormulaSheet() {
  const formulas = formulasData.categories as { category: string; items: FormulaItem[] }[];

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="no-print">
        <p className="text-muted-foreground text-sm">Click each formula to expand details. Use Ctrl+P to print.</p>
      </div>
      {formulas.map((cat) => (
        <Card key={cat.category}>
          <CardHeader>
            <CardTitle>{cat.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {cat.items.map((item) => (
                <AccordionItem key={item.name} value={item.name}>
                  <AccordionTrigger>{item.name}</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <MathRenderer content={`\\[${item.formula}\\]`} />
                    <p className="text-sm text-muted-foreground">{item.variables}</p>
                    {item.mean && <p className="text-sm">Mean: {item.mean}</p>}
                    {item.variance && <p className="text-sm">Variance: {item.variance}</p>}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
