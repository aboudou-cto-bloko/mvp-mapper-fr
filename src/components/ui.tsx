import type { ReactNode } from "react";

export const champ =
  "min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base placeholder:text-muted";

export function Statut({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

/** Bandeau de message ; teinte ambre douce quand le MVP est trop gros. */
export function Bandeau({ trop, children }: { trop: boolean; children: ReactNode }) {
  return (
    <p
      className={`rounded-xl px-3 py-2 text-sm font-medium ${
        trop ? "bg-could-soft text-could-ink" : "bg-bg text-ink"
      }`}
    >
      {children}
    </p>
  );
}
