import { AlertCircle } from "lucide-react";

/** Form-level error (as opposed to a single field's error). */
export default function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role='alert'
      className='bg-danger-soft text-danger flex items-start gap-2 rounded-lg px-3 py-2 text-sm'
    >
      <AlertCircle className='mt-0.5 size-4 shrink-0' aria-hidden />
      <span>{message}</span>
    </div>
  );
}
