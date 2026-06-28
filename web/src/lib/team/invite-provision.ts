import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTeamInviteEmail } from "@/lib/email/send-team-invite";
import type { UserRole } from "@/types/database";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type ProvisionInviteInput = {
  email: string;
  fullName: string;
  role: UserRole;
  inviterName: string;
};

export type ProvisionInviteResult = {
  userId: string;
  inviteUrl: string;
  emailSent: boolean;
  resendMessageId?: string;
};

/** Best-effort public origin for auth redirect links. */
export async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** Where Supabase sends the user after verifying the invite token. */
export function inviteCallbackUrl(origin: string) {
  return `${origin}/auth/callback?next=/join&type=invite`;
}

/**
 * Create (or refresh) a Supabase invite link and deliver it through Resend.
 * Does not call inviteUserByEmail — Supabase must never send its own mail.
 */
export async function provisionTeamInvite(
  input: ProvisionInviteInput
): Promise<ProvisionInviteResult> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!EMAIL_RE.test(email)) throw new Error("Enter a valid email address");
  if (!fullName) throw new Error("Enter the person's full name");

  const admin = createAdminClient();
  const origin = await appOrigin();
  const redirectTo = inviteCallbackUrl(origin);

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, is_active, invited_at")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile?.is_active && !existingProfile.invited_at) {
    throw new Error("That email already belongs to an active team member.");
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo,
      data: { full_name: fullName },
    },
  });

  if (linkError) {
    if (/already.*(registered|exist)|been registered/i.test(linkError.message)) {
      throw new Error("That email already has an account. Use Resend invite on their team row.");
    }
    throw new Error(linkError.message);
  }

  const inviteUrl = linkData.properties?.action_link;
  const userId = linkData.user?.id;
  if (!inviteUrl || !userId) {
    throw new Error("Could not generate an invite link. Try again.");
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      role: input.role,
      full_name: fullName,
      email,
      is_active: false,
      invited_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) throw new Error(profileError.message);

  let emailSent = false;
  let resendMessageId: string | undefined;

  try {
    const sent = await sendTeamInviteEmail({
      inviteeName: fullName,
      inviteeEmail: email,
      role: input.role,
      inviterName: input.inviterName,
      inviteUrl,
      appUrl: origin,
    });
    emailSent = true;
    resendMessageId = sent.id;
  } catch {
    // Caller may surface inviteUrl for manual copy if Resend fails.
  }

  return { userId, inviteUrl, emailSent, resendMessageId };
}
