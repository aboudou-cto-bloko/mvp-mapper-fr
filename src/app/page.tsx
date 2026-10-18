import Link from "next/link";
import { MvpMapPreview } from "@/components/mvp-map-preview";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="flex flex-col items-start gap-6">
          <p className="rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary">
            Gratuit · En français · Sans compte
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
            De l&apos;idée au PRD qui tient en une page
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            Classe tes fonctionnalités en Must, Should, Could et Won&apos;t, trace ta ligne MVP,
            puis exporte un PRD.md prêt pour Claude Code.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/idee"
              className="flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-white hover:bg-primary/90"
            >
              Cartographier mon MVP
            </Link>
            <p className="text-sm text-muted">
              ≈ 10 minutes · Léger, utilisable avec une connexion lente
            </p>
          </div>
        </div>
        <MvpMapPreview />
      </main>
    </>
  );
}
