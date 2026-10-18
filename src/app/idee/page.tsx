import type { Metadata } from "next";
import { IdeeForm } from "@/components/idee-form";
import { SiteHeader } from "@/components/site-header";
import { Stepper } from "@/components/stepper";

export const metadata: Metadata = { title: "Ton idée · MVP Mapper" };

export default function IdeePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
        <Stepper current={1} />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Décris ton idée</h1>
          <p className="text-base text-muted">
            Quelques lignes suffisent. Tu pourras tout modifier plus tard.
          </p>
        </div>
        <IdeeForm />
      </main>
    </>
  );
}
