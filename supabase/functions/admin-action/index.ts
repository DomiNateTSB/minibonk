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

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: authErr } = await anonClient.auth.getUser()
    if (authErr || !user || !ADMIN_IDS.includes(user.id)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: CORS })
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SB_SERVICE_ROLE') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { action, payload } = await req.json()

    // ── Delete leaderboard entry ──
    if (action === 'delete_score') {
      const { player_id, table } = payload
      const t = table === '1hp' ? 'aurora_leaderboard_1hp' : 'aurora_leaderboard'
      const { error } = await admin.from(t).delete().eq('player_id', player_id)
      if (error) throw error
      return new Response(JSON.stringify({ ok: true }), { headers: CORS })
    }

    // ── Grant Battle Pass ──
    if (action === 'grant_bp') {
      const { player_id, tier } = payload // tier: 'standard' | 'premium'
      const update: Record<string, boolean> = { bp_owned: true }
      if (tier === 'premium') update.bp_premium = true
      const { error } = await admin.from('game_progress').upsert({
        player_id,
        ...update,
      }, { onConflict: 'player_id' })
      if (error) throw error
      return new Response(JSON.stringify({ ok: true }), { headers: CORS })
    }

    // ── Ban / delete user ──
    if (action === 'ban_user') {
      const { player_id } = payload
      // Delete all player data first
      await Promise.all([
        admin.from('game_progress').delete().eq('player_id', player_id),
        admin.from('game_stats').delete().eq('player_id', player_id),
        admin.from('game_achievements').delete().eq('player_id', player_id),
        admin.from('aurora_leaderboard').delete().eq('player_id', player_id),
        admin.from('aurora_leaderboard_1hp').delete().eq('player_id', player_id),
      ])
      // Delete auth user
      const { error } = await admin.auth.admin.deleteUser(player_id)
      if (error) throw error
      return new Response(JSON.stringify({ ok: true }), { headers: CORS })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: CORS })

  } catch (err) {
    console.error('admin-action error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS })
  }
})
