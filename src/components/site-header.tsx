import Link from "next/link";
import { ID_APERCU_CARTE, NOM_SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-full text-base font-bold"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="10" className="fill-primary" />
            <path
              d="M8 23V10l8 8 8-8v13"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {NOM_SITE}
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-1 sm:gap-4">
          <a
            href={`/#${ID_APERCU_CARTE}`}
            className="flex min-h-11 items-center rounded-full px-2 text-sm font-medium text-muted hover:text-ink sm:px-3"
          >
            Comment ça marche
          </a>
          <Link
            href="/idee"
            className="flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Commencer
          </Link>
        </nav>
      </div>
    </header>
  );
}
