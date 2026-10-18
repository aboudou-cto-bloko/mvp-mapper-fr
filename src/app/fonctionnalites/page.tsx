import type { Metadata } from "next";
import { FonctionnalitesEditeur } from "@/components/fonctionnalites-editeur";
import { SiteHeader } from "@/components/site-header";
import { Stepper } from "@/components/stepper";

export const metadata: Metadata = { title: "Fonctionnalités · MVP Mapper" };

export default function FonctionnalitesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
        <Stepper current={2} />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Classe tes fonctionnalités</h1>
          <p className="text-base text-muted">
            Une ligne par fonctionnalité, puis classe-la : que faut-il absolument dans la version 1 ?
          </p>
        </div>
        <FonctionnalitesEditeur />
      </main>
    </>
  );
}
