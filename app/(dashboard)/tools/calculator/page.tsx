import { ProbabilityCalculator } from "@/components/calculators/ProbabilityCalculator";

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Probability Calculator</h1>
      <ProbabilityCalculator />
    </div>
  );
}
