# VERTEX FLUX 2.0

Production address: https://vertex-flux.vercel.app/

Static JavaScript client with Supabase Auth and Row Level Security, hosted by Vercel. The application provides client and property records, itemized quotes, an atomic quote acceptance action that creates a job once, job scheduling, tasks, payments, editable service prices, sector presentations, and persistent dynamic QR links.

## Main workflow

Sign in → select sector → create a client → create a quote using the Price Center or the quote form → inspect its line items → accept it → schedule the resulting job → move it through production and delivery → record and mark payment received. Quote and line items are created together by `vertex_create_quote`. Payment receipt and the resulting job status are updated together by `vertex_mark_payment`; a second receipt of the same payment is rejected. Job status changes to paid when linked received payments reach the quote total. Clients can be archived and reactivated without deleting their records.

Dynamic QR links use `/q/<slug>`. The printed URL never changes. The QR management screen can update the HTTPS destination, disable the link, and view total scans. QR graphics are generated on demand by the goQR image API; save a print copy of the graphic before use. The redirect and scan counter are served from Supabase via `/api/q`.

The QR screen also offers an on-demand destination check through `/api/qr-check`. It requires a signed-in VERTEX user, reads the saved destination under Supabase RLS, and probes public HTTPS hosts without following redirects or incrementing scans. A 2xx response is reachable, 404/410 is missing, and other responses or network errors remain unverified. `/api/cron/qr-health` is scheduled daily at 08:00 UTC by `vercel.json`; it requires Vercel Production `CRON_SECRET` and `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) and writes to `qr_health`. This only checks the initial HTTP response; it does not guarantee an interactive tour works. On 29 September 2026 the Vercel team was suspended, so this scheduled path and the public QR redirect were not verified live. A labelled test link exists in Supabase, and its database resolver and scan counter were verified.

## Local check

Run `python3 -m http.server 8080` in this directory and open `http://localhost:8080`. This tests the client UI, but serverless API routes require a Vercel deployment. Run `node --check` on the JavaScript files before publishing.

The Supabase project is `ujrgwowdxxazbjilstht`. Database migrations `vertex_atomic_quote_acceptance` and `vertex_dynamic_qr_links` have been applied to production. Production login and write operations require an authorized account; no production test records are created by this README.

Google Ads API v25 uses the associated Google Cloud project's API access and no longer requires a developer token. The live account check returns the manager and accessible customer IDs through `/api/google/accounts`.

Backups contain the raw records of clients, properties, quotes, jobs, quote items, tasks, payments, and QR links. Restore inserts missing records in one database transaction; it does not overwrite records already present. It restores missing pricing settings and audit history, subscription periods, customer file metadata, jewelry records and image credit history. Storage file bytes and Auth accounts are not included. Migration `vertex_restore_missing_backup` adds this operation, and `vertex_qr_authenticated_grants` grants authorized users access to QR management.

The QR monthly report records scan timestamps in `qr_scans` and groups by month in Türkiye time. The private Market screen stores observed prices with source URLs and dates. The Finance screen stores expenses separately from received and pending payments; the displayed difference between receipts and expenses is not a tax or accounting profit calculation. Backups also include market sources, cost entries, and pricing settings.

## Kuyumcu ürün stüdyosu

The Kuyum workspace includes a per-client jewelry shop. Create an active Kuyum client, then open its shop, assign an existing Supabase Auth user by email, and add a product with a real JPG/PNG/WebP photo (10 MB maximum). Member accounts see only their assigned shop's products. Originals and generated drafts live in the private `jewelry-private` bucket. `/api/jewelry` authenticates the user, reserves the daily free image, the product’s one free regeneration, or one paid image credit atomically, sends the original to the OpenAI Images API using `gpt-image-2`, and stores the 1008×1792 candidate privately. The operator compares original and candidate and explicitly approves publication. Only then does the server copy the image to `jewelry-public`. Public collections are at `/koleksiyon/<shop-slug>` and remain hidden until the admin enables the shop.

Production needs `SUPABASE_SECRET_KEY` (or the legacy service-role key) and `OPENAI_API_KEY` in Vercel. Supabase migrations for the jewelry tables, buckets, quota claim, and member assignment have been applied to project `ujrgwowdxxazbjilstht`. Do not place secret keys in client files. AI results can alter fine product details; a human must check each image. No production product was created and no image provider call or live storefront test was completed while Vercel remained paused. Branding, branches, comments with moderation, favorites, in-site notifications, update history, image rights and a four-second Sora video preview/approval route are implemented. Browser push, orders/shipping, automatic payments, and self-service credit purchases are not implemented. Video and images still need live provider testing.

Monthly and yearly subscriptions are recorded with a selected due date. Recorded receipt advances a period atomically, adds credits once, and resumes linked VERTEX QR access. Optional unpaid/paused/cancelled suspension affects VERTEX QR links, not third-party tour host URLs. Presentation exit supports a hashed 6–12 digit PIN with five-failure lockout. Customer dossiers include private files and service history. QR creation includes Google review, WhatsApp, Instagram, Maps, dynamic and static modes. On or after that date, an authorized operator can renew once, advancing the date and crediting the client in a single transaction. No payment is collected automatically. Manual credit changes are recorded in an append-only ledger. The backup includes subscriptions and credit movements.

## Sector presentation imagery

The six images under `assets/presentation/` are illustrative Unsplash stock photos, not examples of VERTEX client work or interactive 360 tours. The presentation labels them accordingly. Source image IDs: `1600596542815-ffad4c1539a9`, `1600210492486-724fe5c67fb0`, `1605100804763-247f67b3557e`, `1515562141207-7a88fb7ce338`, `1566073771259-6a8506099945`, `1611892440504-42a792e24d32`. License: https://unsplash.com/license. Images are hosted with the app so the slides do not depend on a remote image service during a meeting.

## Verification — 29 September 2026

`sql/verify-operations.sql` and `sql/verify-jewelry-rights.sql` passed against production inside rollback-only transactions. Two-shop RLS, customer comments/favorites/follow notifications were also exercised in rolled-back fixtures. New customer signup defaults to customer, not admin. Vercel connector returns no teams and the production URL still displays Deployment Paused; release and browser end-to-end validation are blocked. Actual customers and jewelry products remain absent. The price audit, live advertising forecasts, orders, commodity feeds and payment checkout remain open in PROJECT_GAP_AUDIT.md.
