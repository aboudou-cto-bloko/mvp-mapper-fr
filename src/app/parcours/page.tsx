import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Stepper } from "@/components/stepper";

export const metadata: Metadata = { title: "Parcours · MVP Mapper" };

export default function ParcoursPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
        <Stepper current={4} />
        <h1 className="text-3xl font-bold tracking-tight">Bientôt disponible</h1>
        <p className="text-base text-muted">
          Cette étape arrive très vite. Ta carte MVP est déjà sauvegardée sur cet appareil.
        </p>
        <Link
          href="/carte"
          className="flex min-h-11 w-fit items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold hover:bg-primary-soft"
        >
          ← Retour à la carte MVP
        </Link>
      </main>
    </>
  );
}
