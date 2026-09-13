"use client";

import { useState } from "react";

export function ErrorText({ code, message }: { code?: string; message: string }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      {message}
      {code ? <span className="ml-2 font-mono text-xs opacity-70">{code}</span> : null}
    </p>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const look =
    variant === "primary"
      ? "bg-accent text-background hover:opacity-90"
      : "border border-line bg-panel text-foreground hover:bg-accent-soft";
  return (
    <button className={`${base} ${look} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export const inputClass =
  "w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

/** Kopieringsknapp med bekräftelse. Faller tillbaka på markering om clipboard saknas. */
export function CopyButton({ text, label = "Kopiera" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("fail");
    }
    setTimeout(() => setState("idle"), 1800);
  }
  return (
    <Button variant="ghost" type="button" onClick={copy}>
      {state === "done" ? "Kopierat" : state === "fail" ? "Markera och kopiera manuellt" : label}
    </Button>
  );
}
