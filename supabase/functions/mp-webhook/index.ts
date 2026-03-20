import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Mercado Pago sends GET pings and POST notifications
  if (req.method === 'GET') {
    return new Response('ok', { status: 200 })
  }

  try {
    const body = await req.json()

    // MP IPN format: { type: "payment", data: { id: "12345" } }
    if (body.type !== 'payment' || !body.data?.id) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const paymentId = body.data.id
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')

    // Fetch payment details from MP
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken}` },
    })

    if (!paymentRes.ok) {
      console.error('Failed to fetch MP payment:', paymentId)
      return new Response('Failed to fetch payment', { status: 500 })
    }

    const payment = await paymentRes.json()

    // Only process approved payments
    if (payment.status !== 'approved') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // external_reference is "pageId:slug"
    const externalRef = payment.external_reference
    if (!externalRef || !externalRef.includes(':')) {
      console.error('Invalid external_reference:', externalRef)
      return new Response('Invalid external_reference', { status: 400 })
    }

    const colonIdx = externalRef.indexOf(':')
    const pageId = externalRef.slice(0, colonIdx)
    const slug = externalRef.slice(colonIdx + 1)

    if (!pageId || !slug) {
      console.error('Missing pageId or slug in external_reference:', externalRef)
      return new Response('Missing pageId or slug', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const { error } = await supabase
      .from('pages')
      .update({
        published: true,
        slug,
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', pageId)

    if (error) {
      console.error('DB update error:', error.message)
      return new Response('DB error', { status: 500 })
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('mp-webhook error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
