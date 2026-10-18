import { MUST_MAX_CONSEILLE, ETAPES_MIN, type Fonctionnalite, type Projet, type SuggestionCle } from "./projet";
import { contraintesActives } from "./suggestions";

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

const BLOC_LIGNES_MAX = 10;

/** Texte multiligne en citation Markdown (chaque ligne nettoyée). */
function bloc(s: string): string {
  const brutes = s.split(/\r?\n/).map(ligne);
  while (brutes.length > 0 && brutes[0] === "") brutes.shift();
  while (brutes.length > 0 && brutes[brutes.length - 1] === "") brutes.pop();
  if (brutes.length === 0) return VIDE;
  // Une seule ligne vide consécutive ; au-delà du plafond, le reste est replié sur la dernière ligne.
  const lignes = brutes.filter((l, i) => l !== "" || brutes[i - 1] !== "");
  if (lignes.length > BLOC_LIGNES_MAX) {
    const reste = lignes.splice(BLOC_LIGNES_MAX - 1).filter((l) => l !== "");
    lignes.push(reste.join(" "));
  }
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

export type Tranche = { titre: string; elements: string[] };

const SUFFIXE_TRANCHE = " — vérifier que l'app reste utilisable après cette tranche";

const LIBELLES_CONTRAINTES: Record<SuggestionCle, string> = {
  "mobile-money": "Mobile Money",
  whatsapp: "WhatsApp",
  "hors-ligne": "hors-ligne",
  "faible-debit": "faible débit",
};

const CRITERES_CONTRAINTES: Record<SuggestionCle, string> = {
  "mobile-money": "Le paiement Mobile Money est testé en bac à sable (échec et annulation compris)",
  whatsapp: "Les messages WhatsApp partent avec un texte en français relu",
  "hors-ligne": "Une action interrompue par une coupure se reprend sans perte",
  "faible-debit": "Page principale légère, testée en connexion lente",
};

const CONTEXTE_PAIEMENT = "paiement Mobile Money (bac à sable d'abord, gestion de l'échec)";
const CONTEXTE_WHATSAPP = "messages WhatsApp en français (modèle de message, repli si l'envoi échoue)";

function normaliserMots(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-\u2010-\u2015_]+/g, " ")
    .replace(/\s+/g, " ");
}

const MOTS_PAIEMENT = ["paiement", "mobile money"];
const MOTS_PAIEMENT_MOBILE_MONEY = ["momo", "orange money", "mtn", "moov"];
const MOTS_MESSAGE = ["whatsapp", "sms", "notification", "rappel", "e mail", "email", "mail"];

function motsPaiement(contraintes: readonly SuggestionCle[]): readonly string[] {
  return contraintes.includes("mobile-money") ? [...MOTS_PAIEMENT, ...MOTS_PAIEMENT_MOBILE_MONEY] : MOTS_PAIEMENT;
}

function contient(titre: string, mots: readonly string[]): boolean {
  const t = normaliserMots(titre);
  return mots.some((m) => t.includes(m));
}

function estIntegration(titre: string, contraintes: readonly SuggestionCle[]): boolean {
  return contient(titre, motsPaiement(contraintes)) || contient(titre, MOTS_MESSAGE);
}

type TrancheInterne = { titre: string; elements: string[]; musts: string[] };

function promptDe(titresMust: readonly string[], contextes: readonly string[]): string {
  const base = titresMust.map(pourPrompt).filter((t) => t !== "").join(" + ");
  const ctx = contextes.length > 0 ? ` — ${contextes.join(" ; ")}` : "";
  return `/feature "${base}${ctx}${SUFFIXE_TRANCHE}"`;
}

function planifier(fs: readonly Fonctionnalite[], contraintes: readonly SuggestionCle[]): TrancheInterne[] {
  const musts = titres(fs, "must").filter((t) => pourPrompt(t) !== "");
  if (musts.length === 0) return [];
  const estInteg = (t: string) => estIntegration(t, contraintes);
  const [premier, ...reste] = musts;
  const tranches: TrancheInterne[] = [
    {
      titre: "Socle",
      musts: [premier],
      elements: [
        `/feature "Structure de l'app et première page fonctionnelle affichant : ${pourPrompt(premier)} ${estInteg(premier) ? "" : " (sans paiements ni messages)"}${SUFFIXE_TRANCHE}"`,
      ],
    },
  ];
  if (reste.length === 0) return tranches;

  // Tri stable : cœur puis intégrations.
  const coeur = reste.filter((t) => !estInteg(t));
  const integrations = reste.filter(estInteg);
  const ordonnes = [...coeur, ...integrations];

  const n = Math.min(4, Math.ceil(ordonnes.length / 2));
  // Tailles équilibrées : le surplus est réparti sur les premières tranches.
  const base = Math.floor(ordonnes.length / n);
  const surplus = ordonnes.length % n;
  let debut = 0;
  for (let i = 0; i < n; i++) {
    const taille = base + (i < surplus ? 1 : 0);
    const groupe = ordonnes.slice(debut, debut + taille);
    debut += taille;
    const nbIntegr = groupe.filter(estInteg).length;
    const contextes: string[] = [];
    if (contraintes.includes("mobile-money") && groupe.some((t) => contient(t, motsPaiement(contraintes)))) {
      contextes.push(CONTEXTE_PAIEMENT);
    }
    if (contraintes.includes("whatsapp") && groupe.some((t) => contient(t, MOTS_MESSAGE))) {
      contextes.push(CONTEXTE_WHATSAPP);
    }
    const titre = nbIntegr === 0 ? "Cœur" : nbIntegr === groupe.length ? "Intégrations" : "Cœur et intégrations";
    tranches.push({ titre, musts: groupe, elements: [promptDe(groupe, contextes)] });
  }
  return tranches;
}

/** Tranches de construction : Socle, puis Must « cœur » avant « intégrations », 5 tranches max. */
export function planifierTranches(fs: readonly Fonctionnalite[], contraintes: readonly SuggestionCle[]): Tranche[] {
  return planifier(fs, contraintes).map(({ titre, elements }) => ({ titre, elements }));
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
  const contraintes = contraintesActives(p.fonctionnalites);
  const tranchesMust = planifier(p.fonctionnalites, contraintes);

  // Compact : un critère par tranche de Must au lieu d'un par Must.
  const criteres: string[] = compact
    ? tranchesMust.map((g, i) => `- [ ] Tranche ${i + 1} : ${g.musts.map(ligne).join(" ; ")} fonctionnent de bout en bout`)
    : musts.map((t) => `- [ ] ${ligne(t)} fonctionne de bout en bout`);
  if (p.connexion === "instable") criteres.push("- [ ] Utilisable sur connexion instable");
  if (p.appareil === "smartphone" || p.appareil === "les-deux") {
    criteres.push("- [ ] Utilisable sur smartphone (360 px)");
  }
  if (n > 0) criteres.push(`- [ ] Le parcours en ${n} étapes se déroule du début à la fin`);
  for (const c of contraintes) criteres.push(`- [ ] ${CRITERES_CONTRAINTES[c]}`);
  criteres.push("- [ ] Mesure de succès : [à compléter]", "- [ ] Budget de performance : [à compléter]");

  const tranches = tranchesMust.map((t, i) => `${i + 1}. ${t.titre} : \`${t.elements.join(" ")}\``);
  const shoulds = titres(p.fonctionnalites, "should");
  const apresV1 =
    shoulds.length === 0
      ? "les Could"
      : `les Should (${shoulds.slice(0, 5).map(ligne).join(", ")}${shoulds.length > 5 ? ", …" : ""}), puis les Could`;

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
      `- Contraintes locales : ${contraintes.length === 0 ? "aucune renseignée" : contraintes.map((c) => LIBELLES_CONTRAINTES[c]).join(", ")}`,
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
        : `${tranches.join("\n")}\n\nOrdre proposé, à ajuster selon les dépendances. Après la v1 : ${apresV1}.`
    }`,
    `## Questions ouvertes\n\n${questions.map((q) => `- ${q}`).join("\n")}`,
  ];

  return `${sections.join("\n\n")}\n`;
}
