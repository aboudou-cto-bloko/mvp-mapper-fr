import Link from "next/link";
import { Logo } from "@/components/logo";
import { ID_APERCU_CARTE, NOM_SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-full text-base font-bold"
        >
          <Logo size={36} />
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
