-- Track async AI draft generation so the UI can poll for completion/failure.
-- Generation now runs in a Netlify background function (15-minute limit) to
-- avoid the synchronous-function 504 timeout.
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS ai_generation_status TEXT,
  ADD COLUMN IF NOT EXISTS ai_generation_error TEXT;
