-- Migration: key leaderboard by player_id instead of name
-- Run in Supabase Dashboard → SQL Editor

-- Main leaderboard
ALTER TABLE aurora_leaderboard
  ADD COLUMN IF NOT EXISTS player_id uuid;

-- Drop old name-based unique index, replace with player_id unique
DROP INDEX IF EXISTS lb_name_unique;
CREATE UNIQUE INDEX IF NOT EXISTS lb_playerid_unique ON aurora_leaderboard(player_id);

-- Allow nulls on old rows (existing rows have no player_id — they'll be replaced on next run)

-- 1HP leaderboard
ALTER TABLE aurora_leaderboard_1hp
  ADD COLUMN IF NOT EXISTS player_id uuid;

DROP INDEX IF EXISTS aurora_leaderboard_1hp_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS lb_1hp_playerid_unique ON aurora_leaderboard_1hp(player_id);

-- RLS: SELECT open to all, INSERT/UPDATE requires auth
DROP POLICY IF EXISTS "pub" ON aurora_leaderboard;
DROP POLICY IF EXISTS "pub" ON aurora_leaderboard_1hp;

CREATE POLICY "lb_select" ON aurora_leaderboard FOR SELECT USING (true);
CREATE POLICY "lb_write"  ON aurora_leaderboard FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = player_id);
CREATE POLICY "lb_update" ON aurora_leaderboard FOR UPDATE USING (auth.uid() = player_id) WITH CHECK (auth.uid() = player_id);

CREATE POLICY "lb_1hp_select" ON aurora_leaderboard_1hp FOR SELECT USING (true);
CREATE POLICY "lb_1hp_write"  ON aurora_leaderboard_1hp FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = player_id);
CREATE POLICY "lb_1hp_update" ON aurora_leaderboard_1hp FOR UPDATE USING (auth.uid() = player_id) WITH CHECK (auth.uid() = player_id);
