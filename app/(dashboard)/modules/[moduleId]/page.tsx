import { redirect } from "next/navigation";

const MODULE_TO_TOPIC: Record<string, string> = {
  foundations: "binomial",
  "random-variables": "variance",
  "discrete-distributions": "binomial",
  "continuous-distributions": "continuous",
  "discrete-uniform": "continuous",
  "binomial-distribution": "binomial",
  "hypergeometric-distribution": "hypergeometric",
  "geometric-distribution": "binomial",
  "poisson-distribution": "poisson",
  "joint-distributions": "joint",
  "normal-distribution": "normal",
  "normal-applications": "normal",
  "exam-prep": "binomial",
};

export default function ModuleRedirect({ params }: { params: { moduleId: string } }) {
  const topic = MODULE_TO_TOPIC[params.moduleId] ?? "binomial";
  redirect(`/revise/${topic}`);
}
