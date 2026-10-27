import { cn } from "@/lib/utils";

type BreakdownItem = {
  key: string;
  label: string;
  value: number;
  barClass: string;
};

export default function BreakdownList({ items }: { items: BreakdownItem[] }) {
  const max = Math.max(1, ...items.map(item => item.value));
  return (
    <ul className='space-y-3'>
      {items.map(item => (
        <li key={item.key} className='space-y-1'>
          <div className='flex justify-between text-sm'>
            <span>{item.label}</span>
            <span className='font-medium tabular-nums'>{item.value}</span>
          </div>
          <div className='bg-muted h-2 overflow-hidden rounded-full'>
            <div
              className={cn("h-full rounded-full", item.barClass)}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
