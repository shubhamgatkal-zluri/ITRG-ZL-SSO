# ITRG-ZL-SSO

Static prototype of the SSO handoff from Info-Tech's **CIO Analytics** dashboard into **Zluri**.

Built from a saved copy of the live Info-Tech page (`reference/`), so the shell, CSS and fonts are
the real ones. The Zluri screens are rebuilt by hand from `v1-dashboard` — no backend, no login.

## Live

**https://itrg-zl-sso.vercel.app** — deployed from Vercel, rebuilt on every push to `main`.
Build settings live in `vercel.json`, not the dashboard.

## Run it

```bash
npm start          # builds, then serves http://localhost:4050
```

**Use the server, not `file://`.** Chrome refuses to load the SVG mask behind the hexagon section
badges over `file://`, so the badges vanish. Everything else works either way.

## The flow

```
/                  CIO Analytics dashboard (the real saved page)
/zluri             Zluri metrics inside Info-Tech  ← the new nav entry
   │
   ├── First day on Zluri  → one button, "Access Zluri"
   │       └── /zluri-onboarding   3-step Zluri setup wizard → Finish setup → /zluri-overview
   │
   └── Regular day → Zluri overview iframe + "Open Zluri"
           └── /zluri-overview     Zluri overview, dropped in directly, no login
```

The **First day / Regular day** switch floats in the bottom-right of `/zluri` (that page only).
The white button in the hero follows it: "Access Zluri" to the wizard, or "Open Zluri" to the overview.
It remembers your last choice in `localStorage`, so a demo picks up where you left it.

### The Zluri overview iframe

Regular day embeds `https://app.zluri.dev/mock-itrg-overview?partner=Zluri`: a login-free copy of
Zluri's Overview dashboard with hardcoded numbers and no API calls. The page lives in
`v1-dashboard` (`src/modules/MockItrgOverview/`) and only renders on app.zluri.dev, opened directly
or framed by this Vercel deploy. Anywhere else it redirects to page-not-found. v1-dashboard's nginx
`frame-ancestors` header (`default.conf`) lists `https://itrg-zl-sso.vercel.app` so the frame loads.

- On `localhost` the iframe points at `http://localhost:4040/mock-itrg-overview` instead, because
  app.zluri.dev refuses to be framed from localhost. Start v1-dashboard with `npm start` first.
- `?partner=Zluri` is required. Inside an iframe, v1-dashboard otherwise assumes the Tangoe partner
  embed and waits forever for an Auth0 connection.
- The frame renders at 1280px and scales down to fit, because v1-dashboard swaps in a small-screen
  notice below 1200px. It sits flush under the hero and stretches to the bottom of the window.

## Layout

```
src/layout.html          Info-Tech shell: head, header, side nav. Holds <!--CONTENT--> and <!--HEAD-->.
src/layout-zluri.html    Bare shell for the Zluri screens, which bring their own chrome.
src/pages/*.html         Page bodies, one file per page.
src/assets/              Info-Tech CSS/JS/SVG lifted from the saved page, plus Highcharts.
src/assets/zluri/        Zluri stylesheet, scripts and logos copied from v1-dashboard.
build.mjs                Stitches layout + page, sets <title>, marks the active nav link.
public/                  Build output (gitignored).
reference/               The original saved Info-Tech page, untouched.
```

## Add a page

1. Drop `src/pages/<slug>.html` — content only, no shell.
2. Register it in `PAGES` in `build.mjs`: `title`, optional `layout`, `nav` (sidenav link id) and
   `head` (extra tags, e.g. a stylesheet or script).
3. For an Info-Tech page, also add the nav link in `src/layout.html` — copy the Zluri `<li>`.

The active-page highlight comes from `aria-current="page"`, which `build.mjs` sets on the nav id
you register. A missing id fails the build loudly rather than silently doing nothing.

## Where the design came from

**Info-Tech side** (`/zluri`) — the hero, the first-day card, colour tokens and typography are copied
from the saved CIO Analytics page: primary `#1a75d3`, fonts Montserrat / Exo / Roboto.

**Zluri side** — rebuilt from `v1-dashboard`:

- Wizard copy, step structure and CSS from `src/components/Onboarding/StepsAll.js` and
  `Onboarding.css`. Brand blue `#2266e2`, selected-tile border `#5abaff`, field border `#dddddd`.
- Overview structure, KPI labels and chart titles from `src/modules/Overview-v2/` — MANAGED APPS,
  ACTIVE EMPLOYEES, AVERAGE USAGE, TOTAL SPEND, CONTRACT RENEWALS, then ACTUAL SPEND PER MONTH /
  AVERAGE SPEND PER USER / COST OF CONTRACTS.
- Side-nav items from `src/components/Sidebar/useSidebarMenu.tsx`.
- Logos (`zluri.svg`, `okta.svg`, `gsuite.svg`, …) copied straight out of the Onboarding folder.

## Known gaps

- **The Zluri overview iframe needs v1-dashboard's `develop` deploy.** Until app.zluri.dev has the
  `/mock-itrg-overview` route and the `frame-ancestors` entry for this domain, the frame is refused.
- **All numbers are made up.** Twelve months of plausible demo data, Oct 2025 – Sep 2026, hardcoded
  in `src/assets/zluri/zluri-overview.js`. The `/zluri` iframe's numbers sit at the top of
  v1-dashboard's `src/modules/MockOverview/MockOverview.tsx`.
- The real Zluri wizard has a fourth step, "Onboard Your Users to Zluri" (connect your HRMS). It's
  left out here because its own UI labels the flow "Step N of 3" and the HRMS logos aren't in the
  Onboarding folder.
- The overview is a hand-built replica, not the live React module. Same structure, labels and
  colours; the interactions (drill-downs, filters, dropdowns) are not wired up.
- Charts on the CIO Analytics home page are the saved snapshot. Their `turbo-frame src` attributes
  were stripped, otherwise Turbo re-fetches from the live site, hits the login wall and blanks them.
- Every other Info-Tech nav link still points at `us.app.cioanalytics.ai`. Only **Metrics** (home)
  and **Zluri's SaaS Management Platform** (its own IT GOVERNANCE section, below Service Desk) stay local.
- `logo-infotech.jpg` was missing from the saved copy, so the sidebar logo falls back to
  `info-tech-logo-blue-a9dd7c97.svg`.
