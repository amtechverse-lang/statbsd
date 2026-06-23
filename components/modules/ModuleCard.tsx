import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODULE_ICONS } from "@/lib/constants/achievements";

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  isLocked: boolean;
  lessonsCount: number;
  practiceCount: number;
  order: number;
}

export function ModuleCard({
  id,
  title,
  description,
  progress,
  isLocked,
  lessonsCount,
  practiceCount,
  order,
}: ModuleCardProps) {
  const icon = MODULE_ICONS[id] || "📚";
  const content = (
    <Card
      className={cn(
        "hover:shadow-lg transition-shadow h-full",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <CardTitle className="text-lg">
                Module {order}: {title}
              </CardTitle>
              <CardDescription className="line-clamp-2">{description}</CardDescription>
            </div>
          </div>
          {isLocked && <Lock className="text-muted-foreground h-5 w-5" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{lessonsCount} lessons</span>
            <span>{practiceCount} questions</span>
            <span>{progress}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLocked) return content;
  return <Link href={`/modules/${id}`}>{content}</Link>;
}
