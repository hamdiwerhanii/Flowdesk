import type { LucideIcon } from "lucide-react";

import { Card } from "@/shared/components/ui/card";

type StatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint
}: StatCardProps) {
  return (
    <Card className='p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div className='space-y-1'>
          <p className='text-muted-foreground text-sm'>{label}</p>
          <p className='text-3xl font-semibold tabular-nums'>{value}</p>
        </div>
        <span className='bg-primary-soft text-primary rounded-lg p-2'>
          <Icon className='size-5' aria-hidden />
        </span>
      </div>
      {hint && <p className='text-muted-foreground mt-3 text-xs'>{hint}</p>}
    </Card>
  );
}
