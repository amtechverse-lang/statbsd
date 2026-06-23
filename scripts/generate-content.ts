/**
 * Generates all module JSON files and question JSON files for StatMaster.
 * Run: npm run generate:content
 */
import * as fs from "fs";
import * as path from "path";
import {
  binomialPmf,
  binomialCdf,
  binomialAtLeast,
  normalCdf,
  zScore,
  poissonPmf,
  hypergeometricPmf,
  geometricPmf,
  inverseNormalCdf,
} from "../lib/math/distributions";
import { combination, factorial, permutation, roundTo } from "../lib/math/combinations";
import type { ModuleData, QuestionData, Solution } from "../lib/types";

const DATA_DIR = path.join(__dirname, "..", "data");
const MODULES_DIR = path.join(DATA_DIR, "modules");
const QUESTIONS_DIR = path.join(DATA_DIR, "questions");

function ensureDirs() {
  [MODULES_DIR, QUESTIONS_DIR, path.join(DATA_DIR, "exams")].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

function makeSolution(
  steps: { title: string; content: string; explanation: string }[],
  finalAnswer: string,
  commonMistakes: string[] = []
): Solution {
  return {
    steps: steps.map((s, i) => ({ step: i + 1, ...s })),
    finalAnswer,
    commonMistakes,
  };
}

const MODULE_DEFS: Omit<ModuleData, "lessons">[] = [
  { id: "foundations", title: "Foundations", description: "Basic math skills: arithmetic, fractions, percentages, factorials, combinations, algebra, and set theory.", order: 0, prerequisites: [] },
  { id: "random-variables", title: "Introduction to Random Variables", description: "Understand random variables, sample spaces, discrete vs continuous types, and Bernoulli variables.", order: 1, prerequisites: ["foundations"] },
  { id: "discrete-distributions", title: "Discrete Probability Distributions", description: "Master PMF and CDF for discrete random variables.", order: 2, prerequisites: ["random-variables"] },
  { id: "continuous-distributions", title: "Continuous Probability Distributions", description: "Understand PDF, properties, and CDF for continuous variables.", order: 3, prerequisites: ["discrete-distributions"] },
  { id: "discrete-uniform", title: "Discrete Uniform Distribution", description: "When all outcomes are equally likely.", order: 4, prerequisites: ["continuous-distributions"] },
  { id: "binomial-distribution", title: "Binomial Distribution", description: "Master the most important discrete distribution.", order: 5, prerequisites: ["discrete-uniform"] },
  { id: "hypergeometric-distribution", title: "Hypergeometric Distribution", description: "Sampling without replacement.", order: 6, prerequisites: ["binomial-distribution"] },
  { id: "geometric-distribution", title: "Geometric Distribution", description: "Waiting time until first success.", order: 7, prerequisites: ["hypergeometric-distribution"] },
  { id: "poisson-distribution", title: "Poisson Distribution", description: "Counting events over time or space.", order: 8, prerequisites: ["geometric-distribution"] },
  { id: "joint-distributions", title: "Joint Probability Distributions", description: "Multiple random variables, marginals, conditionals, and independence.", order: 9, prerequisites: ["poisson-distribution"] },
  { id: "normal-distribution", title: "Normal Distribution", description: "The most important continuous distribution.", order: 10, prerequisites: ["joint-distributions"] },
  { id: "normal-applications", title: "Applications of Normal Distribution", description: "Apply normal distribution to real-world problems.", order: 11, prerequisites: ["normal-distribution"] },
  { id: "exam-prep", title: "Exam Preparation", description: "Comprehensive review, mock exams, and exam strategy.", order: 12, prerequisites: ["normal-applications"] },
];

const LESSON_TOPICS: Record<string, string[][]> = {
  foundations: [
    ["Basic Arithmetic", "Review addition, subtraction, multiplication, and division with whole numbers and decimals."],
    ["Fractions and Decimals", "Convert between fractions and decimals. Add and subtract fractions."],
    ["Percentages", "Calculate percentages, find percentage increase/decrease."],
    ["Factorials", "Understand n! and compute factorials for small n."],
    ["Combinations and Permutations", "Learn nCr and nPr formulas and when to use each."],
    ["Basic Algebra", "Solve simple equations for x."],
    ["Basic Set Theory", "Unions, intersections, complements, and Venn diagrams."],
  ],
  "random-variables": [
    ["What is a Random Variable?", "A random variable assigns a number to each outcome in a sample space."],
    ["Sample Space vs Random Variable", "Distinguish between outcomes and the numerical values assigned."],
    ["Discrete vs Continuous", "Discrete variables take countable values; continuous take any value in an interval."],
    ["Bernoulli Random Variables", "Dummy variables with exactly two outcomes: success (1) or failure (0)."],
    ["Real-Life Examples", "Coin tosses, urn draws, quality control, and matching problems."],
  ],
  "discrete-distributions": [
    ["PMF Definition", "Probability Mass Function gives P(X=x) for each value x."],
    ["Properties of PMF", "All probabilities are non-negative and sum to 1."],
    ["Calculating from PMF", "Find probabilities of events using the PMF."],
    ["CDF Definition", "Cumulative Distribution Function: F(x) = P(X ≤ x)."],
    ["PMF and CDF Relationship", "CDF is the running sum of PMF values."],
  ],
  "continuous-distributions": [
    ["PDF Definition", "Probability Density Function describes continuous distributions."],
    ["Properties of PDF", "PDF is non-negative; total area under curve equals 1."],
    ["Why P(X=a)=0", "For continuous RVs, the probability at any single point is zero."],
    ["Calculating from PDF", "Probabilities are areas under the PDF curve."],
    ["CDF for Continuous", "F(x) = integral of PDF from -∞ to x."],
  ],
  "discrete-uniform": [
    ["Equally Likely Outcomes", "Each of n outcomes has probability 1/n."],
    ["Uniform PMF", "P(X=x) = 1/n for x = 1, 2, ..., n."],
    ["Real-World Examples", "Fair die, random number generation, random selection."],
    ["Mean and Variance", "μ = (n+1)/2, σ² = (n²-1)/12."],
  ],
  "binomial-distribution": [
    ["Bernoulli Process", "Fixed n trials, independent, two outcomes, constant p."],
    ["Binomial Random Variable", "X = number of successes in n Bernoulli trials."],
    ["Binomial PMF", "P(X=x) = C(n,x) p^x (1-p)^(n-x)."],
    ["Mean and Variance", "μ = np, σ² = np(1-p)."],
    ["Binomial Tables", "Using tables to find cumulative probabilities."],
    ["Applications", "Quality control, medical trials, survey sampling."],
  ],
  "hypergeometric-distribution": [
    ["Sampling Without Replacement", "When items are not returned after selection."],
    ["Hypergeometric PMF", "h(x;N,n,k) = C(K,x)C(N-K,n-x)/C(N,n)."],
    ["Mean and Variance", "μ = nK/N, σ² = n(K/N)(1-K/N)(N-n)/(N-1)."],
    ["Relation to Binomial", "Binomial approximates hypergeometric when n/N ≤ 0.05."],
    ["Applications", "Lot sampling, card draws, acceptance sampling."],
  ],
  "geometric-distribution": [
    ["Definition", "Number of trials until the first success."],
    ["Geometric PMF", "P(X=x) = p(1-p)^(x-1) for x = 1, 2, 3, ..."],
    ["Mean and Variance", "μ = 1/p, σ² = (1-p)/p²."],
    ["Negative Binomial Relation", "Generalization counting r-th success."],
    ["Applications", "Inspection until first defect, connection attempts."],
  ],
  "poisson-distribution": [
    ["Poisson Process", "Events occur independently at constant average rate λ."],
    ["Poisson PMF", "P(X=x) = e^(-λt)(λt)^x / x!."],
    ["Mean and Variance", "Both equal λt."],
    ["Poisson as Binomial Limit", "When n is large and p is small, Binomial → Poisson."],
    ["Applications", "Accidents, arrivals, defects per unit."],
  ],
  "joint-distributions": [
    ["Joint PMF", "P(X=x, Y=y) for two discrete random variables."],
    ["Joint PDF", "f(x,y) for two continuous random variables."],
    ["Marginal Distributions", "g(x) = Σ_y P(X=x,Y=y)."],
    ["Conditional Distributions", "P(Y=y|X=x) = P(X=x,Y=y)/P(X=x)."],
    ["Independence", "P(X=x,Y=y) = P(X=x)P(Y=y) for all x,y."],
  ],
  "normal-distribution": [
    ["Definition", "Bell-shaped curve defined by μ and σ."],
    ["PDF and Properties", "Symmetric about μ, 68-95-99.7 rule."],
    ["Standard Normal Z", "Z = (X-μ)/σ has μ=0, σ=1."],
    ["Standardization", "Convert any normal problem to Z-scores."],
    ["Z-Table Usage", "Find P(Z<z) using standard normal table."],
    ["Interpolation", "Estimate probabilities between table entries."],
    ["Finding Probabilities", "Step-by-step probability calculations."],
  ],
  "normal-applications": [
    ["Given X, Find Probability", "Standardize and use Z-table."],
    ["Given Probability, Find X", "Use inverse Z and x = μ + zσ."],
    ["Percentile Problems", "Find values that separate top/bottom percentages."],
    ["Real-World Applications", "Manufacturing QC, exam grades, measurements."],
  ],
  "exam-prep": [
    ["Distribution Review", "Quick reference for all distributions covered."],
    ["Choosing the Right Distribution", "Decision tree for problem types."],
    ["Common Mistakes", "Errors students make on exams."],
    ["Exam Strategy", "Time management and problem-solving approach."],
  ],
};

function buildLessons(moduleId: string): ModuleData["lessons"] {
  const topics = LESSON_TOPICS[moduleId] || [];
  return topics.map(([title, desc], i) => ({
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title,
    order: i + 1,
    diagrams: [`/diagrams/${moduleId}-${i + 1}.svg`],
    examples: [],
    content: `## ${title}\n\n${desc}\n\n### Key Points\n\n- Study this topic carefully with the interactive examples.\n- Practice related questions in the practice section.\n- Use the step-by-step solutions when you get stuck.\n\n### Formula\n\nFor this topic, refer to the Formula Sheet in the Tools section.`,
  }));
}

const QUESTION_COUNTS: Record<string, { Easy: number; Medium: number; Hard: number }> = {
  foundations: { Easy: 10, Medium: 7, Hard: 3 },
  "random-variables": { Easy: 12, Medium: 12, Hard: 6 },
  "discrete-distributions": { Easy: 12, Medium: 14, Hard: 9 },
  "continuous-distributions": { Easy: 10, Medium: 12, Hard: 8 },
  "discrete-uniform": { Easy: 6, Medium: 6, Hard: 3 },
  "binomial-distribution": { Easy: 14, Medium: 16, Hard: 10 },
  "hypergeometric-distribution": { Easy: 10, Medium: 12, Hard: 8 },
  "geometric-distribution": { Easy: 9, Medium: 10, Hard: 6 },
  "poisson-distribution": { Easy: 12, Medium: 14, Hard: 9 },
  "joint-distributions": { Easy: 10, Medium: 12, Hard: 8 },
  "normal-distribution": { Easy: 15, Medium: 18, Hard: 12 },
  "normal-applications": { Easy: 12, Medium: 14, Hard: 9 },
  "exam-prep": { Easy: 12, Medium: 14, Hard: 9 },
};

function generateFoundationsQuestions(): QuestionData[] {
  const qs: QuestionData[] = [];
  let idx = 1;

  // Easy arithmetic
  const arith = [
    [15, 7, "+", 22], [50, 18, "-", 32], [8, 7, "*", 56], [84, 4, "/", 21],
    [3.5, 1.2, "+", 4.7], [10, 3.5, "-", 6.5], [0.25, 4, "*", 1], [7.2, 0.9, "/", 8],
    [100, 37, "-", 63], [6, 9, "*", 54],
  ];
  arith.forEach(([a, b, op, ans]) => {
    qs.push({
      id: `foundations_${String(idx++).padStart(3, "0")}`,
      moduleId: "foundations",
      topic: "Arithmetic",
      subtopic: "Basic Operations",
      difficulty: "Easy",
      type: "FillIn",
      question: `Calculate: ${a} ${op} ${b} = ____`,
      correctAnswer: String(ans),
      hints: ["Perform the operation step by step.", `Remember order of operations.`],
      tags: ["arithmetic"],
      solution: makeSolution(
        [{ title: "Calculate", content: `${a} ${op} ${b} = ${ans}`, explanation: "Basic arithmetic operation." }],
        String(ans)
      ),
    });
  });

  // Combinations
  const combs = [
    [5, 2, 10], [8, 3, 56], [10, 4, 210], [6, 0, 1], [7, 7, 1],
    [9, 2, 36], [12, 3, 220],
  ];
  combs.forEach(([n, r, ans]) => {
    qs.push({
      id: `foundations_${String(idx++).padStart(3, "0")}`,
      moduleId: "foundations",
      topic: "Combinations",
      subtopic: "nCr",
      difficulty: idx <= 15 ? "Medium" : "Medium",
      type: "FillIn",
      question: `Calculate C(${n}, ${r}) = ____`,
      correctAnswer: String(ans),
      hints: [`C(n,r) = n! / (r!(n-r)!)`, `C(${n},${r}) = ${n}!/(${r}!×${n - r}!)`],
      tags: ["combinations"],
      solution: makeSolution(
        [
          { title: "Formula", content: `C(${n},${r}) = ${n}!/(${r}!×${n - r}!)`, explanation: "Combination formula." },
          { title: "Calculate", content: `C(${n},${r}) = ${ans}`, explanation: "Compute factorials and divide." },
        ],
        String(ans)
      ),
    });
  });

  // Factorials
  [3, 4, 5, 6].forEach((n) => {
    qs.push({
      id: `foundations_${String(idx++).padStart(3, "0")}`,
      moduleId: "foundations",
      topic: "Factorials",
      subtopic: "n!",
      difficulty: "Easy",
      type: "FillIn",
      question: `Calculate ${n}! = ____`,
      correctAnswer: String(factorial(n)),
      hints: [`${n}! = ${Array.from({ length: n }, (_, i) => i + 1).join(" × ")}`],
      tags: ["factorial"],
      solution: makeSolution(
        [{ title: "Expand", content: `${n}! = ${factorial(n)}`, explanation: "Multiply all integers from 1 to n." }],
        String(factorial(n))
      ),
    });
  });

  // Hard
  qs.push({
    id: `foundations_${String(idx++).padStart(3, "0")}`,
    moduleId: "foundations",
    topic: "Permutations",
    subtopic: "nPr",
    difficulty: "Hard",
    type: "FillIn",
    question: "How many ways can 4 people be arranged in a line from 8 people? P(8,4) = ____",
    correctAnswer: String(permutation(8, 4)),
    hints: ["P(n,r) = n!/(n-r)!", "Order matters in permutations."],
    tags: ["permutations"],
    solution: makeSolution(
      [
        { title: "Formula", content: "P(8,4) = 8!/4! = 8×7×6×5", explanation: "Permutation formula." },
        { title: "Result", content: `P(8,4) = ${permutation(8, 4)}`, explanation: "Multiply descending factors." },
      ],
      String(permutation(8, 4))
    ),
  });

  qs.push({
    id: `foundations_${String(idx++).padStart(3, "0")}`,
    moduleId: "foundations",
    topic: "Percentages",
    subtopic: "Calculation",
    difficulty: "Hard",
    type: "MCQ",
    question: "What is 15% of 240?",
    options: [
      { label: "A", value: "36" },
      { label: "B", value: "30" },
      { label: "C", value: "42" },
      { label: "D", value: "24" },
    ],
    correctAnswer: "A",
    hints: ["Convert 15% to 0.15", "Multiply 0.15 × 240"],
    tags: ["percentages"],
    solution: makeSolution(
      [
        { title: "Convert", content: "15% = 0.15", explanation: "Divide percent by 100." },
        { title: "Multiply", content: "0.15 × 240 = 36", explanation: "Calculate the percentage." },
      ],
      "36"
    ),
  });

  qs.push({
    id: `foundations_${String(idx++).padStart(3, "0")}`,
    moduleId: "foundations",
    topic: "Set Theory",
    subtopic: "Union",
    difficulty: "Hard",
    type: "MCQ",
    question: "If |A|=20, |B|=15, and |A∩B|=5, what is |A∪B|?",
    options: [
      { label: "A", value: "30" },
      { label: "B", value: "35" },
      { label: "C", value: "25" },
      { label: "D", value: "40" },
    ],
    correctAnswer: "A",
    hints: ["|A∪B| = |A| + |B| - |A∩B|"],
    tags: ["sets"],
    solution: makeSolution(
      [
        { title: "Formula", content: "|A∪B| = |A| + |B| - |A∩B|", explanation: "Inclusion-exclusion principle." },
        { title: "Calculate", content: "|A∪B| = 20 + 15 - 5 = 30", explanation: "Substitute values." },
      ],
      "30"
    ),
  });

  return qs.slice(0, 20);
}

function generateBinomialQuestions(): QuestionData[] {
  const qs: QuestionData[] = [];
  let idx = 1;

  const easyCases = [
    [5, 0.5, 3], [4, 1 / 6, 2], [8, 0.7, 6], [10, 0.05, 1], [6, 0.8, 4],
    [5, 0.6, 3], [7, 0.3, 2], [4, 0.25, 1], [5, 0.9, 4], [6, 0.4, 3],
    [8, 0.5, 3], [10, 0.2, 2], [12, 0.5, 6], [7, 0.5, 4],
  ];

  easyCases.forEach(([n, p, x]) => {
    const prob = roundTo(binomialPmf(n as number, p as number, x as number), 5);
    const opts = [prob, roundTo(prob * 1.5, 5), roundTo(prob * 0.5, 5), roundTo(prob * 2, 5)]
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort(() => Math.random() - 0.5);
    while (opts.length < 4) opts.push(roundTo(prob + opts.length * 0.01, 5));
    const labels = ["A", "B", "C", "D"];
    const correctIdx = opts.indexOf(prob);
    qs.push({
      id: `binomial_${String(idx++).padStart(3, "0")}`,
      moduleId: "binomial-distribution",
      topic: "Binomial Distribution",
      subtopic: "Basic Probability",
      difficulty: "Easy",
      type: "MCQ",
      question: `In ${n} independent trials with success probability ${p}, what is P(X=${x})?`,
      options: labels.map((l, i) => ({ label: l, value: String(opts[i]) })),
      correctAnswer: labels[correctIdx],
      hints: [`n=${n}, p=${p}, x=${x}`, "Use P(X=x) = C(n,x) p^x (1-p)^(n-x)"],
      tags: ["binomial", "pmf"],
      solution: makeSolution(
        [
          { title: "Identify", content: `n=${n}, p=${p}, x=${x}`, explanation: "Binomial parameters." },
          { title: "Formula", content: `P(X=${x}) = C(${n},${x}) × ${p}^${x} × ${(1 - (p as number)).toFixed(4)}^${(n as number) - (x as number)}`, explanation: "Binomial PMF." },
          { title: "Result", content: `P(X=${x}) = ${prob}`, explanation: "Final probability." },
        ],
        String(prob),
        ["Forgetting the combination factor", "Using wrong exponent for (1-p)"]
      ),
    });
  });

  const mediumCases = [
    { n: 6, p: 0.4, type: "atleast", x: 2 },
    { n: 15, p: 0.05, type: "more", x: 3 },
    { n: 10, p: 0.6, type: "atmost", x: 5 },
    { n: 8, p: 0.3, type: "atmost", x: 1 },
    { n: 12, p: 0.25, type: "exact", x: 3 },
    { n: 7, p: 0.45, type: "atleast", x: 4 },
    { n: 10, p: 0.5, type: "between", x: 2, x2: 5 },
    { n: 12, p: 0.65, type: "atleast", x: 8 },
    { n: 20, p: 0.02, type: "atmost", x: 2 },
    { n: 10, p: 0.7, type: "atleast_pct", x: 7 },
    { n: 6, p: 0.5, type: "exact", x: 3 },
    { n: 9, p: 0.2, type: "atleast", x: 2 },
    { n: 11, p: 0.35, type: "exact", x: 4 },
    { n: 8, p: 0.15, type: "atleast", x: 2 },
    { n: 14, p: 0.4, type: "atmost", x: 6 },
    { n: 5, p: 0.6, type: "exact", x: 2 },
  ];

  mediumCases.forEach((c) => {
    let prob = 0;
    let qText = "";
    if (c.type === "exact") {
      prob = binomialPmf(c.n, c.p, c.x);
      qText = `P(X=${c.x})`;
    } else if (c.type === "atleast") {
      prob = binomialAtLeast(c.n, c.p, c.x);
      qText = `P(X≥${c.x})`;
    } else if (c.type === "atmost") {
      prob = binomialCdf(c.n, c.p, c.x);
      qText = `P(X≤${c.x})`;
    } else if (c.type === "more") {
      prob = binomialAtLeast(c.n, c.p, c.x + 1);
      qText = `P(X>${c.x})`;
    } else if (c.type === "between") {
      prob = binomialCdf(c.n, c.p, c.x2!) - binomialCdf(c.n, c.p, c.x - 1);
      qText = `P(${c.x}≤X≤${c.x2})`;
    } else if (c.type === "atleast_pct") {
      prob = binomialAtLeast(c.n, c.p, c.x);
      qText = `P(at least ${c.x} successes)`;
    }
    prob = roundTo(prob, 5);
    qs.push({
      id: `binomial_${String(idx++).padStart(3, "0")}`,
      moduleId: "binomial-distribution",
      topic: "Binomial Distribution",
      subtopic: "Cumulative Probability",
      difficulty: "Medium",
      type: "ProblemSolving",
      question: `${c.n} trials with p=${c.p}. Find ${qText}.`,
      correctAnswer: String(prob),
      hints: ["Identify if you need PMF or CDF", `n=${c.n}, p=${c.p}`],
      tags: ["binomial", "cumulative"],
      solution: makeSolution(
        [
          { title: "Setup", content: `n=${c.n}, p=${c.p}`, explanation: "Binomial experiment." },
          { title: "Calculate", content: `${qText} = ${prob}`, explanation: "Sum appropriate PMF values." },
        ],
        String(prob)
      ),
    });
  });

  const hardCases = [
    [15, 0.35, 5], [8, 0.15, 2], [50, 0.02, 2], [12, 0.35, 0, 0], [20, 0.4, 0, 0],
    [10, 0.25, 7], [100, 0.05, 2], [12, 0.25, 3],
  ];
  hardCases.forEach(([n, p, x, mean, var_]) => {
    if (mean === 0) {
      const mu = (n as number) * (p as number);
      const v = (n as number) * (p as number) * (1 - (p as number));
      qs.push({
        id: `binomial_${String(idx++).padStart(3, "0")}`,
        moduleId: "binomial-distribution",
        topic: "Binomial Distribution",
        subtopic: "Expected Value",
        difficulty: "Hard",
        type: "FillIn",
        question: `For n=${n}, p=${p}, the variance σ² = ____ (round to 2 decimals)`,
        correctAnswer: String(roundTo(v, 2)),
        hints: ["σ² = np(1-p)", `μ = ${mu}`],
        tags: ["binomial", "variance"],
        solution: makeSolution(
          [
            { title: "Mean", content: `μ = np = ${roundTo(mu, 2)}`, explanation: "Expected value." },
            { title: "Variance", content: `σ² = np(1-p) = ${roundTo(v, 2)}`, explanation: "Binomial variance." },
          ],
          String(roundTo(v, 2))
        ),
      });
    } else {
      const prob = roundTo(binomialAtLeast(n as number, p as number, x as number), 5);
      qs.push({
        id: `binomial_${String(idx++).padStart(3, "0")}`,
        moduleId: "binomial-distribution",
        topic: "Binomial Distribution",
        subtopic: "Advanced",
        difficulty: "Hard",
        type: "ProblemSolving",
        question: `Find P(X≥${x}) for n=${n}, p=${p}.`,
        correctAnswer: String(prob),
        hints: ["Sum PMF from x to n"],
        tags: ["binomial"],
        solution: makeSolution(
          [{ title: "Calculate", content: `P(X≥${x}) = ${prob}`, explanation: "Cumulative from x." }],
          String(prob)
        ),
      });
    }
  });

  while (qs.length < 40) {
    const n = 8 + (qs.length % 5);
    const p = 0.3 + (qs.length % 4) * 0.1;
    const x = qs.length % 4;
    const prob = roundTo(binomialPmf(n, p, x), 5);
    qs.push({
      id: `binomial_${String(idx++).padStart(3, "0")}`,
      moduleId: "binomial-distribution",
      topic: "Binomial Distribution",
      subtopic: "Practice",
      difficulty: qs.length <= 30 ? "Easy" : "Medium",
      type: "FillIn",
      question: `P(X=${x}) for n=${n}, p=${p}: ____`,
      correctAnswer: String(prob),
      hints: ["Use binomial PMF"],
      tags: ["binomial"],
      solution: makeSolution([{ title: "Result", content: String(prob), explanation: "PMF calculation." }], String(prob)),
    });
  }

  return qs.slice(0, 40);
}

function generateNormalQuestions(moduleId: string, count: { Easy: number; Medium: number; Hard: number }): QuestionData[] {
  const qs: QuestionData[] = [];
  let idx = 1;
  const prefix = moduleId === "normal-applications" ? "normal_app" : "normal";

  const easyCases = [
    [100, 15, 115, "less"], [50, 10, 65, "less"], [0, 1, 1.5, "less"], [0, 1, 2.0, "greater"],
    [75, 8, 85, "greater"], [30, 5, 25, "less"], [0, 1, -1.5, "less"], [100, 20, 130, "greater"],
    [60, 12, 50, 70, "between"], [0, 1, -1, 1, "between"],
  ];

  easyCases.forEach((c) => {
    let prob = 0;
    let qText = "";
    if (c.length === 5) {
      prob = normalCdf(c[4] as number, c[0] as number, c[1] as number) - normalCdf(c[3] as number, c[0] as number, c[1] as number);
      qText = `μ=${c[0]}, σ=${c[1]}. Find P(${c[3]}<X<${c[4]}).`;
    } else if (c[3] === "less") {
      prob = normalCdf(c[2] as number, c[0] as number, c[1] as number);
      qText = `μ=${c[0]}, σ=${c[1]}. Find P(X<${c[2]}).`;
    } else {
      prob = 1 - normalCdf(c[2] as number, c[0] as number, c[1] as number);
      qText = `μ=${c[0]}, σ=${c[1]}. Find P(X>${c[2]}).`;
    }
    prob = roundTo(prob, 4);
    const z = c.length === 4 ? zScore(c[2] as number, c[0] as number, c[1] as number) : 0;
    qs.push({
      id: `${prefix}_${String(idx++).padStart(3, "0")}`,
      moduleId,
      topic: "Normal Distribution",
      subtopic: "Finding Probabilities",
      difficulty: "Easy",
      type: "ProblemSolving",
      question: qText,
      correctAnswer: String(prob),
      hints: ["Standardize: Z = (X-μ)/σ", z ? `Z = ${roundTo(z, 2)}` : "Use Z-table"],
      tags: ["normal", "z-score"],
      solution: makeSolution(
        [
          { title: "Standardize", content: z ? `Z = ${roundTo(z, 4)}` : "Convert to Z", explanation: "Z-score formula." },
          { title: "Probability", content: `P = ${prob}`, explanation: "Use standard normal CDF." },
        ],
        String(prob)
      ),
    });
  });

  const mediumCases = [
    [100, 15, 85, 115], [50, 10, 60], [75, 8, 80], [30, 5, 22, 38],
    [100, 15, 85], [0, 1, -2, 1], [60, 12, 70], [50, 10, 35, 65],
  ];
  mediumCases.forEach((c) => {
    let prob = 0;
    let qText = "";
    if (c.length === 4 && typeof c[2] === "number" && typeof c[3] === "number") {
      prob = normalCdf(c[3], c[0], c[1]) - normalCdf(c[2], c[0], c[1]);
      qText = `μ=${c[0]}, σ=${c[1]}. P(${c[2]}<X<${c[3]})?`;
    } else if (c.length === 3) {
      prob = 1 - normalCdf(c[2], c[0], c[1]);
      qText = `μ=${c[0]}, σ=${c[1]}. P(X>${c[2]})?`;
    }
    prob = roundTo(prob, 4);
    qs.push({
      id: `${prefix}_${String(idx++).padStart(3, "0")}`,
      moduleId,
      topic: "Normal Distribution",
      subtopic: "Applications",
      difficulty: "Medium",
      type: "ProblemSolving",
      question: qText,
      correctAnswer: String(prob),
      hints: ["Standardize each boundary"],
      tags: ["normal"],
      solution: makeSolution([{ title: "Result", content: String(prob), explanation: "Z-table lookup." }], String(prob)),
    });
  });

  // Hard: exam grade problem
  if (moduleId === "normal-applications") {
    const z = inverseNormalCdf(0.88);
    const grade = Math.ceil(74 + z * 7);
    qs.push({
      id: `${prefix}_${String(idx++).padStart(3, "0")}`,
      moduleId,
      topic: "Normal Applications",
      subtopic: "Percentiles",
      difficulty: "Hard",
      type: "ProblemSolving",
      question: "Exam grades: μ=74, σ=7. If 12% get A's (top 12%), what is the lowest A grade?",
      correctAnswer: String(grade),
      hints: ["Top 12% means P(Z>z)=0.12", "Find z for P(Z<z)=0.88"],
      tags: ["normal", "percentile"],
      solution: makeSolution(
        [
          { title: "Find z", content: `P(Z<z)=0.88, z≈${roundTo(z, 3)}`, explanation: "Use inverse normal." },
          { title: "Convert", content: `x = 74 + ${roundTo(z, 3)}×7 = ${roundTo(74 + z * 7, 2)}`, explanation: "x = μ + zσ" },
          { title: "Round", content: `Lowest A = ${grade}`, explanation: "Round up to whole grade." },
        ],
        String(grade),
        ["Using 0.12 directly", "Rounding down"]
      ),
    });
  }

  const hardExtras = [
    [3.0, 0.5, 2.3, "less"], [3.0, 0.005, 2.99, 3.01, "between"], [40, 2, 43, "greater"],
    [300, 50, 362, "greater"], [500, 100, 650, "percentile"],
  ];
  hardExtras.forEach((c) => {
    let prob = 0;
    let ans = "";
    let qText = "";
    if (c[4] === "between") {
      prob = normalCdf(c[3] as number, c[0] as number, c[1] as number) - normalCdf(c[2] as number, c[0] as number, c[1] as number);
      ans = String(roundTo(1 - prob, 4));
      qText = `μ=${c[0]}, σ=${c[1]}. P(outside ${c[2]}-${c[3]})?`;
    } else if (c[4] === "percentile") {
      const z = zScore(c[2] as number, c[0] as number, c[1] as number);
      ans = String(roundTo(normalCdf(c[2] as number, c[0] as number, c[1] as number) * 100, 1));
      qText = `SAT: μ=${c[0]}, σ=${c[1]}. Percentile for score ${c[2]}?`;
    } else {
      prob = normalCdf(c[2] as number, c[0] as number, c[1] as number);
      ans = String(roundTo(prob, 4));
      qText = `μ=${c[0]}, σ=${c[1]}. P(X<${c[2]})?`;
    }
    qs.push({
      id: `${prefix}_${String(idx++).padStart(3, "0")}`,
      moduleId,
      topic: "Normal Distribution",
      subtopic: "Advanced",
      difficulty: "Hard",
      type: "ProblemSolving",
      question: qText,
      correctAnswer: ans,
      hints: ["Standardize carefully"],
      tags: ["normal"],
      solution: makeSolution([{ title: "Answer", content: ans, explanation: "Full calculation." }], ans),
    });
  });

  const total = count.Easy + count.Medium + count.Hard;
  while (qs.length < total) {
    const mu = 50 + (qs.length % 50);
    const sigma = 5 + (qs.length % 10);
    const x = mu + (qs.length % 3 - 1) * sigma;
    const prob = roundTo(normalCdf(x, mu, sigma), 4);
    const diff = qs.length < count.Easy + 10 ? "Easy" : qs.length < count.Easy + count.Medium + 10 ? "Medium" : "Hard";
    qs.push({
      id: `${prefix}_${String(idx++).padStart(3, "0")}`,
      moduleId,
      topic: "Normal Distribution",
      subtopic: "Practice",
      difficulty: diff as QuestionData["difficulty"],
      type: "FillIn",
      question: `μ=${mu}, σ=${sigma}. P(X<${x}) = ____`,
      correctAnswer: String(prob),
      hints: ["Z = (X-μ)/σ"],
      tags: ["normal"],
      solution: makeSolution([{ title: "Result", content: String(prob), explanation: "CDF." }], String(prob)),
    });
  }

  return qs.slice(0, total);
}

function generateGenericQuestions(moduleId: string, topic: string, counts: { Easy: number; Medium: number; Hard: number }): QuestionData[] {
  const qs: QuestionData[] = [];
  let idx = 1;
  const total = counts.Easy + counts.Medium + counts.Hard;
  const difficulties: QuestionData["difficulty"][] = [
    ...Array(counts.Easy).fill("Easy"),
    ...Array(counts.Medium).fill("Medium"),
    ...Array(counts.Hard).fill("Hard"),
  ] as QuestionData["difficulty"][];

  const generators: Record<string, () => { question: string; answer: string; solution: Solution; hints: string[] }> = {
    "poisson-distribution": () => {
      const lambda = 2 + (idx % 5);
      const x = idx % 4;
      const p = roundTo(poissonPmf(lambda, x), 5);
      return {
        question: `Poisson with λ=${lambda}. Find P(X=${x}).`,
        answer: String(p),
        hints: [`λ=${lambda}`, "P(X=x) = e^(-λ) λ^x / x!"],
        solution: makeSolution([{ title: "PMF", content: `P(X=${x}) = ${p}`, explanation: "Poisson formula." }], String(p)),
      };
    },
    "hypergeometric-distribution": () => {
      const N = 50, K = 10, n = 5, x = idx % 3;
      const p = roundTo(hypergeometricPmf(N, K, n, x), 5);
      return {
        question: `Population N=${N}, K=${K} successes. Sample n=${n} without replacement. P(X=${x})?`,
        answer: String(p),
        hints: ["Use hypergeometric PMF", "Sampling without replacement"],
        solution: makeSolution([{ title: "Result", content: String(p), explanation: "Hypergeometric PMF." }], String(p)),
      };
    },
    "geometric-distribution": () => {
      const p = 0.2 + (idx % 5) * 0.1;
      const x = 1 + (idx % 5);
      const prob = roundTo(geometricPmf(p, x), 5);
      return {
        question: `Geometric with p=${roundTo(p, 1)}. P(first success on trial ${x})?`,
        answer: String(prob),
        hints: ["P(X=x) = p(1-p)^(x-1)"],
        solution: makeSolution([{ title: "PMF", content: String(prob), explanation: "Geometric formula." }], String(prob)),
      };
    },
    "joint-distributions": () => {
      const p = roundTo(0.1 + (idx % 5) * 0.05, 2);
      return {
        question: `Joint table: P(X=1,Y=1)=${p}, P(X=1)=0.4. Find P(Y=1|X=1).`,
        answer: String(roundTo(p / 0.4, 3)),
        hints: ["P(Y|X) = P(X,Y)/P(X)"],
        solution: makeSolution([{ title: "Conditional", content: `P(Y=1|X=1) = ${p}/0.4`, explanation: "Conditional probability." }], String(roundTo(p / 0.4, 3))),
      };
    },
    "discrete-uniform": () => {
      const n = 4 + (idx % 4);
      return {
        question: `Fair die with ${n} sides. P(X=2)?`,
        answer: String(roundTo(1 / n, 4)),
        hints: ["Each outcome has probability 1/n"],
        solution: makeSolution([{ title: "Uniform", content: `P(X=2) = 1/${n}`, explanation: "Equal probability." }], String(roundTo(1 / n, 4))),
      };
    },
    "random-variables": () => ({
      question: `A coin is tossed 3 times. Let X = number of heads. Is X discrete or continuous?`,
      answer: "discrete",
      hints: ["X takes values 0, 1, 2, 3", "Countable values = discrete"],
      solution: makeSolution([{ title: "Classification", content: "X is discrete", explanation: "X takes finite countable values." }], "discrete"),
    }),
    "discrete-distributions": () => {
      const vals = [0.1, 0.2, 0.3, 0.25, 0.15];
      const sum = vals.reduce((a, b) => a + b, 0);
      return {
        question: `PMF: P(0)=0.1, P(1)=0.2, P(2)=0.3, P(3)=0.25, P(4)=0.15. Valid PMF? Answer yes or no.`,
        answer: sum === 1 ? "yes" : "no",
        hints: ["Sum of all probabilities must equal 1", `Sum = ${sum}`],
        solution: makeSolution([{ title: "Check sum", content: `ΣP(x) = ${sum}`, explanation: "Valid PMF requires sum = 1." }], sum === 1 ? "yes" : "no"),
      };
    },
    "continuous-distributions": () => ({
      question: `For continuous RV X, is P(X = 5) equal to 0? Answer yes or no.`,
      answer: "yes",
      hints: ["Single point probability is 0 for continuous distributions"],
      solution: makeSolution([{ title: "Property", content: "P(X=5) = 0", explanation: "Continuous RVs have zero point mass." }], "yes"),
    }),
    "exam-prep": () => ({
      question: `Which distribution models "number of defects in a fixed interval" — binomial or poisson?`,
      answer: "poisson",
      hints: ["Rare events in fixed interval → Poisson", "Fixed n trials → Binomial"],
      solution: makeSolution([{ title: "Choice", content: "Poisson", explanation: "Counting rare events over interval." }], "poisson"),
    }),
  };

  const gen = generators[moduleId] || generators["random-variables"];

  for (let i = 0; i < total; i++) {
    const { question, answer, solution, hints } = gen();
    const diff = difficulties[i];
    const type: QuestionData["type"] = i % 3 === 0 ? "MCQ" : i % 3 === 1 ? "FillIn" : "ProblemSolving";
    const q: QuestionData = {
      id: `${moduleId.replace(/-/g, "_")}_${String(idx++).padStart(3, "0")}`,
      moduleId,
      topic,
      subtopic: "Practice",
      difficulty: diff,
      type,
      question,
      correctAnswer: type === "MCQ" ? "A" : answer,
      hints,
      tags: [moduleId],
      solution,
    };
    if (type === "MCQ") {
      const wrong = [roundTo(parseFloat(answer) * 1.2, 4), roundTo(parseFloat(answer) * 0.8, 4), roundTo(parseFloat(answer) + 0.1, 4)]
        .map(String)
        .filter((v) => v !== answer && !isNaN(parseFloat(v)));
      const opts = [answer, ...wrong.slice(0, 3)];
      while (opts.length < 4) opts.push(String(opts.length));
      q.options = ["A", "B", "C", "D"].map((l, j) => ({ label: l, value: opts[j] }));
      q.correctAnswer = "A";
    }
    qs.push(q);
  }
  return qs;
}

function main() {
  ensureDirs();

  // Modules
  MODULE_DEFS.forEach((def) => {
    const module: ModuleData = { ...def, lessons: buildLessons(def.id) };
    fs.writeFileSync(path.join(MODULES_DIR, `module-${String(def.order).padStart(2, "0")}.json`), JSON.stringify(module, null, 2));
  });

  // Questions
  const allQuestions: QuestionData[] = [];
  allQuestions.push(...generateFoundationsQuestions());
  allQuestions.push(...generateBinomialQuestions());
  allQuestions.push(...generateNormalQuestions("normal-distribution", QUESTION_COUNTS["normal-distribution"]));
  allQuestions.push(...generateNormalQuestions("normal-applications", QUESTION_COUNTS["normal-applications"]));

  Object.entries(QUESTION_COUNTS).forEach(([moduleId, counts]) => {
    if (["foundations", "binomial-distribution", "normal-distribution", "normal-applications"].includes(moduleId)) return;
    const mod = MODULE_DEFS.find((m) => m.id === moduleId);
    allQuestions.push(...generateGenericQuestions(moduleId, mod?.title || moduleId, counts));
  });

  // Group by module and write
  const byModule: Record<string, QuestionData[]> = {};
  allQuestions.forEach((q) => {
    if (!byModule[q.moduleId]) byModule[q.moduleId] = [];
    byModule[q.moduleId].push(q);
  });

  Object.entries(byModule).forEach(([moduleId, questions]) => {
    fs.writeFileSync(path.join(QUESTIONS_DIR, `${moduleId}.json`), JSON.stringify(questions, null, 2));
  });

  // Exams
  const allIds = allQuestions.map((q) => q.id);
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
  for (let e = 1; e <= 3; e++) {
    const exam = {
      id: `mock-exam-${e}`,
      name: `Mock Exam ${e}`,
      description: `Full practice exam ${e} covering all topics.`,
      questionIds: shuffle(allIds).slice(0, 20),
      timeLimit: 60,
      passingScore: 70,
    };
    fs.writeFileSync(path.join(DATA_DIR, "exams", `mock-exam-${e}.json`), JSON.stringify(exam, null, 2));
  }

  // Formulas
  const formulas = {
    categories: [
      {
        category: "Discrete Distributions",
        items: [
          { name: "Binomial", formula: "P(X=x) = C(n,x)p^x(1-p)^{n-x}", variables: "n=trials, p=success prob, x=successes", mean: "μ=np", variance: "σ²=np(1-p)" },
          { name: "Hypergeometric", formula: "P(X=x) = C(K,x)C(N-K,n-x)/C(N,n)", variables: "N=population, K=successes, n=sample", mean: "μ=nK/N", variance: "σ²=n(K/N)(1-K/N)(N-n)/(N-1)" },
          { name: "Geometric", formula: "P(X=x) = p(1-p)^{x-1}", variables: "p=success prob, x=trial of first success", mean: "μ=1/p", variance: "σ²=(1-p)/p²" },
          { name: "Poisson", formula: "P(X=x) = e^{-λ}λ^x/x!", variables: "λ=rate", mean: "μ=λ", variance: "σ²=λ" },
          { name: "Uniform", formula: "P(X=x) = 1/n", variables: "n=equally likely outcomes", mean: "μ=(n+1)/2", variance: "σ²=(n²-1)/12" },
        ],
      },
      {
        category: "Continuous Distributions",
        items: [
          { name: "Normal", formula: "f(x) = (1/σ√2π)e^{-((x-μ)²/2σ²)}", variables: "μ=mean, σ=std dev", mean: "μ", variance: "σ²" },
          { name: "Standardization", formula: "Z = (X-μ)/σ", variables: "Z~N(0,1)", mean: "0", variance: "1" },
        ],
      },
      {
        category: "Combinatorics",
        items: [
          { name: "Combination", formula: "C(n,r) = n!/(r!(n-r)!)", variables: "Order doesn't matter", mean: "", variance: "" },
          { name: "Permutation", formula: "P(n,r) = n!/(n-r)!", variables: "Order matters", mean: "", variance: "" },
        ],
      },
    ],
  };
  fs.writeFileSync(path.join(DATA_DIR, "formulas.json"), JSON.stringify(formulas, null, 2));

  console.log(`Generated ${MODULE_DEFS.length} modules, ${allQuestions.length} questions, 3 exams`);
}

main();
