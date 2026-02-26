'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">

      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-ink"
        >
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-11 w-full rounded-xl border bg-white px-4 text-sm text-ink',
          'placeholder:text-ink-subtle',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-surface-border hover:border-ink-subtle focus:ring-brand-500 focus:border-brand-500',
          'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted',
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-xs font-medium text-red-500" role="alert">
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-ink-subtle">
          {hint}
        </p>
      )}

    </div>
  );
});

export default Input;
