import { Resend } from "resend";
import { emailFrom, emailReplyTo, resendApiKey } from "@/lib/email/config";
import {
  teamInviteEmailHtml,
  teamInviteEmailSubject,
  teamInviteEmailText,
  type TeamInviteEmailProps,
} from "@/lib/email/templates/team-invite";

export type SendTeamInviteResult = {
  id: string;
};

/** Send a branded team invite via Resend (never Supabase's built-in mailer). */
export async function sendTeamInviteEmail(
  props: TeamInviteEmailProps
): Promise<SendTeamInviteResult> {
  const resend = new Resend(resendApiKey());

  const { data, error } = await resend.emails.send({
    from: emailFrom(),
    to: props.inviteeEmail,
    replyTo: emailReplyTo(),
    subject: teamInviteEmailSubject(props),
    html: teamInviteEmailHtml(props),
    text: teamInviteEmailText(props),
  });

  if (error) {
    throw new Error(error.message || "Failed to send invite email");
  }
  if (!data?.id) {
    throw new Error("Resend did not return a message id");
  }

  return { id: data.id };
}
