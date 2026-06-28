"use client";

import { Button } from "@/components/ui/button";
import { signOutUser } from "@/lib/session/sign-out";
import { ShieldAlert } from "lucide-react";

export function AccountInactive({ email }: { email?: string | null }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <ShieldAlert className="h-6 w-6 text-amber-600" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Account not active</h1>
        <p className="mt-2 text-sm text-gray-500">
          {email ? <span className="font-medium text-gray-700">{email}</span> : "This account"} is
          awaiting approval or has been deactivated by an administrator. Please contact your GrowthOS
          admin to request access.
        </p>
        <Button className="mt-6 w-full" variant="outline" onClick={() => signOutUser()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
