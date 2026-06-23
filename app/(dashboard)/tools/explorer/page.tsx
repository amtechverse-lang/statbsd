import dynamic from "next/dynamic";

const DistributionExplorer = dynamic(
  () => import("@/components/calculators/DistributionExplorer").then((m) => m.DistributionExplorer),
  { ssr: false, loading: () => <p>Loading explorer...</p> }
);

export default function ExplorerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Distribution Explorer</h1>
      <DistributionExplorer />
    </div>
  );
}
