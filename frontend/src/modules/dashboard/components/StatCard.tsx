import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/shared/components/Card";
import { AnimatedNumber } from "@/shared/components/Motion";

type StatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
  tone?: "teal" | "indigo" | "amber" | "emerald";
};

const TONES = {
  teal: "from-teal-500 to-emerald-500 shadow-teal-500/30",
  indigo: "from-indigo-500 to-violet-500 shadow-indigo-500/30",
  amber: "from-amber-400 to-orange-500 shadow-amber-500/30",
  emerald: "from-emerald-500 to-green-600 shadow-emerald-500/30"
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "teal"
}: StatCardProps) {
  return (
    <Card
      interactive
      className='group relative flex h-full flex-col overflow-hidden p-5'
    >
      <div
        className='bg-primary/5 absolute -top-10 -right-10 size-32 rounded-full transition-transform duration-500 group-hover:scale-125'
        aria-hidden
      />
      <div className='relative flex items-start justify-between gap-3'>
        <div className='space-y-2'>
          <p className='text-muted-foreground text-sm font-medium'>{label}</p>
          <p className='text-4xl font-extrabold tracking-tight'>
            <AnimatedNumber value={value} />
          </p>
        </div>
        <span
          className={cn(
            "grid size-11 place-items-center rounded-2xl bg-linear-to-br text-white shadow-lg transition-transform duration-300 group-hover:rotate-6",
            TONES[tone]
          )}
        >
          <Icon className='size-5' aria-hidden />
        </span>
      </div>
      {hint && (
        <p className='text-muted-foreground relative mt-auto pt-4 text-xs'>
          {hint}
        </p>
      )}
    </Card>
  );
}
