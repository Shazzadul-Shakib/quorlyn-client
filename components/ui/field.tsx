import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  Ref,
} from "react";
import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-subtle transition-colors focus:border-primary focus:outline-2 focus:outline-offset-1 focus:outline-ring disabled:opacity-60 disabled:bg-surface-2";

export function Label({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-0.5">
      <span className="text-fg text-sm font-medium">
        {children}
        {required ? <span className="text-danger ml-0.5">*</span> : null}
      </span>
      {hint ? <span className="text-fg-subtle text-xs">{hint}</span> : null}
    </label>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <Label htmlFor={htmlFor} hint={hint} required={required}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-danger-fg text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Textarea({
  className,
  ref,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }) {
  return <textarea ref={ref} className={cn(CONTROL, "min-h-24 resize-y", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, "appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  description,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  return (
    <label className="border-border hover:bg-surface-2 flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5 transition-colors">
      <input
        type="checkbox"
        className={cn("accent-primary mt-0.5 h-4 w-4", className)}
        {...props}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-fg text-sm font-medium">{label}</span>
        {description ? (
          <span className="text-fg-subtle text-xs">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
