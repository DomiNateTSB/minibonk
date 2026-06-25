import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_IDS = [
  'c59e044b-932b-4278-9da6-338d621ecbbc',
  '382ac6b8-823e-42c9-b582-98bd5065bf8f',
]

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS })
    }

    // Verify caller is an authenticated admin
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: authErr } = await anonClient.auth.getUser()
    if (authErr || !user || !ADMIN_IDS.includes(user.id)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: CORS })
    }

    // Service role client — never exposed to client
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Fetch all data in parallel
    const [usersRes, progressRes, statsRes, lbRes, lb1hpRes] = await Promise.all([
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from('game_progress').select('player_id, bp_owned, bp_premium, souls, best_wave, best_kills'),
      admin.from('game_stats').select('player_id, classes_played, total_runs, total_kills, total_boss_kills, best_wave'),
      admin.from('aurora_leaderboard').select('name, wave, kills, level, class_name, player_id').order('wave', { ascending: false }).order('kills', { ascending: false }).limit(20),
      admin.from('aurora_leaderboard_1hp').select('name, wave, kills, level, class_name, player_id').order('wave', { ascending: false }).limit(10),
    ])

    const users = usersRes.data?.users ?? []
    const progress = progressRes.data ?? []
    const stats = statsRes.data ?? []
    const lb = lbRes.data ?? []
    const lb1hp = lb1hpRes.data ?? []

    // Index by player_id for fast lookup
    const progressMap = Object.fromEntries(progress.map(p => [p.player_id, p]))
    const statsMap    = Object.fromEntries(stats.map(s => [s.player_id, s]))

    // Overview counts
    const bpOwners   = progress.filter(p => p.bp_owned).length
    const bpPremium  = progress.filter(p => p.bp_premium).length
    const totalRuns  = stats.reduce((a, s) => a + (s.total_runs || 0), 0)
    const totalKills = stats.reduce((a, s) => a + (s.total_kills || 0), 0)
    const totalBossKills = stats.reduce((a, s) => a + (s.total_boss_kills || 0), 0)

    // Class distribution — count unique players per class
    const classCounts: Record<string, number> = {}
    for (const s of stats) {
      const cp = s.classes_played || {}
      for (const cls of Object.keys(cp)) {
        if (cp[cls]) classCounts[cls] = (classCounts[cls] || 0) + 1
      }
    }

    // BP buyers enriched with email + created_at
    const bpBuyers = users
      .filter(u => progressMap[u.id]?.bp_owned)
      .map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        bp_premium: progressMap[u.id]?.bp_premium ?? false,
        best_wave: progressMap[u.id]?.best_wave ?? 0,
        total_runs: statsMap[u.id]?.total_runs ?? 0,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Full player list
    const players = users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at,
      bp_owned: progressMap[u.id]?.bp_owned ?? false,
      bp_premium: progressMap[u.id]?.bp_premium ?? false,
      souls: progressMap[u.id]?.souls ?? 0,
      best_wave: progressMap[u.id]?.best_wave ?? 0,
      total_runs: statsMap[u.id]?.total_runs ?? 0,
      total_kills: statsMap[u.id]?.total_kills ?? 0,
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Recent signups (last 7 days grouped by day)
    const now = Date.now()
    const signupsByDay: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      signupsByDay[d.toISOString().slice(0, 10)] = 0
    }
    for (const u of users) {
      const day = u.created_at?.slice(0, 10)
      if (day && day in signupsByDay) signupsByDay[day]++
    }

    return new Response(JSON.stringify({
      overview: {
        totalUsers: users.length,
        bpOwners,
        bpPremium,
        totalRuns,
        totalKills,
        totalBossKills,
      },
      classCounts,
      bpBuyers,
      players,
      leaderboard: lb,
      leaderboard1hp: lb1hp,
      signupsByDay,
    }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('admin-stats error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: CORS,
    })
  }
})
