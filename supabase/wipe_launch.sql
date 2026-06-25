-- Launch wipe — run in Supabase Dashboard → SQL Editor
-- Clears all leaderboard entries and achievements before launch

TRUNCATE TABLE aurora_leaderboard;
TRUNCATE TABLE aurora_leaderboard_1hp;
TRUNCATE TABLE game_achievements;
