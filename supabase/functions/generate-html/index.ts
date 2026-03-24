const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are an expert HTML/CSS/JS developer. The user will describe something they want to embed on a personal webpage (e.g. a Google Maps embed, a Spotify player, a countdown, a decorative animation, a custom styled section, etc.).

Your job is to produce clean, self-contained HTML that works when dropped into a page via innerHTML / dangerouslySetInnerHTML.

Rules:
- Output ONLY raw HTML — no markdown, no code fences, no explanation.
- Everything must be self-contained: inline styles, inline <script> tags, inline <style> tags if needed.
- Do NOT use external CSS frameworks (no Bootstrap, no Tailwind classes).
- Do NOT use document.write().
- Scripts should use DOMContentLoaded or run immediately (the element will already be in the DOM).
- Use unique IDs (prefix with "lb-") to avoid conflicts with the host page.
- Keep it focused and concise — only build what was asked for.
- For iframes (maps, Spotify, YouTube embeds), produce a clean embed with appropriate width/height and border-radius.
- For animations or interactive elements, use vanilla JS and CSS only.
- Make it visually appealing — rounded corners, subtle shadows, good proportions.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, currentHtml } = await req.json()

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 55_000)

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 4096,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: currentHtml?.trim()
              ? `Current HTML in the block:\n\`\`\`html\n${currentHtml}\n\`\`\`\n\nInstruction: ${prompt}`
              : prompt,
          },
        ],
      }),
    })
    clearTimeout(timeout)

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      console.error('OpenAI error response:', err)
      return new Response(JSON.stringify({ error: `OpenAI error: ${err}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await openaiRes.json()
    console.log('OpenAI finish_reason:', data.choices?.[0]?.finish_reason)

    const raw: string = data.choices?.[0]?.message?.content ?? ''

    if (!raw.trim()) {
      console.error('Empty content from OpenAI. Full response:', JSON.stringify(data))
      return new Response(JSON.stringify({ error: 'AI returned empty response — try rephrasing your prompt' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Strip markdown code fences if model wrapped output despite instructions
    const html = raw.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/i, '').trim()

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err.name === 'AbortError' ? 'Request timed out — try again' : err.message
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
