export function VennDiagram({
  labelA = "A",
  labelB = "B",
  intersection = "?",
}: {
  labelA?: string;
  labelB?: string;
  intersection?: string | number;
}) {
  return (
    <div className="relative w-[300px] h-[200px] mx-auto">
      <svg viewBox="0 0 300 200" aria-label={`Venn diagram of sets ${labelA} and ${labelB}`}>
        <circle cx="100" cy="100" r="80" fill="hsl(var(--primary))" opacity="0.3" stroke="hsl(var(--primary))" strokeWidth="2" />
        <circle cx="200" cy="100" r="80" fill="hsl(var(--destructive))" opacity="0.3" stroke="hsl(var(--destructive))" strokeWidth="2" />
        <text x="50" y="110" className="text-sm fill-foreground">{labelA}</text>
        <text x="250" y="110" className="text-sm fill-foreground">{labelB}</text>
        <text x="150" y="110" textAnchor="middle" className="text-sm font-bold fill-foreground">{intersection}</text>
      </svg>
    </div>
  );
}
