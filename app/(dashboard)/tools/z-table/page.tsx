import dynamic from "next/dynamic";

const ZTableVisualizer = dynamic(
  () => import("@/components/calculators/ZTableVisualizer").then((m) => m.ZTableVisualizer),
  { ssr: false, loading: () => <p>Loading Z-table...</p> }
);

export default function ZTablePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Z-Table Visualizer</h1>
      <ZTableVisualizer />
    </div>
  );
}
