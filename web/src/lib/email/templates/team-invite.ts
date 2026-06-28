import { roleLabel } from "@/lib/auth/roles";
import { brandLogoUrl, BRAND_PURPLE } from "@/lib/email/config";
import type { UserRole } from "@/types/database";

export type TeamInviteEmailProps = {
  inviteeName: string;
  inviteeEmail: string;
  role: UserRole;
  inviterName: string;
  inviteUrl: string;
  appUrl: string;
};

export function teamInviteEmailSubject(props: TeamInviteEmailProps): string {
  return `${props.inviterName} invited you to GrowthOS`;
}

export function teamInviteEmailHtml(props: TeamInviteEmailProps): string {
  const role = roleLabel(props.role);
  const year = new Date().getFullYear();
  const logoUrl = brandLogoUrl(props.appUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>You're invited to Ubuntu GrowthOS</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td bgcolor="${BRAND_PURPLE}" style="background-color:${BRAND_PURPLE};padding:0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${BRAND_PURPLE}" style="background-color:${BRAND_PURPLE};">
                <tr>
                  <td style="padding:28px 32px;">
                    <img
                      src="${escapeHtml(logoUrl)}"
                      alt="Ubuntu Tribe"
                      width="160"
                      height="35"
                      style="display:block;margin:0 0 20px;border:0;outline:none;text-decoration:none;max-width:160px;height:auto;"
                    />
                    <h1 style="margin:0;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">You're invited to GrowthOS</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3f3f46;">
                Hi ${escapeHtml(props.inviteeName)},
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3f3f46;">
                <strong>${escapeHtml(props.inviterName)}</strong> has invited you to join
                <strong>GrowthOS</strong> — Ubuntu Tribe's commercial intelligence platform — as
                <strong>${escapeHtml(role)}</strong> team member.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#52525b;">
                Use the button below to accept your invitation, set a password for
                <strong>${escapeHtml(props.inviteeEmail)}</strong>, then sign in to get started.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:10px;background:#5B0888;">
                    <a href="${escapeHtml(props.inviteUrl)}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Accept invitation &amp; set password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#71717a;">
                This link expires in 24 hours. If it stops working, ask your admin to resend the invite.
              </p>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.5;color:#71717a;">
                Prefer a different email? You can
                <a href="${escapeHtml(props.appUrl)}/register" style="color:#5B0888;">create a new account</a>
                instead — an admin will still need to approve self-signups.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa;word-break:break-all;">
                Button not working? Paste this link into your browser:<br />
                <a href="${escapeHtml(props.inviteUrl)}" style="color:#5B0888;">${escapeHtml(props.inviteUrl)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa;">
                Sent by GrowthOS Buddy · Ubuntu Tribe commercial team · ${year}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function teamInviteEmailText(props: TeamInviteEmailProps): string {
  const role = roleLabel(props.role);
  return `Hi ${props.inviteeName},

${props.inviterName} invited you to GrowthOS as ${role}.

Accept your invitation and set a password for ${props.inviteeEmail}:
${props.inviteUrl}

This link expires in 24 hours.

Prefer a different email? Create a new account at ${props.appUrl}/register (admin approval required).

— GrowthOS Buddy, Ubuntu Tribe`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
