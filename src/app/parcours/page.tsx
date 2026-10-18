import type { Metadata } from "next";
import { ParcoursEditeur } from "@/components/parcours-editeur";
import { SiteHeader } from "@/components/site-header";
import { Stepper } from "@/components/stepper";

export const metadata: Metadata = { title: "Parcours · MVP Mapper" };

export default function ParcoursPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
        <Stepper current={4} />
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Le parcours de ton utilisateur</h1>
          <p className="text-base text-muted">
            De la première visite au résultat : 4 à 7 étapes.
          </p>
        </div>
        <ParcoursEditeur />
      </main>
    </>
  );
}
