/** Server-only email configuration (Resend). */
export function emailFrom(): string {
  return process.env.EMAIL_FROM ?? "GrowthOS Buddy <hello@klarify.africa>";
}

export function emailReplyTo(): string | undefined {
  return process.env.EMAIL_REPLY_TO ?? "hello@klarify.africa";
}

export function resendApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  return key;
}

/** Absolute URL for brand logo in transactional email (matches /join page). */
export function brandLogoUrl(appUrl: string): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}/logo-email.png`;
}
