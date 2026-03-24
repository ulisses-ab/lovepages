
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

Block types: `text | image | song | link | countdown | carousel | container | drawing | game`

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
│   │   ├── LinkBlock.jsx            ← styled button with color picker
│   │   ├── CountdownBlock.jsx       ← live countdown to a user-specified date/time; shows expired message when reached
│   │   ├── CarouselBlock.jsx        ← photo carousel; two modes: slider (swipe, dots, arrows) and album (react-pageflip two-page spread book — deep plum cover with user-chosen color, beige pages, white-framed photos, named cover with three title styles)
│   │   ├── ContainerBlock.jsx       ← layout wrapper that holds child blocks; edit mode shows BackgroundChooser + child block list + add-block menu; preview renders children in flex-wrap inside the container's background section
│   │   ├── DrawingBlock.jsx          ← drawing board block
│   │   └── GameBlock.jsx            ← interactive game block; wordle variant (set a word, visitors guess); resting state shows 3 scattered papers on a wood-grain table surface with SVG pencil/brush/paint-blob decorations; clicking opens a gallery modal showing all drawings as tilted paper cards; "Add yours" button inside gallery opens an inline canvas (palette, brush sizes, eraser, caption) that uploads to Supabase Storage on save
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
    │   └── index.ts                 ← Deno edge function; detects country from client IP (ipapi.co); BR → creates Mercado Pago preference (R$20, returns init_point); others → creates Stripe Checkout Session (USD $10); verifies page ownership via user JWT
    ├── stripe-webhook/
    │   └── index.ts                 ← Deno edge function; handles checkout.session.completed; sets published=true, slug, expires_at=now()+1yr on the page
    └── mp-webhook/
        └── index.ts                 ← Deno edge function; handles Mercado Pago IPN (type=payment, status=approved); reads external_reference="pageId:slug"; sets published=true, slug, expires_at=now()+1yr on the page
```

## Block data model

Every block is a plain JSON object stored in the `blocks` jsonb column.

### Page settings (`pageSettings` object saved in `settings` column)

```json
{
  "bgColor": "#hex or empty string — solid background color",
  "bgImage": "url or empty string — background image (overrides bgColor when set)",
  "bgImageFit": "cover | contain | tile — how the image fills the page (default: cover)",
  "bgFade": false,
  "bgColor2": "#hex or empty — second background stop for fade",
  "bgImage2": "url or empty — second background image for fade",
  "bgEffect": "empty string | bubbles — animated overlay rendered by BgEffect component (position:fixed, zIndex:0)",
  "columnGap": "number (px) — gap between blocks in the page column (default: 16)",
  "columnPadding": "number (px) — padding around the page column (default: 24)"
}
```

`getPageBgStyle(settings)` in `src/lib/pageUtils.js` converts these to an inline style object for simple color/image backgrounds. `PageBgWrapper` (`src/components/ui/PageBgWrapper.jsx`) handles all three modes including fade (uses `position:fixed` layers so the fade fills the viewport regardless of scroll depth).

### Base fields (all block types)

```json
{
  "id": "nanoid string",
  "type": "text | image | song | link | countdown | carousel | container",
  "size": "full | half | third | auto",
  "align": "left | center | right",
  "bgColor": "#hex or empty string",
  "bgImage": "url or empty string — background image for the block",
  "bgImageFit": "cover | contain | tile — how the image fills the block (default: cover)",
  "bgFade": false,
  "bgColor2": "#hex or empty — second background stop for fade",
  "bgImage2": "url or empty — second background image for fade",
  "border": false,
  "shadow": false,
  "fullBleed": false
}
```
// size: flex child participation in the parent container's layout (page column or container block)
//   "full"  → width: 100% (takes the entire row)
//   "half"  → flex: 1 1 calc(50% - 8px) with minWidth:200px (two per row)
//   "third" → flex: 1 1 calc(33.33% - 11px) with minWidth:150px (three per row)
//   "auto"  → flexShrink:0, shrinks to content width
//   Applied by BlockRenderer as a wrapper style in non-editing (preview/public) mode.
// fullBleed: when true, the block escapes the page's max-width column and stretches edge-to-edge.
//   Both Canvas (preview) and PublicPage group consecutive non-fullBleed blocks into a constrained
//   flex-wrap column; fullBleed blocks render outside that group at full viewport width.
//   Container blocks default to fullBleed:true.
// align: used by individual block components for their internal content alignment (e.g. TextBlock text-align).
//   Not applied by BlockRenderer itself.
// bgFade: when true, renders two stacked absolute background layers — bgColor2/bgImage2 at bottom, bgColor/bgImage on top with CSS mask-image linear-gradient(to bottom, black, transparent). Works for all combos: color→color, image→color, color→image, image→image.

### Type-specific fields

```json
// text
{ "variant": "heading | paragraph | quote | typewriter | postit | ransom", "content": "string", "fontFamily": "sans | serif | mono | cursive", "fontSize": "sm | base | lg | xl | 2xl | 3xl | 4xl", "color": "#hex or empty string (empty = theme default)", "noteColor": "#hex or empty — post-it background color (default: #fde68a)" }
// fontFamily and color are ignored for typewriter, postit, and ransom variants (font is fixed by the aesthetic)
// typewriter: cottagecore — aged cream paper, red margin line, ruled lines, Courier ink-impression effect
// postit: playful/bold — sticky note with adhesive strip, ruled lines, dog-ear corner, cursive font; noteColor controls paper color
// ransom: playful/bold — each letter rendered with a different randomly-chosen font, weight, italic, size, rotation, and color/background theme (seeded by content so the same text always renders the same)
// cyberpunk: cyberpunk — dark panel (#06060f→#0a0018), cyan neon border + glow, scanline overlay, corner bracket accents (magenta), Space Mono font; text rendered in three layers: cyan ghost offset left, magenta ghost offset right, white main text with cyan text-shadow glow

// image
{ "variant": "default | polaroid", "src": "url", "alt": "string", "caption": "string" }
// default: plain image with optional caption
// polaroid: off-white polaroid frame with wider bottom, square 1:1 crop, handwritten caption (Caveat), tape strip at top, slight rotation derived from block id

// song
{ "embedUrl": "youtube url", "title": "string", "artist": "string", "autoplay": true, "variant": "default | cover | vinyl", "coverUrl": "url or empty string", "accentColor": "#hex or empty (default: theme primary — play button, progress bar)", "textColor": "#hex or empty (default: theme fg — title, artist)" }
// autoplay: only one song block may have this true at a time
// — toggling via checkbox: enforced in Canvas.handleUpdate
// — adding a new block: enforced in EditorPage.handleAddBlock
// — playing: enforced at runtime via playerRegistry.pauseOthers()
// variant: controls the player appearance
// — "default": horizontal bar with play button and progress bar
// — "cover": square cover image (clickable to play/pause, hover reveals overlay icon) with title, artist, and progress bar to its right; no card background
// — "vinyl": large spinning vinyl disc with play button to its left, title and progress bar below; coverUrl appears as the center label
// — "aero": Frutiger Aero — rectangular aqua-blue device body, SVG transport icons, cover art panel with glass reflection, LCD screen with blue-glow monospace, progress track with chrome knob, EQ bars, neon green play button with 4-ring halo
// — "xp": Windows XP / Luna Blue — full WMP-style window frame; Luna Blue title bar gradient, classic gray chrome (#ECE9D8), 3D raised/sunken borders, menu bar, cover art inset, Tahoma font, XP seek bar with grip-line thumb, transport buttons, status bar
// — "bubble": Frutiger Aero — translucent sky-blue capsule body (stadium shape, backdrop-blur frosted glass); left side has a large spinning CD disc with cover art center label, iridescent conic-gradient tracks, and chrome spindle; right side shows title/artist, frosted progress bar, glass-bubble transport buttons, and subtle EQ bars; decorated with bokeh orbs, water caustic SVG pattern, and light flares
// coverUrl: used by "cover", "vinyl", "xp", "aero", and "bubble" variants; supports Supabase Storage upload or direct URL

// link
{ "href": "url", "label": "string", "color": "#hex", "variant": "default | xp" }

// carousel
{ "images": [{ "src": "url", "caption": "string" }], "mode": "slider | album", "albumTitle": "string", "coverColor": "#hex or empty", "coverTitleStyle": "sticker | postit | plain" }
// slider (default): manual carousel with prev/next arrows, dot indicators, touch swipe, per-image captions
// album: react-pageflip two-page spread book — textured cover, beige pages with vignette, each photo as a white-framed print with slight tilt and per-image caption
// coverColor: user-chosen cover color; defaults to deep plum (#2c1a2e); back cover uses same color at 80% brightness
// coverTitleStyle controls how the album title appears on the cover:
// — "sticker" (default): white label with red border, slight rotation, drop shadow
// — "postit": yellow post-it note with tape strip, slight rotation, drop shadow
// — "plain": uppercase serif (Georgia) printed directly on the cover, no background

// countdown
{ "targetDate": "datetime-local string (e.g. 2026-06-15T14:00)", "label": "string", "expiredMessage": "string", "variant": "flip | minimal | aero", "clockColor": "dark | beige" }

// container
{ "children": "[array of full block objects]", "fullBleed": true }

// drawing
{ "drawings": [{ "id": "nanoid", "src": "https://…supabase…/storage/…/images/drawing-*.png", "caption": "string", "pinColor": "#hex" }], "boardTitle": "string" }
// drawings: array of user-created freehand drawings; each is uploaded to Supabase Storage (images/ path) and stored as a public URL
// boardTitle: optional title displayed at the top of the corkboard
// pinColor: deterministically chosen push pin color per drawing (8 color options)
// Canvas size: 460×320px, paper bg #faf5e4; canvas.toBlob('image/png') → upload → store publicUrl
// Always renders full-width (fullBleed:true by default). Background (bgColor/bgImage/bgFade etc.) is set via BackgroundChooser in edit mode.
// Children are any block types, including other containers (nesting is supported).
// In edit mode, ContainerBlock renders its visual body inline on the canvas (not as a side-panel list):
//   - A collapsible "Background & Layout" settings bar sits at the top.
//   - Children render as InlineChildBlock: live visual preview + drag handle + Edit/Delete toolbar.
//   - Clicking "Edit" on a child switches it from preview to its editing form + BlockStyleControls.
//   - Dragging a top-level block onto a container moves it inside (EditorPage.handleDragEnd).
//   - Dragging from the block panel onto a container adds it as a child (EditorPage.handleDragEnd).
// In SortableBlock, containers always show their body (not gated by expanded). Header is a minimal drag bar.
// flip (default): a realistic physical flip clock — mechanical flip panels with 3D card animation, rubber feet. Dark/moody aesthetic.
//   clockColor: "dark" (default) — dark anodised aluminium housing, light digits; "beige" — warm cream housing, dark digits.
// minimal: large serif numbers, hairline dividers, small uppercase unit labels, dot separators. Clean white-space editorial look. Minimalist aesthetic.
// aero: Frutiger Aero — glossy sky-blue pill-shaped housing with specular highlights; inner deep-blue capsule display showing DD:HH:MM:SS in white monospace with blue glow; status label + micro SVG icons; lime-green progress bar tracking seconds within the current minute.

// game
{ "variant": "wordle", "word": "string (uppercase A-Z, 3-8 chars)", "gameTitle": "string", "winMessage": "string", "loseMessage": "string" }
// variant: controls the game type
// — "wordle": classic Wordle clone — dark board (#121213), colored tile feedback (green=correct, yellow=present, gray=absent), on-screen keyboard with letter status tracking, 6 guesses, shake animation on invalid length, play-again button; the creator sets the secret word and optionally customizes title/win/lose messages
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

1. **More block variants per aesthetic** — most block types only cover 1–2 aesthetics. Priority: add Frutiger Aero, Cyberpunk, and Cottagecore variants to Song, Link, and Text blocks.
2. **Aesthetic picker in the editor** — a top-level "vibe" selector that applies a consistent aesthetic across all blocks on a page at once (without overriding individually-customized blocks).
3. **Templates** — pre-made block arrays per aesthetic that can be loaded as a starting point.
4. **Dashboard publish status** — show published/unpublished badge, live URL, and expiry date on each card in DashboardPage.
5. **Custom domain support** — beyond subdomains (CNAME mapping to a user-owned domain).
6. **Renewal flow** — notify users before `expires_at` and let them renew for another year.

## Aesthetics

### Overall site (nav, editor shell, dashboard)
The app UI uses a **dark purple** palette — deep backgrounds, soft purple accents, muted foreground text. It should feel intimate and a little moody, like late-night texting. Think: dark mode journaling app crossed with a greeting card brand. Avoid anything that looks like a SaaS dashboard or dev tool.

### Core aesthetic system (blocks)
Each block type offers multiple **visual variants**, and every variant belongs to one of the app's core aesthetics. The goal: a user picks a vibe for their page and every block they add already fits it — without touching any color pickers.

The core aesthetics are:

| Aesthetic | Feeling | Visual signature |
|---|---|---|
| **Soft / pastel** | Cute, romantic, gentle | Blush pinks, lavender, cream; rounded corners; soft drop shadows; handwritten or rounded sans fonts |
| **Frutiger Aero** | Dreamy, fresh, early-2000s digital | Glassy translucency, sky-blue gradients, white glows, soft lens flares, nature-meets-tech vibe |
| **Minimalist** | Quiet, elegant, editorial | White space, thin serif or grotesque fonts, hairline borders, no decoration; content first |
| **Dark / moody** | Cinematic, intimate, late-night | Deep navy/charcoal/black backgrounds, gold or rose accents, subtle grain, high contrast |
| **Cyberpunk** | Electric, loud, futuristic | Neon on black, glitch effects, monospace fonts, scanlines, magenta/cyan/yellow accents |
| **Playful / bold** | Fun, expressive, bubbly | Bright saturated colors, chunky rounded fonts, sticker-like elements, confetti textures |
| **Cottagecore** | Warm, handmade, nostalgic | Warm creams and greens, floral or leaf motifs, serif fonts, paper/linen textures, vintage feel |

Each block variant should be consciously designed for one of these aesthetics, not just be a generic color variation. When building a new variant, decide its aesthetic first — it shapes every visual decision.

### How this maps to blocks
Currently the mapping looks like this (variants per block type):

- **Text**: `heading` (neutral), `paragraph` (neutral), `quote` (dark/moody), `typewriter` (cottagecore — aged paper note), `postit` (playful/bold — sticky note), `ransom` (playful/bold — cut magazine letters, every character different font/size/rotation), `cyberpunk` (cyberpunk — dark panel, neon cyan border glow, scanlines, Space Mono, RGB chromatic-aberration glitch ghost layers), `xp` (retro — classic Windows XP Notepad window, Courier New, title bar, menu bar, status bar)
- **Image**: `default` (neutral — plain image), `polaroid` (cottagecore — polaroid frame with tape), `xp` (retro — Windows XP "Windows Picture and Fax Viewer" window with toolbar and status bar)
- **Song**: `default` (soft), `cover` (dark/moody), `vinyl` (dark/moody — physical turntable), `aero` (Frutiger Aero — translucent pebble-shaped media player), `bubble` (Frutiger Aero — translucent capsule with spinning CD disc), `xp` (retro/playful — Windows XP Luna Blue window, full WMP chrome)
- **Link**: `default` (neutral — rounded pill button), `xp` (retro — Windows XP "Open Link" dialog box with globe icon and 3D raised Open/Cancel buttons)
- **Countdown**: `flip` (dark/moody — physical flip clock), `minimal` (minimalist — large serif numbers, hairline dividers), `aero` (Frutiger Aero — glossy sky-blue pill housing, deep-blue capsule display, lime-green progress bar), `xp` (retro — Windows XP "Date and Time Properties" control panel dialog with tabbed chrome, sunken digit panels, OK/Cancel/Apply buttons)
- **Carousel**: `slider` (neutral), `album` (cottagecore — physical photo album with leather cover), `xp` (retro — Windows XP "My Pictures" Windows Explorer window with task pane sidebar, image viewport, and filmstrip), `ring` (soft/aero — draggable 3D rotating ring of photos; drag-to-spin with inertia, parallax background-position per image, staggered opacity entrance)

- **Game**: `wordle` (dark/moody — classic Wordle clone with dark board, colored tile feedback, on-screen keyboard)

As new variants are added, each should map to an aesthetic and feel like it truly belongs to that world — not just a reskinned version of another variant.

### Tone in copy
Any UI strings (buttons, placeholders, empty states) should feel warm and encouraging, not clinical. e.g. "Give your page a name" not "Page title". "Share with someone you love" not "Publish URL".

## Agent instructions

- After making changes that affect the architecture, file map, block data model, conventions, or "What is NOT built yet" sections, update this file (`CLAUDE.md`) to reflect those changes.
- **Commit frequently** — after completing each logical unit of work (a new block variant, a bug fix, a new feature, a refactor), create a git commit before moving on. Do not batch unrelated changes into one commit. Prefer small, focused commits with clear messages.

## Key conventions

- All block components accept `{ block, isEditing, onChange }`. When `isEditing` is false, render the public-facing view. When true, render form controls. `onChange(patch)` merges the patch into the block.
- State lives in `EditorPage` via the `usePage` hook. No global state manager.
- Tailwind only — no CSS modules, no styled-components.
- **Never hardcode color values** (hex or Tailwind color names like `gray-800`, `purple-600`). All colors are defined in `src/lib/theme.js` and exposed as Tailwind aliases (`bg-base`, `bg-surface`, `bg-overlay`, `bg-subtle`, `text-fg`, `text-fg-muted`, `bg-primary`, `text-primary-dim`, etc.). Components that need a hex at runtime (e.g. inline styles) import `colors` from `theme.js`. To retheme the app, only `theme.js` needs to change.
- No TypeScript — keep JSX only to avoid tooling overhead for now.
- Supabase Storage uploads happen directly from the browser inside block components (not via a server).
