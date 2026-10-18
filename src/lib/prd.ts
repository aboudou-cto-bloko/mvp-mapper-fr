import { MUST_MAX_CONSEILLE, ETAPES_MIN, type Fonctionnalite, type Projet } from "./projet";

const VIDE = "?";

/** Retire les caractères de contrôle et de format (bidi, zéro-largeur) ; tab/retour ligne deviennent des espaces. */
function sansControle(s: string): string {
  return s.replace(/[\t\n\r]/g, " ").replace(/[\p{Cc}\p{Cf}]/gu, "");
}

/** Une ligne de texte inerte en Markdown : espaces normalisés, caractères spéciaux échappés. */
export function nettoyer(s: string): string {
  const plat = sansControle(s).replace(/\s+/g, " ").trim();
  return plat
    .replace(/[\\`*_[\]<>]/g, "\\$&")
    .replace(/^[#|]/, "\\$&")
    .replace(/^([-+])(?= )/, "\\$1")
    .replace(/^(\d+)([.)])(?= )/, "$1\\$2");
}

const ligne = nettoyer;

/** Texte multiligne en citation Markdown (chaque ligne nettoyée). */
function bloc(s: string): string {
  const lignes = s.split(/\r?\n/).map(ligne);
  while (lignes.length > 0 && lignes[0] === "") lignes.shift();
  while (lignes.length > 0 && lignes[lignes.length - 1] === "") lignes.pop();
  if (lignes.length === 0) return VIDE;
  return lignes.map((l) => (l === "" ? ">" : `> ${l}`)).join("\n");
}

/** Texte à placer dans /feature "…" (lui-même dans un code inline). */
function pourPrompt(s: string): string {
  return sansControle(s).replace(/`/g, "").replace(/"/g, "'").replace(/\s+/g, " ").trim();
}

/** Au-delà de ces seuils, le PRD est compacté pour rester sous ~120 lignes. */
export const SEUIL_COMPACT_MUST = 12;
export const SEUIL_COMPACT_TOTAL = 30;

const APPAREILS: Record<NonNullable<Projet["appareil"]>, string> = {
  smartphone: "smartphone",
  ordinateur: "ordinateur",
  "les-deux": "smartphone et ordinateur",
};

function titres(fs: readonly Fonctionnalite[], categorie: Fonctionnalite["categorie"]): string[] {
  return fs.filter((f) => f.categorie === categorie).map((f) => f.titre);
}

function puces(items: readonly string[], compact = false): string {
  if (compact && items.length > 1) return `- ${items.map(ligne).join(" ; ")}`;
  return items.length === 0 ? `- ${VIDE}` : items.map((t) => `- ${ligne(t)}`).join("\n");
}

/** Répartit les Must en tranches : nombre = min(must, clamp(ceil(must/2), 3, 5)), reste aux premières. */
export function repartirTranches(musts: readonly string[]): string[][] {
  const m = musts.length;
  if (m === 0) return [];
  const n = Math.min(m, Math.min(5, Math.max(3, Math.ceil(m / 2))));
  const base = Math.floor(m / n);
  const reste = m % n;
  const tranches: string[][] = [];
  let debut = 0;
  for (let i = 0; i < n; i++) {
    const taille = base + (i < reste ? 1 : 0);
    tranches.push(musts.slice(debut, debut + taille));
    debut += taille;
  }
  return tranches;
}

export function nomFichierPrd(nom: string): string {
  const slug = nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `prd-${slug === "" ? "projet" : slug}.md`;
}

export function diagnosticPrd(p: Projet): { manques: string[]; avertissements: string[] } {
  const manques: string[] = [];
  const avertissements: string[] = [];
  if (p.nom.trim() === "") manques.push("Nom du projet manquant");
  if (titres(p.fonctionnalites, "must").length === 0) manques.push("Aucune fonctionnalité Must");
  const n = p.parcours.length;
  if (n === 0) manques.push("Parcours utilisateur vide");
  else if (n < ETAPES_MIN) {
    avertissements.push(`Parcours de ${n} étape${n > 1 ? "s" : ""} (conseil : ${ETAPES_MIN} à 7)`);
  }
  return { manques, avertissements };
}

export function genererPrd(p: Projet): string {
  const musts = titres(p.fonctionnalites, "must");
  const wonts = titres(p.fonctionnalites, "wont");
  const n = p.parcours.length;
  const nom = ligne(p.nom);
  const date = ligne(p.modifieLe.slice(0, 10));

  const compact = musts.length > SEUIL_COMPACT_MUST || p.fonctionnalites.length > SEUIL_COMPACT_TOTAL;
  const tranchesMust = repartirTranches(musts);

  // Compact : un critère par tranche de Must au lieu d'un par Must.
  const criteres: string[] = compact
    ? tranchesMust.map((g, i) => `- [ ] Tranche ${i + 1} : ${g.map(ligne).join(" ; ")} fonctionnent de bout en bout`)
    : musts.map((t) => `- [ ] ${ligne(t)} fonctionne de bout en bout`);
  if (p.connexion === "instable") criteres.push("- [ ] Utilisable sur connexion instable");
  if (p.appareil === "smartphone" || p.appareil === "les-deux") {
    criteres.push("- [ ] Utilisable sur smartphone (360 px)");
  }
  if (n > 0) criteres.push(`- [ ] Le parcours en ${n} étapes se déroule du début à la fin`);
  criteres.push("- [ ] Mesure de succès : [à compléter]", "- [ ] Budget de performance : [à compléter]");

  const tranches = tranchesMust
    .map((groupe) => groupe.map(pourPrompt).filter((t) => t !== ""))
    .filter((titresPrompt) => titresPrompt.length > 0)
    .map((titresPrompt, i) => `${i + 1}. \`/feature "${titresPrompt.join(" + ")}"\``);

  const questions = ["Prix ou modèle économique ?", "Cible utilisateur précise ?", "Stack et hébergement ?"];
  if (musts.length > MUST_MAX_CONSEILLE) {
    questions.push(`MVP trop gros : ${musts.length} Must (conseil ≤ ${MUST_MAX_CONSEILLE})`);
  }
  if (n < ETAPES_MIN) questions.push(`Parcours trop court : ${n} étape${n > 1 ? "s" : ""} (conseil : ${ETAPES_MIN} à 7)`);

  const sections: string[] = [
    `# PRD — ${nom === "" ? VIDE : nom}\n\n> Statut : brouillon généré par MVP Mapper le ${date === "" ? VIDE : date}`,
    `## Problème\n\n${bloc(p.probleme)}`,
    [
      "## Utilisateur",
      "",
      `- Cible : ${VIDE}`,
      `- Appareil : ${p.appareil ? APPAREILS[p.appareil] : VIDE}`,
      `- Connexion : ${p.connexion ?? VIDE}`,
    ].join("\n"),
    `## Parcours\n\n${n === 0 ? VIDE : p.parcours.map((e, i) => `${i + 1}. ${ligne(e.texte)}`).join("\n")}`,
    [
      "## Fonctionnalités",
      "",
      `**Must**\n${puces(musts)}`,
      "",
      `**Should**\n${puces(titres(p.fonctionnalites, "should"), compact)}`,
      "",
      `**Could**\n${puces(titres(p.fonctionnalites, "could"), compact)}`,
      "",
      `**Won't (v1)**\n${puces(wonts, compact)}`,
    ].join("\n"),
    `## Hors périmètre\n\n${wonts.length === 0 ? VIDE : puces(wonts, compact)}`,
    `## Critères de « terminé »\n\n${criteres.join("\n")}`,
    `## Tranches de construction\n\n${
      tranches.length === 0
        ? VIDE
        : `${tranches.join("\n")}\n\nOrdre à ajuster selon les dépendances. Les Should viennent après la v1.`
    }`,
    `## Questions ouvertes\n\n${questions.map((q) => `- ${q}`).join("\n")}`,
  ];

  return `${sections.join("\n\n")}\n`;
}
