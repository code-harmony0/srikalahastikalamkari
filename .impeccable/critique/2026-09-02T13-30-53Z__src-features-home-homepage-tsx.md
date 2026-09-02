---
target: homepage + admin dashboard
total_score: 16
max_score: 36
na_heuristics: 7
p0_count: 4
p1_count: 4
timestamp: 2026-09-02T13-30-53Z
slug: src-features-home-homepage-tsx
---
Method: dual-agent (A: homepage review · A2: dashboard review · B: detector + evidence). Scope: homepage (Persuade) + admin dashboard (Operate).

## BLOCKING — security, outranks all design work

1. `.env.deploy` is TRACKED IN GIT: live SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_SECRET, Hostinger SSH creds. .gitignore patterns don't match it. `build:hostinger` also zips .env.local into deploy.zip. Root scripts check_cats.js / check_products.js / check_wall_art.js hardcode the service-role key inline (untracked, one `git add .` from exposure).
2. Customer PII world-readable. proxy.ts:21 gates /dashboard on unsigned `isLoggedIn=true` cookie. But supabaseAdmin falls back to the anon key in-browser (lib/supabase/client.ts:29-31) and RLS grants anon SELECT USING (true) on orders/order_items (003_fix_orders_rls.sql:26-36; 005_fix_rls_security.sql:18, comment says "temporary"). Anon key ships in the public bundle. Names, phones, emails, addresses exposed. DPDP-reportable.

## Design Health Score

HOMEPAGE (Persuade) — 16/36 applicable (heuristic 7 = n/a: first-visit surface, no repeat-user power path)
1 Visibility of System Status — 2 — fabricated countdown state; hardcoded category counts contradict catalogue
2 Match System / Real World — 3 — "Duppatas"/"Duppatta"/"Dupattas" 3 spellings; "Dress Materials" filters on "Fabrics"
3 User Control and Freedom — 1 — every product card opens login modal; hero auto-rotates 4.5s, no pause
4 Consistency and Standards — 1 — two visual systems collide at section 6; four labels for one /products destination
5 Error Prevention — 2 — footer routes derived from item.split(" ")[0].toLowerCase(); no shipping/returns pre-checkout
6 Recognition Rather Than Recall — 2 — gallery tiles labeled but link nowhere
7 Flexibility and Efficiency — n/a
8 Aesthetic and Minimalist Design — 1 — 12 sections, ~11 viewport-heights, 3 trust modules, "Heritage" x7
9 Error Recovery — 2 — failed product fetch console.errors only; empty grid, no retry
10 Help and Documentation — 2 — Rs 8-25k textile with no care/fabric/size guidance

DASHBOARD (Operate) — 18/40
1 Visibility of System Status — 2 — orders table has no loading branch, shows "No orders found" while loading
2 Match System / Real World — 1 — mandatory barcode scanning of one-off hand-painted sarees with no barcodes
3 User Control and Freedom — 1 — no way back from in_packing; no unsaved-changes guard; no undo on delete
4 Consistency and Standards — 1 — two UI kits, two toast libraries, three confirmation idioms, three names per order state
5 Error Prevention — 2 — good field validation, but opening a modal mutates order state
6 Recognition Rather Than Recall — 3 — strong nav/badges; copy-barcode-then-retype is the exception
7 Flexibility and Efficiency — 1 — no bulk actions, no "save and add another", no CSV import
8 Aesthetic and Minimalist Design — 3 — clean craft, undermined by ui-avatars.com placeholder logo
9 Error Recovery — 2 — coupons fails silently; delete reports false success
10 Help and Documentation — 2 — zero explanation of the barcode workflow the system depends on

## Design Specificity Verdict — 3/10, generic luxury-DTC template with Kalamkari nouns pasted on

Would survive find-and-replace to "Banarasi silk" / "Moroccan rugs" / "Tuscan olive oil" with zero visual edits.
- Playfair Display + Inter (tailwind.config.ts:30-35) = default 2019-24 Shopify-premium pairing
- Gold #C19A5B on charcoal (~120 uses) = Western luxury-hotel gold. Real Srikalahasti palette is process-derived: iron-jaggery black, madder red, myrobalan cream, indigo — present in the product photos, ignored by the chrome
- Gold floating particles (HomePage.tsx:190-208) — crypto-landing effect; no gold dust exists in Kalamkari
- Decorative SVGs are generic paisley/diamonds. Tree of life, Ramayana narrative registers, temple-hanging band-and-border grid = a free design system, unused
Photography is the only thing carrying the craft.

DETERMINISTIC SCAN: storefront clean (exit 0). Dashboard exit 2, 12 warnings: 6x gray-on-color, 2x layout-transition (animating width/margin-left), 1x side-tab, 1x border-accent-on-rounded, 1x bounce-easing. False positive: RecentOrdersTable.tsx:19 (dark-on-light, rule matched token name).
DETECTOR CLEARED (would-be false findings): all 6 raw <img> have alt; homepage heading structure correct, one h1, no jumps; only dashboard <table> IS wrapped in overflow-x-auto; prefers-reduced-motion IS handled in CSS.
DETECTOR CAUGHT WHAT REVIEW MISSED: that CSS reduced-motion block does NOT reach framer-motion. useReducedMotion appears ZERO times in src/. 132 motion.* instances drive inline transforms the !important reset cannot touch.
BROWSER EVIDENCE: none. Port 3000 serves an unrelated app (career-ops). No server started.

## Overall Impression
The homepage isn't under-designed, it's over-built and under-specific: 2105 lines, 12 sections, ~11 viewport-heights, first price 3.5-4.5 screens down on a 360px Android. Adding sections makes it worse. Biggest opportunity: stop making strangers log in to view a saree (AuthGuardedLink.tsx:17-25 preventDefault + openModal on every card). The page's job is one product-page view; it walls exactly that moment, then spends 570 lines persuading someone who already left.

## What's Working
1. Alt text genuinely excellent (HomePage.tsx:325-354) — real descriptive alts, not filler
2. Dashboard data layer honest — no mock data; services/dashboard.ts batches with .in("order_id",...), no N+1; React Query with per-dataset staleTime; next/dynamic chart splitting
3. CuratedProductCard + ProductList are the right models — title over price, honest "Made to Order - N days"; server pagination, page reset on filter change, distinct loading/empty, real AlertDialog on delete
4. Mobile motion budgeting deliberate — parallax swapped for static on mobile, gold-thread gated on !isMobile (just not applied to particles or framer-motion)
5. Footer credible — GSTIN, two verifiable addresses + Maps link, three phones

## Priority Issues

[P0] Login wall on every product card. AuthGuardedLink.tsx:17-25. First-time buyer taps saree, gets signup form before any trust content. Fix: plain next/link on CuratedProductCard/ProductCard/ProductCardCompact; guard add-to-cart and /checkout only; ideally anonymous cart, guard at checkout. -> /impeccable harden

[P0] Customer PII exposed + forgeable admin gate. Fix: drop permissive anon policies in 003/005, scope to auth.uid() = user_id; dashboard writes behind server actions with service-role key server-side + signed expiring session; remove /api from proxy.ts:13 exemption; server-side guard in dashboard/layout.tsx; rotate every key in .env.deploy and untrack. -> /impeccable harden

[P0] Order filters/search silently lie past 20 orders. orders/page.tsx:274-295 filters client-side over one server-paginated page; refetch deps [page] only. Owner clicks "New", sees 2 of 6, ships 4 late. Fix: move statusFilter + debounced searchQuery into the Supabase query, add to useEffect deps, reset page to 1 — mirror ProductList.tsx:161-163. -> /impeccable harden

[P0] Order actions invisible on touch. orders/page.tsx:498 opacity-0 group-hover:opacity-100 on Start Packing/Mark Shipped/Cancel, 7-column table. On phone the owner cannot process an order. Fix: delete opacity classes; below md render orders as cards with full-width primary action. -> /impeccable adapt

[P1] Homepage has no closing CTA. Last interactive element at line 1531; sections 8-11 (~570 lines, ~4 viewport-heights) have zero CTAs; page ends on a static stat row. Peak-end fails. Fix: closing conversion band before </main>; CTA on Process section; gallery tiles link to category. -> /impeccable layout

[P1] Fabricated trust content. Unsplash stock portrait captioned "Priya Sharma, Mumbai" with a verified badge; six invented 5-star testimonials; unsourced "4.9/5" and "10K+ Happy Customers"; countdown hardcoded {days:3,hours:14} resetting every page load so "Offer Ends In" is provably false; "500+ Years of Heritage" vs footer "since 1999". Audience is specifically alert to fake authenticity; ASCI-exposed. Fix: cut stock avatar + verified badge; real testimonials or delete grid; delete CountdownTimer unless driven by real promotion end-date; reword to "A 500-year-old craft - our family since 1999". -> /impeccable clarify

[P1] Mandatory barcode packing, no override. PackingMode.tsx:972 blocks completion until all items scanned; barcodes generated by the app from name+id and shown on screen with a Copy button — verification against data the app invented. ~10 interactions/order. Opening the modal writes in_packing before any user action, no path back. Fix: always-enabled "Mark as packed"; scanning opt-in; move in_packing write to first real action; add "Back to New". -> /impeccable distill

[P1] Wrong homepage order — bespoke ask before any product or price. Fix: Hero -> Category -> Products -> Artisan story -> Process -> Promise -> Custom Design -> Testimonials -> Closing CTA. Move Custom Design block down, delete its duplicate. Consider 3 product cards in the hero's lower third. -> /impeccable layout

[P2] Three dashboard homes; useful component on a dead one. page.tsx (live), page-old.tsx (dead, 331 lines), dashboard-home/page.tsx (dead but PUBLICLY ROUTABLE, 444 lines). DashboardAlerts.tsx — the only "N orders waiting / N low stock" component and the home screen's missing CTA — imported solely by the dead file. ~1520 lines removable, ~60 worth reviving. -> /impeccable distill

[P2] Two design systems, twice over. src/app/dashboard/ui/ forks src/shared/ui/ with hardcoded slate instead of tokens; orders/page.tsx imports buttons from both on one screen; the fork drops the focus ring (focus:ring-0) — a11y regression. dashboard.css:89-93 sets background-image:none !important on the subtree, so every bg-gradient-* in the dashboard is silently dead. -> /impeccable extract

[P2] Motion/payload cost on mid-range Android. 12 permanent composited particle layers never gated on mobile; cta-glow animates box-shadow on infinite loop; loading="eager" forced on 4 category images + 4 of 5 hero slides, defeating LCP; public/ is 8.3MB with four PNGs over 670KB. Dead shipping code: 47-line RAF auto-scroll whose ref is never attached, unused component, unused import, unread state. -> /impeccable optimize

## Persona Red Flags

45-year-old first-time buyer, mid-range Android, 4G: taps saree -> login modal, leaves. No search field exists anywhere. 3.5-4 screens before a rupee figure. No returns policy; "Free Shipping" is a 7.5px badge with no threshold. No fabric guidance. Countdown + 30% off + stock testimonial trigger the "is this a real shop?" alarm the footer's GSTIN must fight from 11 screens away. Add-to-cart is opacity-0 until group-hover — unreachable on touch.

NRI diaspora buyer, desktop: no international shipping info; Rs-only prices, two AP addresses, three +91 numbers; phone login implies +91 OTP. GI tag never mentioned — the registered Geographical Indication is the strongest verifiable proof the brand owns, replaced by a self-made "Authenticity Certified" icon. Wall art (most giftable/shippable for diaspora) links nowhere.

Shop owner, Monday morning: badge says 6, "New" tab shows 2, four orders unshipped. Some orders are status `pending` with no tab. First paint reads "No orders found - try adjusting your filters" (no loading state); she assumes it's broken. Start Packing on wrong row -> permanently "Processing". On phone, no action buttons render.

Assistant adding 20 products: 20 round trips, no "save and add another", no CSV import. No unsaved-changes guard (beforeunload zero times) — one back-gesture after 15 fields + image upload loses everything silently. Delete reports "Product Deleted" even on failure. One shared admin password = no audit trail; revoking his access changes the owner's password.

## Minor Observations
- No linter at all. next lint removed in Next 16 so `npm run lint` is broken; no .eslintrc*/eslint.config* in repo.
- tsc --noEmit: 8 errors, all in tests/, zero in src/. Jest doesn't type-check so they never block a build.
- 67 console.log + 77 console.error + 20 console.warn ship (removeConsole unsupported under Turbopack). 251 `any`, 6 @ts-ignore.
- InventoryProvider mounted in ROOT layout; getProducts() fetches entire product table with NO limit — every storefront visitor downloads the full catalog.
- Sidebar inquiries badge queries .eq("status","pending"); DB CHECK allows only new|solved|ignored. Permanently 0 — customer messages sit unnoticed. One-word fix.
- Sidebar brand mark is https://ui-avatars.com/api/?name=SK — third-party generated-initials PNG on a heritage brand's own tool.
- next.config.mjs still lists two wixstatic.com remote patterns despite the "zero Wix" claim, plus via.placeholder.com and picsum.photos.
- Nested <main> (HomePage inside AppWrapper); role="banner" on hero conflicts with the real <header>.
- Dark mode half-implemented on both surfaces; orphan dark: variants fight a forced white background.
- "Est. Badge" block renders two hairlines and NO content — text removed, empty flex container with margins remains.
- CategoryBarChart assigns colors by array index with comments naming categories — mislabels silently when ranking changes.
- Sidebar roles[] arrays are discarded at :181 (`const filteredItems = menuItems`) — role-based nav is scaffolding never wired.

## Questions to Consider
1. If you deleted every word and kept only the layout, could anyone tell this sells 500-year-old hand-painted temple textiles rather than mid-price Scandinavian furniture? It can't. So "improve the homepage" isn't more sections — it's replacing the gold-and-Playfair shell with a system derived from the craft: mordant palette, narrative-band layout, border grammar.
2. Why make a stranger create an account to look at a saree, then spend 570 lines convincing that stranger to trust you? The trust argument reaches people who already left.
3. You own a real GI tag, GSTIN, two shopfronts, real artisans, a 1999 founding date — and lead with a stock-photo testimonial and a countdown that resets on refresh. What would this page look like if every claim had to be verifiable? Shorter, and higher-converting.
4. Has anyone opened the dashboard against a database with more than 20 orders? That filter bug is invisible below 20 and silent above it. What else has only ever been tested empty?
