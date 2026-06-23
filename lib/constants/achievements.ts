export const ACHIEVEMENT_DEFINITIONS = [
  {
    key: "first_lesson",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "📖",
  },
  {
    key: "first_module",
    name: "Module Master",
    description: "Complete your first module quiz",
    icon: "⭐",
  },
  {
    key: "questions_50",
    name: "Practice Starter",
    description: "Solve 50 practice questions",
    icon: "🎯",
  },
  {
    key: "questions_100",
    name: "Century Club",
    description: "Solve 100 practice questions",
    icon: "💯",
  },
  {
    key: "questions_250",
    name: "Problem Solver",
    description: "Solve 250 practice questions",
    icon: "🧠",
  },
  {
    key: "streak_3",
    name: "On a Roll",
    description: "Maintain a 3-day streak",
    icon: "🔥",
  },
  {
    key: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🏆",
  },
  {
    key: "binomial_master",
    name: "Binomial Master",
    description: "Pass the Binomial Distribution module",
    icon: "📊",
  },
  {
    key: "normal_master",
    name: "Normal Master",
    description: "Pass the Normal Distribution module",
    icon: "📈",
  },
  {
    key: "exam_pass",
    name: "Exam Ready",
    description: "Pass a mock exam",
    icon: "🎓",
  },
  {
    key: "all_modules",
    name: "StatMaster",
    description: "Complete all 12 modules",
    icon: "👑",
  },
] as const;

export type AchievementKey = (typeof ACHIEVEMENT_DEFINITIONS)[number]["key"];

export function getAchievementDef(key: string) {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.key === key);
}

export const MODULE_ICONS: Record<string, string> = {
  foundations: "🔢",
  "random-variables": "🎲",
  "discrete-distributions": "📊",
  "continuous-distributions": "📉",
  "discrete-uniform": "⚖️",
  "binomial-distribution": "🎯",
  "hypergeometric-distribution": "🔍",
  "geometric-distribution": "⏳",
  "poisson-distribution": "⚡",
  "joint-distributions": "🔗",
  "normal-distribution": "📈",
  "normal-applications": "🏭",
  "exam-prep": "🎓",
};
