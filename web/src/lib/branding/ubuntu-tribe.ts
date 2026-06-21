/** Ubuntu Tribe brand constants — single source for documents, exports, and AI prompts. */

export const UBUNTU_TRIBE = {
  name: "Ubuntu Tribe",
  legalEntity: "Ophir Ubuntu International Ltd",
  tagline: "Real value. Digital access. Shared opportunity.",
  heroSubhead:
    "Connecting trusted physical gold with modern digital tools — so more people can protect value, access opportunity, and move with confidence.",
  website: "https://utribe.one",
  websiteDisplay: "utribe.one",
  giftPortal: "https://gift.utribe.app",
  giftPortalDisplay: "gift.utribe.app",
  contactEmail: "info@utribe.one",
  colors: {
    purple: "#9035F4",
    purpleLight: "#9359FF",
    gold: "#C9932A",
  },
  products: "GIFT · Utribe Wallet · UbuntuVerse · Ubuntu Capital · Ubuntu Academy",
  classification: "STRICTLY PRIVATE AND CONFIDENTIAL — Ubuntu Tribe",
} as const;

export function documentFooterLine(): string {
  return `${UBUNTU_TRIBE.name} — ${UBUNTU_TRIBE.tagline} · ${UBUNTU_TRIBE.websiteDisplay}`;
}

export function documentLetterheadMarkdown(title: string, documentTypeLabel: string): string {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `---
**${UBUNTU_TRIBE.name}**
*${UBUNTU_TRIBE.tagline}*

${UBUNTU_TRIBE.websiteDisplay} · ${UBUNTU_TRIBE.giftPortalDisplay} · ${UBUNTU_TRIBE.contactEmail}

---

**Document:** ${title}
**Type:** ${documentTypeLabel}
**Date:** ${date}
**Classification:** ${UBUNTU_TRIBE.classification}

---

`;
}

export function documentFooterMarkdown(): string {
  return `

---

**${UBUNTU_TRIBE.name}**
${UBUNTU_TRIBE.legalEntity}
${UBUNTU_TRIBE.tagline}

${UBUNTU_TRIBE.website} · ${UBUNTU_TRIBE.giftPortal} · ${UBUNTU_TRIBE.contactEmail}

*${UBUNTU_TRIBE.products}*
`;
}
