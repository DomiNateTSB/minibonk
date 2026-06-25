// Supabase Edge Function — creates a Stripe Checkout session for Battle Pass purchase.
// Deploy: supabase functions deploy create-checkout
// Secrets needed: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

/* In-memory cooldown — prevents a single user from spamming Stripe checkout sessions */
const _cooldown = new Map<string, number>()
const COOLDOWN_MS = 60_000

function isRateLimited(userId: string): boolean {
  const last = _cooldown.get(userId) ?? 0
  if (Date.now() - last < COOLDOWN_MS) return true
  _cooldown.set(userId, Date.now())
  return false
}

const ALLOWED_ORIGINS = [
  'https://thornrift.com',
  'https://www.thornrift.com',
]

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

const PRODUCTS = {
  standard: {
    name: 'Thornrift — Battle Pass',
    description: 'Unlock the Season 1 Battle Pass. Level up every run and claim 100 exclusive rewards including Echoes, Runes, Elite Skins, and Titles.',
    price: 499,
  },
  premium: {
    name: 'Thornrift — Battle Pass Premium',
    description: 'Unlock the Battle Pass + instantly claim all rewards from Levels 1–25. Get a massive head start on Season 1.',
    price: 999,
  },
} as const

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    /* ── Verify the caller is an authenticated Supabase user ── */
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    /* Use anon client + user JWT to resolve the real user — cannot be spoofed */
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: authErr } = await userClient.auth.getUser()
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    if (isRateLimited(user.id)) {
      return new Response(JSON.stringify({ error: 'Too many requests — please wait 60 seconds.' }), {
        status: 429, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { tier } = await req.json() as { tier: 'standard' | 'premium' }

    if (!PRODUCTS[tier]) {
      return new Response(JSON.stringify({ error: `Invalid tier: ${tier}` }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    /* user_id comes from the verified JWT — not from client body */
    const product = PRODUCTS[tier]
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: product.name, description: product.description },
          unit_amount: product.price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://www.thornrift.com?bp_purchased=1&tier=${tier}`,
      cancel_url: 'https://www.thornrift.com',
      metadata: { user_id: user.id, tier },
      allow_promotion_codes: true,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-checkout error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
    })
  }
})
