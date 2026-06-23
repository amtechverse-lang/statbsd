import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  { href: "/tools/explorer", title: "Distribution Explorer", description: "Visualize binomial, hypergeometric, Poisson, and normal distributions" },
  { href: "/tools/calculator", title: "Probability Calculator", description: "Compute probabilities with step-by-step solutions" },
  { href: "/tools/z-table", title: "Z-Table Visualizer", description: "Interactive normal distribution table with shaded areas" },
  { href: "/tools/formulas", title: "Formula Reference Sheet", description: "Quick access to all distribution formulas" },
];

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Interactive Tools</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
