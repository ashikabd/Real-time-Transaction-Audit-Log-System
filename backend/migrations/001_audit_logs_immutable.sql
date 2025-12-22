-- Migration: ensure audit_logs has created_at and is append-only
-- Adds created_at default and a trigger to prevent UPDATE/DELETE

-- add created_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='audit_logs' AND column_name='created_at'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
END$$;

-- create function to prevent updates/deletes
CREATE OR REPLACE FUNCTION prevent_audit_logs_modifications()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is immutable: updates and deletes are not allowed';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- drop existing trigger if present, then create
DROP TRIGGER IF EXISTS audit_logs_block_mods ON audit_logs;
CREATE TRIGGER audit_logs_block_mods
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_logs_modifications();
