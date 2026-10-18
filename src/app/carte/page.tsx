import type { Metadata } from "next";
import { CarteMvp } from "@/components/carte-mvp";
import { SiteHeader } from "@/components/site-header";
import { Stepper } from "@/components/stepper";

export const metadata: Metadata = { title: "Carte MVP · MVP Mapper" };

export default function CartePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
        <Stepper current={3} />
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Ta carte MVP</h1>
          <p className="text-base text-muted">
            Tout ce qui est en Must sera construit en premier.
          </p>
          <p className="w-fit rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
            Version 1 = les Must
          </p>
        </div>
        <CarteMvp />
      </main>
    </>
  );
}
