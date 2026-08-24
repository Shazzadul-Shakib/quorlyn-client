"use client";

import { useState } from "react";
import type { InputHTMLAttributes, Ref } from "react";
import { Input } from "./field";
import { Button } from "./button";
import { IconEye, IconEyeOff } from "./icons";
import { cn } from "@/lib/utils";

/** A password `Input` with a show/hide toggle. Drop-in replacement — same props, minus `type`. */
export function PasswordInput({
  className,
  ref,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { ref?: Ref<HTMLInputElement> }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-9", className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-0.5 h-7 w-7 -translate-y-1/2"
      >
        {visible ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}
      </Button>
    </div>
  );
}
