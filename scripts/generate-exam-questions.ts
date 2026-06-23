import * as fs from "fs";
import * as path from "path";
import type { QuestionData } from "../lib/types";

function q(partial: QuestionData): QuestionData {
  const tagged = tagQuestion({
    ...partial,
    type: "ProblemSolving",
    tags: ["exam-style", "important"],
  } as QuestionData);
  return tagged;
}

function tagQuestion(question: QuestionData): QuestionData {
  const topic = question.topic.toLowerCase();
  let sectionId = question.sectionId;
  let lessonId = question.lessonId;

  if (!lessonId) {
    if (topic.includes("hypergeometric")) lessonId = "hypergeometric";
    else if (topic.includes("poisson")) lessonId = "poisson";
    else if (topic.includes("binomial")) lessonId = "binomial";
    else if (topic.includes("normal")) lessonId = "normal";
    else if (topic.includes("continuous")) lessonId = "continuous";
    else if (topic.includes("joint")) lessonId = "joint";
    else if (
      topic.includes("variance") ||
      topic.includes("covariance") ||
      topic.includes("correlation")
    )
      lessonId = "variance";
  }

  if (!sectionId && lessonId) {
    if (["hypergeometric", "binomial", "poisson"].includes(lessonId)) sectionId = "section-2";
    else if (lessonId === "normal") sectionId = "section-3";
    else sectionId = "section-1";
  }

  return { ...question, sectionId, lessonId };
}

function steps(
  items: { title: string; content: string; explanation: string; formula?: string }[],
  finalAnswer: string,
  commonMistakes: string[] = []
) {
  return {
    steps: items.map((s, i) => ({ step: i + 1, ...s })),
    finalAnswer,
    commonMistakes,
  };
}

/** Additional PDF-style exam problems (variations per topic) */
const EXTRA: QuestionData[] = [
  // --- Hypergeometric ---
  q({
    id: "exam_h_004",
    moduleId: "hypergeometric-distribution",
    topic: "Hypergeometric",
    subtopic: "Lot sampling",
    difficulty: "Medium",
    question: "A lot of 50 items contains 8 defectives. If 6 items are sampled without replacement, find P(exactly 2 defectives).",
    correctAnswer: "0.246",
    hints: ["N=50, K=8, n=6.", "P(X=2)=C(8,2)C(42,4)/C(50,6)."],
    solution: steps(
      [{ title: "Hypergeometric", content: "P(X=2)=C(8,2)C(42,4)/C(50,6)≈0.246", explanation: "Standard formula." }],
      "≈0.246",
      ["Do not use binomial here."]
    ),
  }),
  q({
    id: "exam_h_005",
    moduleId: "hypergeometric-distribution",
    topic: "Hypergeometric",
    subtopic: "Cards",
    difficulty: "Easy",
    question: "From a deck of 52 cards, 5 are drawn without replacement. What is P(exactly 2 aces)? (There are 4 aces.)",
    correctAnswer: "0.0399",
    hints: ["N=52, K=4, n=5.", "P(X=2)=C(4,2)C(48,3)/C(52,5)."],
    solution: steps(
      [{ title: "Setup", content: "Hypergeometric with N=52, K=4, n=5", explanation: "Aces are successes." }],
      "≈0.040",
      []
    ),
  }),
  q({
    id: "exam_h_006",
    moduleId: "hypergeometric-distribution",
    topic: "Hypergeometric",
    subtopic: "Committee",
    difficulty: "Medium",
    question: "A committee of 4 is chosen from 10 men and 7 women. Find P(committee has exactly 3 men).",
    correctAnswer: "0.429",
    hints: ["N=17 total, K=10 men, n=4.", "P(X=3)=C(10,3)C(7,1)/C(17,4)."],
    solution: steps(
      [{ title: "Identify", content: "X=# men ~ Hyp(17,10,4)", explanation: "Without replacement." }],
      "≈0.429",
      []
    ),
  }),
  q({
    id: "exam_h_007",
    moduleId: "hypergeometric-distribution",
    topic: "Hypergeometric",
    subtopic: "Variation",
    difficulty: "Hard",
    question: "Box has 15 good and 5 bad chips. You draw 4 chips. Find P(at least 2 bad).",
    correctAnswer: "0.114",
    hints: ["P(X≥2)=1-P(X≤1) for X=# bad.", "N=20, K=5, n=4."],
    solution: steps(
      [{ title: "Complement", content: "P(X≥2)=1-[P(0)+P(1)]", explanation: "Sum hypergeometric terms." }],
      "≈0.114",
      []
    ),
  }),
  // --- Binomial ---
  q({
    id: "exam_b_004",
    moduleId: "binomial-distribution",
    topic: "Binomial",
    subtopic: "Quality control",
    difficulty: "Easy",
    question: "Each item has 2% defect rate. For 10 independent items, find P(exactly 1 defective).",
    correctAnswer: "0.167",
    hints: ["B(10, 0.02).", "P(X=1)=C(10,1)(0.02)(0.98)^9."],
    solution: steps(
      [{ title: "PMF", content: "P(X=1)≈0.167", explanation: "Binomial." }],
      "≈0.167",
      []
    ),
  }),
  q({
    id: "exam_b_005",
    moduleId: "binomial-distribution",
    topic: "Binomial",
    subtopic: "Survey",
    difficulty: "Medium",
    question: "30% of people support a policy. In a random sample of 12, find P(at least 5 support it).",
    correctAnswer: "0.276",
    hints: ["B(12, 0.3).", "P(X≥5)=1-P(X≤4)."],
    solution: steps(
      [{ title: "Sum", content: "P(X≥5)=Σ_{x=5}^{12} C(12,x)(0.3)^x(0.7)^{12-x}≈0.276", explanation: "Or use CDF." }],
      "≈0.276",
      []
    ),
  }),
  q({
    id: "exam_b_006",
    moduleId: "binomial-distribution",
    topic: "Binomial",
    subtopic: "Free throws",
    difficulty: "Easy",
    question: "A player makes free throws with p=0.75. In 8 attempts, find P(makes at least 6).",
    correctAnswer: "0.684",
    hints: ["B(8, 0.75).", "P(X≥6)=P(6)+P(7)+P(8)."],
    solution: steps(
      [{ title: "Calculate", content: "P(X≥6)≈0.684", explanation: "Sum three terms." }],
      "≈0.684",
      []
    ),
  }),
  q({
    id: "exam_b_007",
    moduleId: "binomial-distribution",
    topic: "Binomial",
    subtopic: "Multiple shipments",
    difficulty: "Hard",
    question: "Each shipment has P(at least one defect among 20 tested)=0.46. For 8 shipments, P(exactly 3 have at least one defect)?",
    correctAnswer: "0.276",
    hints: ["Each shipment: success with p=0.46.", "B(8, 0.46)."],
    solution: steps(
      [{ title: "Binomial on shipments", content: "P(X=3)=C(8,3)(0.46)^3(0.54)^5≈0.276", explanation: "Nested binomial from Example 5.3 style." }],
      "≈0.276",
      []
    ),
  }),
  // --- Poisson ---
  q({
    id: "exam_p_004",
    moduleId: "poisson-distribution",
    topic: "Poisson",
    subtopic: "Calls",
    difficulty: "Easy",
    question: "Call center receives average 5 calls/hour. P(exactly 3 calls in next hour)?",
    correctAnswer: "0.140",
    hints: ["λ=5.", "P(X=3)=e^{-5}5³/3!."],
    solution: steps(
      [{ title: "Poisson PMF", content: "P(X=3)≈0.140", explanation: "Standard." }],
      "≈0.140",
      []
    ),
  }),
  q({
    id: "exam_p_005",
    moduleId: "poisson-distribution",
    topic: "Poisson",
    subtopic: "Printing errors",
    difficulty: "Medium",
    question: "Average 2 typos per page. For one page, P(at most 1 typo)?",
    correctAnswer: "0.406",
    hints: ["λ=2.", "P(X≤1)=P(0)+P(1)."],
    solution: steps(
      [{ title: "CDF", content: "P(X≤1)=e^{-2}(1+2)≈0.406", explanation: "Sum first two terms." }],
      "≈0.406",
      []
    ),
  }),
  q({
    id: "exam_p_006",
    moduleId: "poisson-distribution",
    topic: "Poisson",
    subtopic: "Traffic",
    difficulty: "Medium",
    question: "Average 3 accidents/month in a town. P(2 or more accidents next month)?",
    correctAnswer: "0.576",
    hints: ["λ=3.", "P(X≥2)=1-P(X≤1)."],
    solution: steps(
      [{ title: "Tail", content: "1-P(X≤1)≈0.576", explanation: "Complement." }],
      "≈0.576",
      []
    ),
  }),
  q({
    id: "exam_p_007",
    moduleId: "poisson-distribution",
    topic: "Poisson",
    subtopic: "Interval scaling",
    difficulty: "Hard",
    question: "Particles arrive at rate 4 per millisecond. P(at least 2 in 2 milliseconds)?",
    correctAnswer: "0.982",
    hints: ["λ=8 for 2 ms.", "P(X≥2)=1-P(0)-P(1)."],
    solution: steps(
      [{ title: "Scale λ", content: "λ=4×2=8", explanation: "Rate scales with interval." }],
      "≈0.982",
      ["Forgetting to scale λ with time."]
    ),
  }),
  // --- Normal ---
  q({
    id: "exam_n_007",
    moduleId: "normal-distribution",
    topic: "Normal",
    subtopic: "Scores",
    difficulty: "Easy",
    question: "Test scores ~N(70, 8²). Find P(score > 85).",
    correctAnswer: "0.030",
    hints: ["Z=(85-70)/8=1.875."],
    solution: steps(
      [{ title: "Z", content: "Z=1.875, P(Z>1.875)≈0.030", explanation: "Upper tail." }],
      "≈0.030",
      []
    ),
  }),
  q({
    id: "exam_n_008",
    moduleId: "normal-distribution",
    topic: "Normal",
    subtopic: "Heights",
    difficulty: "Medium",
    question: "Heights ~N(170, 6²) cm. P(between 164 and 178)?",
    correctAnswer: "0.818",
    hints: ["Z₁=-1, Z₂=4/3≈1.33."],
    solution: steps(
      [{ title: "Standardize", content: "P(-1<Z<1.33)≈0.818", explanation: "Table lookup." }],
      "≈0.818",
      []
    ),
  }),
  q({
    id: "exam_n_009",
    moduleId: "normal-applications",
    topic: "Normal Application",
    subtopic: "Percentile",
    difficulty: "Medium",
    question: "Weights ~N(75, 10²) kg. What weight is exceeded by only 5% of people?",
    correctAnswer: "91.4",
    hints: ["5% upper tail → z≈1.645.", "x=μ+zσ."],
    solution: steps(
      [{ title: "Cutoff", content: "x=75+1.645(10)≈91.4", explanation: "Inverse normal." }],
      "≈91.4 kg",
      []
    ),
  }),
  q({
    id: "exam_n_010",
    moduleId: "normal-applications",
    topic: "Normal Application",
    subtopic: "Symmetric interval",
    difficulty: "Hard",
    question: "X~N(100,15²). Find c such that P(100−c < X < 100+c)=0.90.",
    correctAnswer: "c=24.7",
    hints: ["90% central → z=±1.645.", "c=zσ."],
    solution: steps(
      [{ title: "Solve", content: "c=1.645×15≈24.7", explanation: "Symmetric interval." }],
      "c≈24.7",
      []
    ),
  }),
  // --- Continuous ---
  q({
    id: "exam_c_004",
    moduleId: "continuous-distributions",
    topic: "Continuous RV",
    subtopic: "Uniform",
    difficulty: "Easy",
    question: "X is uniform on [2, 7]. Find P(3.5 < X < 5).",
    correctAnswer: "0.3",
    hints: ["Length of interval / total length.", "(5-3.5)/(7-2)."],
    solution: steps(
      [{ title: "Uniform", content: "P=(5-3.5)/5=0.3", explanation: "f=1/(b-a)." }],
      "0.3",
      []
    ),
  }),
  q({
    id: "exam_c_005",
    moduleId: "continuous-distributions",
    topic: "Continuous RV",
    subtopic: "PDF linear",
    difficulty: "Medium",
    question: "f(x)=kx on [0,2]. Find k and P(X>1.5).",
    correctAnswer: "0.4375",
    hints: ["∫₀² kx dx=1 → k=1/2.", "P(X>1.5)=∫_{1.5}^2 x/2 dx."],
    solution: steps(
      [{ title: "Find k", content: "k=1/2", explanation: "Normalize." },
      { title: "Probability", content: "P(X>1.5)=[x²/4]_{1.5}^2=0.4375", explanation: "Integrate." }],
      "0.4375",
      []
    ),
  }),
  q({
    id: "exam_c_006",
    moduleId: "continuous-distributions",
    topic: "Continuous RV",
    subtopic: "Exponential style",
    difficulty: "Medium",
    question: "f(x)=2e^{-2x} for x>0. Find P(1 < X < 3).",
    correctAnswer: "0.238",
    hints: ["∫_1^3 2e^{-2x}dx.", "=[-e^{-2x}]_1^3."],
    solution: steps(
      [{ title: "Integrate", content: "P=e^{-2}-e^{-6}≈0.238", explanation: "Exponential PDF." }],
      "≈0.238",
      []
    ),
  }),
  // --- Joint ---
  q({
    id: "exam_j_003",
    moduleId: "joint-distributions",
    topic: "Joint PDF",
    subtopic: "Uniform triangle",
    difficulty: "Medium",
    question: "f(x,y)=2 for 0<x<1, 0<y<1-x. Find P(Y < X).",
    correctAnswer: "0.5",
    hints: ["Region y<x inside triangle.", "Set up double integral."],
    solution: steps(
      [{ title: "Region", content: "P(Y<X)=∫∫_{y<x} 2 dy dx = 0.5", explanation: "Geometric or integral." }],
      "0.5",
      []
    ),
  }),
  q({
    id: "exam_j_004",
    moduleId: "joint-distributions",
    topic: "Joint PMF",
    subtopic: "Table",
    difficulty: "Medium",
    question: "Joint PMF: f(0,0)=0.2, f(1,0)=0.3, f(0,1)=0.1, f(1,1)=0.4. Find P(X+Y ≤ 1).",
    correctAnswer: "0.6",
    hints: ["Sum cells where x+y≤1.", "(0,0)+(1,0)+(0,1)."],
    solution: steps(
      [{ title: "Sum", content: "0.2+0.3+0.1=0.6", explanation: "Add qualifying cells." }],
      "0.6",
      []
    ),
  }),
  q({
    id: "exam_j_005",
    moduleId: "joint-distributions",
    topic: "Covariance",
    subtopic: "Discrete table",
    difficulty: "Hard",
    question: "E(X)=0.6, E(Y)=0.5, E(XY)=0.4. Find Cov(X,Y).",
    correctAnswer: "0.1",
    hints: ["Cov=E(XY)-E(X)E(Y)."],
    solution: steps(
      [{ title: "Formula", content: "Cov=0.4-0.6(0.5)=0.1", explanation: "Cov(X,Y)=E(XY)-E(X)E(Y)." }],
      "0.1",
      ["Sign errors in E(XY)-E(X)E(Y)."]
    ),
  }),
  // --- Variance ---
  q({
    id: "exam_v_002",
    moduleId: "random-variables",
    topic: "Variance",
    subtopic: "Dice",
    difficulty: "Easy",
    question: "Fair die: X=face value. Find Var(X).",
    correctAnswer: "2.917",
    hints: ["E(X)=3.5.", "E(X²)=(1+4+9+16+25+36)/6."],
    solution: steps(
      [{ title: "E(X²)", content: "E(X²)=91/6", explanation: "Sum squares." },
      { title: "Var", content: "Var=91/6-12.25=35/12≈2.917", explanation: "Formula." }],
      "35/12≈2.92",
      []
    ),
  }),
  q({
    id: "exam_v_003",
    moduleId: "random-variables",
    topic: "Variance",
    subtopic: "Linear transform",
    difficulty: "Medium",
    question: "Var(X)=4. For Y=3X+7, find Var(Y).",
    correctAnswer: "36",
    hints: ["Var(aX+b)=a²Var(X)."],
    solution: steps(
      [{ title: "Rule", content: "Var(Y)=9×4=36", explanation: "Scale squares." }],
      "36",
      []
    ),
  }),
  q({
    id: "exam_v_004",
    moduleId: "joint-distributions",
    topic: "Correlation",
    subtopic: "Perfect correlation",
    difficulty: "Medium",
    question: "If Y=2X+1 and Var(X)>0, what is ρ(X,Y)?",
    correctAnswer: "1",
    hints: ["Linear increasing → ρ=1."],
    solution: steps(
      [{ title: "Answer", content: "ρ=1", explanation: "Perfect positive linear relationship." }],
      "1",
      []
    ),
  }),
  // --- Poisson/Binomial mixed ---
  q({
    id: "exam_pb_003",
    moduleId: "poisson-distribution",
    topic: "Poisson/Binomial",
    subtopic: "Rare events",
    difficulty: "Medium",
    question: "n=500, p=0.01. Approximate P(exactly 4 successes) using Poisson.",
    correctAnswer: "0.175",
    hints: ["λ=np=5.", "P(X=4) with Poisson(5)."],
    solution: steps(
      [{ title: "λ", content: "λ=5", explanation: "Poisson approx." },
      { title: "PMF", content: "P(X=4)≈0.175", explanation: "e^{-5}5^4/24." }],
      "≈0.175",
      []
    ),
  }),
];

const dataDir = path.join(__dirname, "..", "data", "questions");
const legacyPath = path.join(dataDir, "important-questions.json");
const outPath = path.join(dataDir, "exam-questions.json");

let base: QuestionData[] = [];
const basePath = fs.existsSync(outPath) ? outPath : legacyPath;
if (fs.existsSync(basePath)) {
  base = (JSON.parse(fs.readFileSync(basePath, "utf-8")) as QuestionData[]).filter(
    (x) => x.type === "ProblemSolving"
  );
}

const merged = [...base, ...EXTRA].map(tagQuestion);
const seen = new Set<string>();
const unique = merged.filter((q) => {
  if (seen.has(q.id)) return false;
  seen.add(q.id);
  return true;
});

const lessonCounts: Record<string, number> = {};
for (const q of unique) {
  if (q.lessonId) lessonCounts[q.lessonId] = (lessonCounts[q.lessonId] ?? 0) + 1;
}
console.log("Questions per lesson:", lessonCounts);

fs.writeFileSync(outPath, JSON.stringify(unique, null, 2));
console.log(`Wrote ${unique.length} exam-style questions to ${outPath}`);

// Remove legacy per-module banks (generic MCQ/FillIn)
const keep = new Set(["exam-questions.json"]);
for (const f of fs.readdirSync(dataDir)) {
  if (f.endsWith(".json") && !keep.has(f)) {
    fs.unlinkSync(path.join(dataDir, f));
    console.log(`Removed ${f}`);
  }
}
