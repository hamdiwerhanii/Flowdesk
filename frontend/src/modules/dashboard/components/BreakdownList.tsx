import { cn } from "@/lib/utils";
import { GrowBar } from "@/shared/components/Motion";

type BreakdownItem = {
  key: string;
  label: string;
  value: number;
  barClass: string;
};

export default function BreakdownList({ items }: { items: BreakdownItem[] }) {
  const max = Math.max(1, ...items.map(item => item.value));
  return (
    <ul className='space-y-4'>
      {items.map((item, index) => (
        <li key={item.key} className='space-y-1.5'>
          <div className='flex items-center justify-between text-sm'>
            <span className='flex items-center gap-2 font-medium'>
              <span
                className={cn("size-2 rounded-full", item.barClass)}
                aria-hidden
              />
              {item.label}
            </span>
            <span className='font-bold tabular-nums'>{item.value}</span>
          </div>
          <div className='bg-muted h-2 overflow-hidden rounded-full'>
            <GrowBar
              index={index}
              percent={(item.value / max) * 100}
              className={cn("h-full rounded-full", item.barClass)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
