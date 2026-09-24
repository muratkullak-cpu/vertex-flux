# VERTEX FLUX 2.0

Production address: https://vertex-flux.vercel.app/

Static JavaScript client with Supabase Auth and Row Level Security, hosted by Vercel. The application provides client and property records, itemized quotes, an atomic quote acceptance action that creates a job once, job scheduling, tasks, payments, editable service prices, sector presentations, and persistent dynamic QR links.

## Main workflow

Sign in → select sector → create a client → create a quote using the Price Center or the quote form → inspect its line items → accept it → schedule the resulting job → move it through production and delivery → record and mark payment received. Quote and line items are created together by `vertex_create_quote`. Payment receipt and the resulting job status are updated together by `vertex_mark_payment`; a second receipt of the same payment is rejected. Job status changes to paid when linked received payments reach the quote total. Clients can be archived and reactivated without deleting their records.

Dynamic QR links use `/q/<slug>`. The printed URL never changes. The QR management screen can update the HTTPS destination, disable the link, and view total scans. QR graphics are generated on demand by the goQR image API; save a print copy of the graphic before use. The redirect and scan counter are served from Supabase via `/api/q`.

The QR screen also offers an on-demand destination check through `/api/qr-check`. It requires a signed-in VERTEX user, reads the saved destination under Supabase RLS, and probes public HTTPS hosts without following redirects or incrementing scans. A 2xx response is reachable, 404/410 is missing, and other responses or network errors remain unverified. This is not scheduled monitoring and does not guarantee that an interactive tour works after its initial HTTP response.

## Local check

Run `python3 -m http.server 8080` in this directory and open `http://localhost:8080`. This tests the client UI, but serverless API routes require a Vercel deployment. Run `node --check` on the JavaScript files before publishing.

The Supabase project is `ujrgwowdxxazbjilstht`. Database migrations `vertex_atomic_quote_acceptance` and `vertex_dynamic_qr_links` have been applied to production. Production login and write operations require an authorized account; no production test records are created by this README.

Google Ads API v25 uses the associated Google Cloud project's API access and no longer requires a developer token. The live account check returns the manager and accessible customer IDs through `/api/google/accounts`.

Backups contain the raw records of clients, properties, quotes, jobs, quote items, tasks, payments, and QR links. Restore inserts missing records in one database transaction; it does not overwrite records already present. It does not restore pricing settings or audit history. Migration `vertex_restore_missing_backup` adds this operation, and `vertex_qr_authenticated_grants` grants authorized users access to QR management.

The QR monthly report records scan timestamps in `qr_scans` and groups by month in Türkiye time. The private Market screen stores observed prices with source URLs and dates. The Finance screen stores expenses separately from received and pending payments; the displayed difference between receipts and expenses is not a tax or accounting profit calculation. Backups also include market sources, cost entries, and pricing settings.

Subscriptions are recorded with a manually selected renewal date. On or after that date, an authorized operator can renew once, advancing the date and crediting the client in a single transaction. No payment is collected automatically. Manual credit changes are recorded in an append-only ledger. The backup includes subscriptions and credit movements.

## Sector presentation imagery

The six images under `assets/presentation/` are illustrative Unsplash stock photos, not examples of VERTEX client work or interactive 360 tours. The presentation labels them accordingly. Source image IDs: `1600596542815-ffad4c1539a9`, `1600210492486-724fe5c67fb0`, `1605100804763-247f67b3557e`, `1515562141207-7a88fb7ce338`, `1566073771259-6a8506099945`, `1611892440504-42a792e24d32`. License: https://unsplash.com/license. Images are hosted with the app so the slides do not depend on a remote image service during a meeting.
