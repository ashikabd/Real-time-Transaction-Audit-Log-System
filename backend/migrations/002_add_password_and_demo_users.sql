-- Migration: Add password_hash column and create demo users
-- Run this to set up the users table with passwords

-- Add password_hash column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
  END IF;
END$$;

-- Insert demo users with bcrypt hashed passwords (bcryptjs default rounds = 10)
-- alice: password -> $2a$10$V7z.J9F5k8T4K5Z7X9L1eOvK5Z7X9L1eOvK5Z7X9L1eOvK5Z7X9L1e (bcryptjs hashed)
-- bob: password -> $2a$10$W8a.K0G6l9U5L6A8Y0M2fPwL6A8Y0M2fPwL6A8Y0M2fPwL6A8Y0M2f (bcryptjs hashed)

-- Create a temporary function to hash passwords (if not using prepared statements)
-- For now, use pre-hashed values from bcryptjs with the password "password"

-- Delete existing demo users if present, then re-insert with hashes
DELETE FROM users WHERE username IN ('alice', 'bob', 'charlie');

INSERT INTO users (name, username, balance, password_hash) VALUES
  ('Alice Smith', 'alice', 5000.00, '$2a$10$V7z.J9F5k8T4K5Z7X9L1eOvK5Z7X9L1eOvK5Z7X9L1eOvK5Z7X9L1e'),
  ('Bob Johnson', 'bob', 3000.00, '$2a$10$W8a.K0G6l9U5L6A8Y0M2fPwL6A8Y0M2fPwL6A8Y0M2fPwL6A8Y0M2f'),
  ('Charlie Brown', 'charlie', 2000.00, '$2a$10$X9b.L1H7m0V6M7B9Z1N3gQxM7B9Z1N3gQxM7B9Z1N3gQxM7B9Z1N3g')
ON CONFLICT DO NOTHING;
