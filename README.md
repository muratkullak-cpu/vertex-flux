# VERTEX FLUX 2.0

Production address: https://vertex-flux.vercel.app/

Static JavaScript client with Supabase Auth and Row Level Security, hosted by Vercel. The application provides client and property records, itemized quotes, an atomic quote acceptance action that creates a job once, job scheduling, tasks, payments, editable service prices, sector presentations, and persistent dynamic QR links.

## Main workflow

Sign in → select sector → create a client → create a quote using the Price Center or the quote form → inspect its line items → accept it → schedule the resulting job → move it through production and delivery → record and mark payment received. Job status changes to paid when linked received payments reach the quote total.

Dynamic QR links use `/q/<slug>`. The printed URL never changes. The QR management screen can update the HTTPS destination, disable the link, and view total scans. QR graphics are generated on demand by the goQR image API; save a print copy of the graphic before use. The redirect and scan counter are served from Supabase via `/api/q`.

## Local check

Run `python3 -m http.server 8080` in this directory and open `http://localhost:8080`. This tests the client UI, but serverless API routes require a Vercel deployment. Run `node --check` on the JavaScript files before publishing.

The Supabase project is `ujrgwowdxxazbjilstht`. Database migrations `vertex_atomic_quote_acceptance` and `vertex_dynamic_qr_links` have been applied to production. Production login and write operations require an authorized account; no production test records are created by this README.
