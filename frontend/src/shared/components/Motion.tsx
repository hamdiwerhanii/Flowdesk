"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform
} from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";

import { usePathname } from "@/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

type RevealProps = {
  children: ReactNode;
  index?: number;
  className?: string;
};

export function Reveal({ children, index = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: EASE,
        delay: Math.min(index, 12) * 0.05
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 0.9, ease: EASE });
    return () => controls.stop();
  }, [count, inView, value]);

  return (
    <motion.span ref={ref} className='tabular-nums'>
      {rounded}
    </motion.span>
  );
}

export function GrowBar({
  percent,
  className,
  index = 0
}: {
  percent: number;
  className?: string;
  index?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ width: 0 }}
      animate={{ width: `${percent}%` }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.15 + index * 0.06 }}
    />
  );
}

export function ActivePill({ layoutId }: { layoutId: string }) {
  return (
    <motion.span
      layoutId={layoutId}
      className='bg-primary shadow-primary/30 absolute inset-0 -z-10 rounded-xl shadow-md'
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
    />
  );
}
