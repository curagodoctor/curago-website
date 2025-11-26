# CuraGo Marketing & AURA Platform

End-to-end React/Vite single-page application that powers CuraGo’s public marketing site and the AURA Rise Index self-assessment funnel. The app highlights services, clinician bios, testimonials, and booking flows while capturing referral traffic and detailed analytics via GTM/GA4/Meta Pixel.

---

## Tech Stack
- **Framework:** React 18 + TypeScript, Vite + SWC
- **UI:** Tailwind CSS v4, shadcn/Radix primitives, framer-motion, lucide-react
- **Analytics:** Google Tag Manager, GA4, Meta Pixel (helpers in `src/utils/tracking.ts`)
- **Forms & Integrations:** Wylto webhook, WhatsApp deep links, bespoke AURA webhook
- **Deployment:** Static build → Nginx (Docker), optional Traefik reverse proxy, Vercel support

---

## Key Features
1. **Marketing Site**
   - Animated hero with inline booking form and CTA grid.
   - Services carousel + expertise marquee describing mental-health offerings.
   - Mental Health Team carousel + full roster powered by `src/data/teamMembers.ts`.
   - Testimonials marquee, About section, and rich Contact section with quick WhatsApp/phone CTAs.
2. **Lead Capture**
   - Appointment booking, contact callback, and campaign-ready lead forms.
   - Submissions routed to Wylto with metadata and multi-platform analytics events.
3. **AURA Rise Index**
   - `/aura-rise-index` landing page, quiz flow, and interactive results dashboard.
   - Auto-generated radar chart, strengths/growth insights, week plan, referral codes, WhatsApp share/copy, webhook to ops automation.
4. **Analytics & Attribution**
   - SPA-safe page views, CTA tracking, WhatsApp/phone events, referral share/copy, AURA-specific funnel events.
   - `curago_tracking_matrix.csv` tracks event definitions across GA4/GTM/Meta Pixel.
5. **Deployability**
   - Multi-stage Dockerfile, Traefik-enabled docker-compose, automated `deploy.sh`.
   - `vercel.json` for static hosting (requires aligning output directory).

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 10+

### Setup
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Vite serves the SPA at `http://localhost:5173` (port may vary). Any SPA route (e.g., `/aura-rise-index/quiz`) is handled client-side.

### Production Build
```bash
npm run build
```
Outputs to `dist/`. Serve with any static host or via the Docker workflow below.

---

## Project Structure (high level)
```
src/
  App.tsx              # Root shell controlling marketing vs AURA flows
  components/
    Hero.tsx, Services.tsx, Contact.tsx, ...
    assessment/        # AURA landing, quiz, results bundle
    ui/                # shadcn/Radix primitives
  data/
    teamMembers.ts     # Clinician roster
  utils/
    tracking.ts        # Analytics helpers (GA4/GTM/Meta)
    wylto.ts           # Webhook helper for forms
types/
  aura.ts              # Quiz answer & score types
curago_tracking_matrix.csv  # Event reference table
Dockerfile, docker-compose.yml, deploy.sh
```

---

## Configuration & Environment Notes
- **Referral codes:** Any `?ref=CODE` in the URL is preserved by all in-app navigation (see `buildUrl` in `App.tsx`) so forms and share links retain attribution.
- **Wylto webhooks:** URLs are currently hard-coded in `src/utils/wylto.ts`. If rotating, update there or move to env vars (`import.meta.env`).
- **AURA webhook:** Defined in `src/components/assessment/ResultScreen.tsx` (`WEBHOOK` constant).
- **Analytics IDs:** GTM container, GA4 ID, and Meta Pixel are loaded from `index.html`. GA4 ID can be overridden by setting `window.GA_MEASUREMENT_ID` before bootstrapping.

---

## Deployment

### Docker (standalone)
```bash
docker build -t curago-web .
docker run -p 8080:80 curago-web
```
Serves the built assets via Nginx with SPA fallback, gzip, long-lived static caching, and `/health`.

### Docker Compose + Traefik
1. Ensure DNS for `curago.in` points to the host.
2. Run `sudo ./deploy.sh` (installs Docker/Compose if needed, configures UFW, builds images, brings up Traefik + website, performs curl smoke tests).
3. Logs: `docker compose logs -f`.
4. Update `docker-compose.yml` labels if domains change.

### Vercel
- `vercel.json` invokes `npm run build` and rewrites everything to `index.html`.
- Update `"outputDirectory"` to `dist` (default Vite output) if deploying without custom build dir.

---

## Analytics & QA Checklist
- Confirm GTM/GA4/Meta scripts load (see `index.html`).
- Validate SPA page views via `trackPageView` calls when navigating between hero/team/booking/contact sections and AURA routes.
- On each form submission, ensure:
  - Network request hits the appropriate Wylto endpoint.
  - `trackFormSubmission` logs appear in console for GA4 + Meta + GTM.
  - Success dialogs/toasts display and fields reset.
- Run through the full AURA flow:
  - Landing CTA fires `trackCTA`.
  - Quiz start/completion events pushed to `dataLayer`.
  - Result screen heartbeats, scroll-depth, section views, and form funnel events appear in GTM preview.
  - Webhook submission returns 200 OK.
- Use `curago_tracking_matrix.csv` to cross-check that every GTM trigger matches the implemented event names.

---

## Additional Documentation
- **Software Design Doc:** `CuraGo_SDD.md` – detailed architecture, data flow, analytics, risks, and future roadmap.
- **Tracking Reference:** `curago_tracking_matrix.csv`.
- **Deployment Script Guide:** Embedded comments in `deploy.sh`.

---

## Support & Contributions
This repository is optimized for internal CuraGo teams. For new features or bug fixes:
1. Open an issue describing the change and tracking implications.
2. Branch from `main`, follow the existing component patterns, and reuse tracking helpers.
3. Validate forms/AURA flow/analytics locally before raising a PR.
