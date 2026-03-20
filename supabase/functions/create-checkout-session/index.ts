import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pageId, slug } = await req.json()

    if (!pageId || !slug) {
      return new Response(JSON.stringify({ error: 'pageId and slug are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the caller owns this page
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: page } = await supabaseUser.from('pages').select('id').eq('id', pageId).single()
    if (!page) {
      return new Response(JSON.stringify({ error: 'Page not found or unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Detect country from client IP for regional pricing
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : null
    let country = 'US'
    if (ip && ip !== '::1' && ip !== '127.0.0.1') {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/country/`, {
          headers: { 'User-Agent': 'lovepages/1.0' },
        })
        if (geoRes.ok) {
          country = (await geoRes.text()).trim()
        }
      } catch {
        // fall through to default USD
      }
    }

    const origin = req.headers.get('origin') || 'http://localhost:5173'
    const isBrazil = country === 'BR'

    if (false) {
      // Mercado Pago for Brazilian users
      const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
      const supabaseUrl = Deno.env.get('SUPABASE_URL')

      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1')
      const preference: Record<string, unknown> = {
        items: [{
          title: 'Lovepage — 1 ano',
          description: 'Sua página fica no ar por 1 ano',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 20,
        }],
        back_urls: {
          success: `${origin}/payment-success?page_id=${pageId}`,
          failure: `${origin}/editor/${pageId}`,
          pending: `${origin}/payment-success?page_id=${pageId}`,
        },
        external_reference: `${pageId}:${slug}`,
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
      }
      // auto_return only works with public HTTPS URLs, not localhost
      if (!isLocalhost) {
        preference.auto_return = 'approved'
      }

      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mpAccessToken}`,
        },
        body: JSON.stringify(preference),
      })

      if (!mpRes.ok) {
        const err = await mpRes.text()
        console.error('Mercado Pago error:', err)
        return new Response(JSON.stringify({ error: 'Failed to create MP preference' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const mpData = await mpRes.json()
      // Use sandbox_init_point in test mode, init_point in production
      const url = mpData.init_point

      return new Response(JSON.stringify({ url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      // Stripe for international users
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
        apiVersion: '2023-10-16',
      })

      const session = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: 1000, // $10.00
            product_data: {
              name: 'Lovepage — 1 year',
              description: 'Your page stays live for 1 year',
            },
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${origin}/payment-success?page_id=${pageId}`,
        cancel_url: `${origin}/editor/${pageId}`,
        metadata: { pageId, slug },
      })

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
