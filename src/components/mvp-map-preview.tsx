import { ID_APERCU_CARTE } from "@/lib/site";

type Tone = "primary" | "should" | "could";

const TONES: Record<Tone, { badge: string; dot: string }> = {
  primary: { badge: "bg-primary-soft text-primary", dot: "bg-primary" },
  should: { badge: "bg-should-soft text-should-ink", dot: "bg-should" },
  could: { badge: "bg-could-soft text-could-ink", dot: "bg-could" },
};

function Groupe({
  titre,
  tone,
  items,
}: {
  titre: string;
  tone: Tone;
  items: string[];
}) {
  const t = TONES[tone];
  return (
    <section aria-label={titre} className="flex flex-col gap-2">
      <span
        className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${t.badge}`}
      >
        {titre}
      </span>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium"
          >
            <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${t.dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MvpMapPreview() {
  return (
    <div
      id={ID_APERCU_CARTE}
      className="scroll-mt-4 rounded-3xl border border-line bg-surface p-4 sm:p-6"
    >
      <p className="mb-4 text-sm font-semibold text-muted">
        Exemple : appli de réservation
      </p>
      <div className="flex flex-col gap-4">
        <Groupe
          titre="Must"
          tone="primary"
          items={[
            "Choisir un créneau",
            "Payer l'acompte par Mobile Money",
            "Rappel WhatsApp au client",
          ]}
        />
        <div className="flex items-center gap-3" role="separator" aria-label="Ligne MVP">
          <span className="h-0.5 flex-1 bg-primary" />
          <span className="text-sm font-bold tracking-wide text-primary">LIGNE MVP</span>
          <span className="h-0.5 flex-1 bg-primary" />
        </div>
        <Groupe titre="Should" tone="should" items={["Avis clients", "Statistiques simples"]} />
        <Groupe titre="Could" tone="could" items={["Mode sombre"]} />
      </div>
    </div>
  );
}
