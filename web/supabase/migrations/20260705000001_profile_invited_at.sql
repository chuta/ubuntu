-- Track admin-invited users separately from self-registered sign-ups awaiting approval.
-- invited_at is set when an admin sends an invite; is_active stays false until the
-- invitee sets a password and completes their first sign-in.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.invited_at IS
  'Set when an admin invites this user. Cleared never — used with is_active to show invite status.';
