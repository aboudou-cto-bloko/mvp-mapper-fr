const ETAPES = ["Idée", "Fonctionnalités", "Carte MVP", "Parcours", "Export"] as const;

export function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Progression">
      <ol className="flex items-center gap-2 sm:gap-4">
        {ETAPES.map((nom, i) => {
          const numero = i + 1;
          const active = numero === current;
          const passee = numero < current;
          return (
            <li
              key={nom}
              aria-current={active ? "step" : undefined}
              className={`flex items-center gap-2 text-sm ${
                active ? "flex-none font-semibold text-ink" : "hidden font-medium text-muted sm:flex"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  active
                    ? "bg-primary text-white"
                    : passee
                      ? "bg-primary-soft text-primary"
                      : "border border-line bg-surface text-muted"
                }`}
              >
                {passee ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2.5 7.5l3 3 6-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  numero
                )}
              </span>
              <span>
                {nom}
                {passee && <span className="sr-only"> (terminée)</span>}
              </span>
            </li>
          );
        })}
        <li className="ml-auto text-sm text-muted sm:hidden" aria-hidden="true">
          {current} / {ETAPES.length}
        </li>
      </ol>
    </nav>
  );
}
