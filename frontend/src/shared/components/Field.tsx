"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Label } from "@/shared/components/Input";

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export default function Field({
  label,
  htmlFor,
  error,
  hint,
  children
}: FieldProps) {
  const t = useTranslations();
  const message = error && t.has(error) ? t(error) : error;

  return (
    <div className='space-y-1.5'>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {message ? (
        <p role='alert' className='text-danger text-xs'>
          {message}
        </p>
      ) : (
        hint && <p className='text-muted-foreground text-xs'>{hint}</p>
      )}
    </div>
  );
}
