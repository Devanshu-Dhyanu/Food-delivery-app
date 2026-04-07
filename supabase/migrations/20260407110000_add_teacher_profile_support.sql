/*
  # Add teacher support to user profiles

  1. Changes
    - Adds `user_role` to distinguish students and teachers
    - Adds `cabin_number` for teacher cabin details

  2. Backfill
    - Existing profiles default to `student`
*/

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS user_role text;

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS cabin_number text;

UPDATE public.user_profiles
SET user_role = 'student'
WHERE user_role IS NULL;

ALTER TABLE public.user_profiles
ALTER COLUMN user_role SET DEFAULT 'student';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_user_role_check'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_user_role_check
    CHECK (user_role IN ('student', 'teacher'));
  END IF;
END $$;
