import type { Metadata } from "next";
import { ExportPrd } from "@/components/export-prd";
import { SiteHeader } from "@/components/site-header";
import { Stepper } from "@/components/stepper";

export const metadata: Metadata = { title: "Export · MVP Mapper" };

export default function ExportPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
        <Stepper current={5} />
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Ton PRD est prêt</h1>
          <p className="text-base text-muted">
            Télécharge-le, puis donne-le à Claude Code pour lancer la première tranche.
          </p>
        </div>
        <ExportPrd />
      </main>
    </>
  );
}
