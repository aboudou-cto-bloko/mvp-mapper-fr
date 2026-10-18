import type { ReactNode } from "react";

export const champ =
  "min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base placeholder:text-muted";

export function Statut({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
