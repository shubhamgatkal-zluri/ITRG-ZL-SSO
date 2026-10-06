import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src';
const OUT = 'public';

// One entry per page.
//   layout  which shell to wrap the content in (src/<layout>.html). Default: the ITRG dashboard shell.
//   nav     sidenav anchor id to mark as the current page (ITRG shell only).
//   head    extra tags injected before </head>.
const ZLURI_HEAD = [
  '<link rel="stylesheet" href="assets/prototype.css">',
  '<script src="assets/zluri-metrics.js" defer></script>',
].join('\n');

const PAGES = {
  index: { title: 'CIO Analytics', nav: 'subnav-link-programs-service-desk-analyses-metrics' },
  zluri: {
    title: "Zluri's SaaS Management Platform",
    nav: 'subnav-link-zluri-saas-management',
    // Hide the blue "Service Desk Analytics" title bar on this page only.
    head: ZLURI_HEAD + '\n<style>#section-title-bar{display:none}body>header{height:auto}</style>',
  },
  'zluri-onboarding': {
    title: 'Set up Zluri',
    layout: 'layout-zluri',
    head: '<script src="assets/zluri/zluri-onboarding.js" defer></script>',
  },
  'zluri-overview': {
    title: 'Zluri — Overview',
    layout: 'layout-zluri',
    head: [
      '<script src="assets/highcharts.js"></script>',
      '<script src="assets/zluri/zluri-overview.js" defer></script>',
    ].join('\n'),
  },
};

const layoutCache = new Map();
function getLayout(name) {
  if (!layoutCache.has(name)) {
    layoutCache.set(name, fs.readFileSync(path.join(SRC, `${name}.html`), 'utf8'));
  }
  return layoutCache.get(name);
}

function render(slug, { title, nav, head = '', layout = 'layout' }) {
  const content = fs.readFileSync(path.join(SRC, 'pages', `${slug}.html`), 'utf8');
  let html = getLayout(layout)
    .replace('<!--CONTENT-->', content)
    .replace('<!--HEAD-->', head)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  if (nav) {
    const marked = html.replace(`<a id="${nav}"`, `<a id="${nav}" aria-current="page"`);
    if (marked === html) throw new Error(`nav id "${nav}" not found in ${layout}.html`);
    html = marked;
  }
  return html;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(SRC, 'assets'), path.join(OUT, 'assets'), { recursive: true });

for (const [slug, meta] of Object.entries(PAGES)) {
  fs.writeFileSync(path.join(OUT, `${slug}.html`), render(slug, meta));
  console.log(`built ${slug}.html`);
}
