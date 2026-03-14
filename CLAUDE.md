
# lovepages — Agent Documentation

## What this is

A web platform where users create personalized mini-webpages for loved ones. Pages are composed of drag-and-drop blocks (text, image, song, video, link) and saved to Supabase. Target users are non-technical.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend framework | Vite 5 + React (JSX, no TypeScript) |
| Styling | Tailwind CSS v3 |
| Routing | react-router-dom v7 |
| Drag and drop | @dnd-kit/core + @dnd-kit/sortable |
| Backend / DB | Supabase (Postgres + Storage + Auth) |
| ID generation | nanoid |

Block types: `text | image | song | video | link | countdown`

> Node 18 constraint: use `create-vite@5`, NOT latest create-vite (requires Node >=20).

## Environment variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxx...

# Optional — enables subdomain-based public URLs (e.g. mypage.lovepages.com)
# Requires wildcard DNS *.yourdomain.com → your host, and a wildcard TLS cert
# When blank, public URLs fall back to path-based: /p/:slug
VITE_BASE_DOMAIN=lovepages.com

# Stripe — client-side (publishable key only; safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Stripe — server-side secrets (set as Supabase Edge Function secrets, never in .env)
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

Both Supabase values come from Supabase dashboard → Project Settings → API.

## Running locally

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # production build
```

## File map

```
src/
├── App.jsx                          ← root; React Router routes: / (HeroPage), /dashboard (auth-gated), /editor (new page), /editor/:pageId (existing page), /p/:slug (public page viewer), /payment-success (Stripe redirect landing); also detects subdomain slugs (e.g. mypage.lovepages.com) and renders PublicPage directly
├── index.css                        ← Tailwind directives + @keyframes spin-vinyl (used by SongBlock vinyl variant)
├── lib/
│   ├── supabase.js                  ← createClient(), single export: supabase
│   ├── blockDefaults.js             ← BLOCK_TYPES, createBlock(), icons/labels
│   ├── pageUtils.js                 ← getPageBgStyle(settings) — shared by EditorPage and PublicPage
│   ├── playerRegistry.js            ← module-level Map of active YT players; pauseOthers(id) ensures only one song plays at a time
│   └── theme.js                     ← color palette (hex values); imported by tailwind.config.js and components that need runtime colors
├── hooks/
│   ├── useAuth.js                   ← subscribes to supabase.auth.onAuthStateChange; exposes { user, loading }
│   ├── usePage.js                   ← load/save a single page to Supabase; exposes savePage(), publishPage(slug), unpublishPage(), checkSlugAvailable(slug); also exposes pageSlug + pagePublished state
│   └── usePages.js                  ← load/delete list of pages for a user; accepts userId param (passed from DashboardPage via useAuth)
├── components/
│   ├── auth/
│   │   └── AuthModal.jsx            ← OAuth modal; Google sign-in only; redirects to /dashboard after auth
│   ├── blocks/
│   │   ├── BlockRenderer.jsx        ← routes block.type → correct component
│   │   ├── TextBlock.jsx            ← heading / paragraph / quote variants; font family + size controls
│   │   ├── ImageBlock.jsx           ← file upload to Supabase Storage or URL
│   │   ├── SongBlock.jsx            ← YouTube audio player (hidden iframe via YT IFrame API, custom play/pause UI); autoplay mutually exclusive across song blocks
│   │   ├── VideoBlock.jsx           ← YouTube embed or video upload
│   │   ├── LinkBlock.jsx            ← styled button with color picker
│   │   └── CountdownBlock.jsx       ← live countdown to a user-specified date/time; shows expired message when reached
│   └── editor/
│       ├── EditorTopBar.jsx         ← title input, preview toggle, publish button, back arrow (→ /dashboard), sign-out icon; shows subtle "Saving…" indicator during autosave
│       ├── PublishModal.jsx         ← publish modal: slug input with availability check, publish/unpublish, shows live URL
│       ├── BlockPanel.jsx           ← left sidebar: click to add a block
│       ├── Canvas.jsx               ← dnd-kit list (edit) or flex wrap (preview)
│       ├── SortableBlock.jsx        ← drag handle, edit/delete header, expands to edit
│       └── BlockStyleControls.jsx   ← width / align / bgColor / border / shadow
└── pages/
    ├── HeroPage.jsx                 ← landing page; "Start creating" button opens AuthModal
    ├── DashboardPage.jsx            ← lists all user pages; "Open" navigates to /editor/:id; "Delete" has inline confirm step; "New page" → /editor
    ├── EditorPage.jsx               ← reads pageId from useParams(); three-panel layout; autosaves 1.5s after last change to blocks/title/settings; after first autosave of a new page, replaces URL with /editor/:id
    ├── PublicPage.jsx               ← read-only public viewer; loads page by slug (must be published=true and not expired); used by /p/:slug route and subdomain routing
    └── PaymentSuccessPage.jsx       ← Stripe success redirect landing; polls Supabase until webhook has published the page, then shows live URL
supabase/
├── schema.sql                       ← run once in Supabase SQL editor
└── functions/
    ├── create-checkout-session/
    │   └── index.js                 ← Deno edge function; creates a Stripe Checkout Session; detects country from client IP (ipapi.co) to set BRL R$20 or USD $10; verifies page ownership via user JWT
    └── stripe-webhook/
        └── index.js                 ← Deno edge function; handles checkout.session.completed; sets published=true, slug, expires_at=now()+1yr on the page
```

## Block data model

Every block is a plain JSON object stored in the `blocks` jsonb column.

### Page settings (`pageSettings` object saved in `settings` column)

```json
{
  "bgColor": "#hex or empty string — solid background color",
  "bgImage": "url or empty string — background image (overrides bgColor when set)",
  "bgImageFit": "cover | contain | tile — how the image fills the page (default: cover)"
}
```

`getPageBgStyle(settings)` in `src/lib/pageUtils.js` converts these to an inline style object applied to the preview container.

### Base fields (all block types)

```json
{
  "id": "nanoid string",
  "type": "text | image | song | video | link",
  "width": "full | half | third",
  "align": "left | center | right",
  "bgColor": "#hex or empty string",
  "border": false,
  "shadow": false
}
```

### Type-specific fields

```json
// text
{ "variant": "heading | paragraph | quote", "content": "string", "fontFamily": "sans | serif | mono | cursive", "fontSize": "sm | base | lg | xl | 2xl | 3xl | 4xl", "color": "#hex or empty string (empty = theme default)" }

// image
{ "src": "url", "alt": "string", "caption": "string" }

// song
{ "embedUrl": "youtube url", "title": "string", "artist": "string", "autoplay": true, "variant": "default | cover | vinyl", "coverUrl": "url or empty string" }
// autoplay: only one song block may have this true at a time
// — toggling via checkbox: enforced in Canvas.handleUpdate
// — adding a new block: enforced in EditorPage.handleAddBlock
// — playing: enforced at runtime via playerRegistry.pauseOthers()
// variant: controls the player appearance
// — "default": horizontal bar with play button and progress bar
// — "cover": square cover image (clickable to play/pause, hover reveals overlay icon) with title, artist, and progress bar to its right; no card background
// — "vinyl": large spinning vinyl disc with play button to its left, title and progress bar below; coverUrl appears as the center label
// coverUrl: used by "cover" and "vinyl" variants; supports Supabase Storage upload or direct URL

// video
{ "src": "direct url", "embedUrl": "youtube url", "title": "string" }

// link
{ "href": "url", "label": "string", "color": "#hex" }

// countdown
{ "targetDate": "datetime-local string (e.g. 2026-06-15T14:00)", "label": "string", "expiredMessage": "string" }
```

To add a new block type:
1. Add the type string to `BLOCK_TYPES` in `src/lib/blockDefaults.js`
2. Add its default shape to `createBlock()` in the same file
3. Add its label and icon to `BLOCK_LABELS` / `BLOCK_ICONS`
4. Create `src/components/blocks/YourBlock.jsx` with `{ block, isEditing, onChange }` props
5. Register it in `BlockRenderer.jsx` switch statement

## Supabase setup

### Database

Run `supabase/schema.sql` once in the Supabase SQL editor. It creates:

- `pages` table with columns: `id`, `user_id`, `title`, `slug`, `blocks` (jsonb), `settings` (jsonb), `published`, `expires_at` (timestamptz, null = unpaid), `created_at`, `updated_at`
- RLS policy: owners can do anything to their own rows
- RLS policy: public can SELECT rows where `published = true AND (expires_at IS NULL OR expires_at > now())`
- Trigger: auto-updates `updated_at` on every UPDATE

### Auth (Google OAuth)

- Supabase dashboard → **Authentication → Providers → Google** → enable and paste credentials
- Google credentials come from [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth client ID (type: Web application)
- Authorized redirect URI to set in Google console: `https://<project-ref>.supabase.co/auth/v1/callback`
- After auth, Supabase redirects back to `window.location.origin/editor` (set in `AuthModal.jsx`)
- No `localhost` configuration needed — Supabase handles the callback

### Storage

Create a bucket named exactly `lovepages` in the Supabase dashboard:
- Public: ON
- Allowed MIME types: `image/*, audio/*, video/*`
- Max file size: 50MB

Uploads go to paths: `images/`, `audio/`, `videos/` within the bucket.

## What is NOT built yet

These are the logical next steps, in priority order:

1. **Templates** — pre-made block arrays that can be loaded as a starting point.
2. **Dashboard publish status** — show published/unpublished badge, live URL, and expiry date on each card in DashboardPage.
3. **Custom domain support** — beyond subdomains (CNAME mapping to a user-owned domain).
4. **Renewal flow** — notify users before `expires_at` and let them renew for another year.

## Agent instructions

- After making changes that affect the architecture, file map, block data model, conventions, or "What is NOT built yet" sections, update this file (`CLAUDE.md`) to reflect those changes.

## Key conventions

- All block components accept `{ block, isEditing, onChange }`. When `isEditing` is false, render the public-facing view. When true, render form controls. `onChange(patch)` merges the patch into the block.
- State lives in `EditorPage` via the `usePage` hook. No global state manager.
- Tailwind only — no CSS modules, no styled-components.
- **Never hardcode color values** (hex or Tailwind color names like `gray-800`, `purple-600`). All colors are defined in `src/lib/theme.js` and exposed as Tailwind aliases (`bg-base`, `bg-surface`, `bg-overlay`, `bg-subtle`, `text-fg`, `text-fg-muted`, `bg-primary`, `text-primary-dim`, etc.). Components that need a hex at runtime (e.g. inline styles) import `colors` from `theme.js`. To retheme the app, only `theme.js` needs to change.
- No TypeScript — keep JSX only to avoid tooling overhead for now.
- Supabase Storage uploads happen directly from the browser inside block components (not via a server).
