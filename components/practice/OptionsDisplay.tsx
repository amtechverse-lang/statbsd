"use client";

import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

export function OptionsDisplay({
  options,
  selected,
  onSelect,
  disabled,
  showCorrect,
  correctAnswer,
}: {
  options: Option[];
  selected?: string;
  onSelect: (label: string) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  correctAnswer?: string;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isSelected = selected === opt.label;
        const isCorrect = showCorrect && opt.label === correctAnswer;
        const isWrong = showCorrect && isSelected && opt.label !== correctAnswer;
        return (
          <button
            key={opt.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.label)}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-colors",
              isSelected && !showCorrect && "border-primary bg-primary/5",
              isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
              isWrong && "border-red-500 bg-red-50 dark:bg-red-950",
              !disabled && !showCorrect && "hover:bg-muted cursor-pointer",
              disabled && "cursor-default"
            )}
          >
            <span className="font-semibold mr-2">{opt.label}.</span>
            {opt.value}
          </button>
        );
      })}
    </div>
  );
}
