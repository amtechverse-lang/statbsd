import { Card, CardContent } from "@/components/ui/card";

interface AchievementBadgeProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
    earnedAt?: string;
  };
  locked?: boolean;
}

export function AchievementBadge({ achievement, locked }: AchievementBadgeProps) {
  return (
    <Card className={locked ? "opacity-40" : ""}>
      <CardContent className="pt-4 text-center">
        <div className="text-3xl mb-2">{locked ? "🔒" : achievement.icon}</div>
        <p className="font-semibold text-sm">{achievement.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
      </CardContent>
    </Card>
  );
}
