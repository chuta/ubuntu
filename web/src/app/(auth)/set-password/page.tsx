import { redirect } from "next/navigation";

/** Legacy path — invite onboarding now lives at /join */
export default function SetPasswordPage() {
  redirect("/join");
}
