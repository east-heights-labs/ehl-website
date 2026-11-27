// Vercel serverless function — GET /e/:id (rewritten to /api/e/:id)
// Event landing page for ShowHunter universal links.
// Required env vars (set in Vercel dashboard):
//   API_BASE_URL — backend host (e.g. set in project env settings)

const APP_STORE_URL = 'https://apps.apple.com/app/id6806097824';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SAFE_SEGMENT = /^[A-Za-z0-9_:\-]+$/;

function splitEventId(id) {
  if (!id || typeof id !== 'string') return null;
  const dash = id.indexOf('-');
  if (dash <= 0 || dash === id.length - 1) return null;
  const source = id.slice(0, dash);
  const sourceId = id.slice(dash + 1);
  if (!SAFE_SEGMENT.test(source) || !SAFE_SEGMENT.test(sourceId)) return null;
  return { source, sourceId };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  // Prefer YYYY-MM-DD as a calendar date (avoid UTC shift)
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  let d;
  if (m) {
    d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  } else {
    d = new Date(dateStr);
  }
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  // Accept HH:MM or HH:MM:SS
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?/.exec(String(timeStr));
  if (!m) return String(timeStr);
  let h = Number(m[1]);
  const min = m[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${min} ${ampm}`;
}

function baseStyles() {
  return `
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:#08070d;color:#f4f1f8;font-family:Inter,system-ui,sans-serif;min-height:100vh}
a{color:#d65cf5;text-decoration:none}a:hover{color:#e79bfa}
.wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;background:
  radial-gradient(ellipse 80% 50% at 50% -10%,rgba(214,92,245,0.18),transparent 60%),
  linear-gradient(180deg,#0c0a12 0%,#08070d 100%)}
.card{width:100%;max-width:440px;display:flex;flex-direction:column;gap:20px;align-items:center;text-align:center}
.logo{display:flex;align-items:center;gap:12px;text-decoration:none;color:#f4f1f8}
.logo img{width:40px;height:40px;border-radius:10px}
.logo span{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:20px;letter-spacing:-0.01em}
.poster{width:100%;max-width:320px;aspect-ratio:1;object-fit:cover;border-radius:20px;border:1px solid #241f2f;background:#13101b}
h1{margin:0;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(1.75rem,5vw,2.5rem);line-height:1.05;letter-spacing:-0.03em}
.meta{margin:0;font-size:16px;line-height:1.55;color:#c9c2d4}
.body{margin:0;font-size:16px;line-height:1.55;color:#c9c2d4;max-width:28rem}
.actions{display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;padding-top:8px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;max-width:320px;padding:16px 24px;border-radius:14px;font-weight:600;font-size:16px;font-family:Inter,sans-serif;border:0;cursor:pointer}
.btn-primary{background:#d65cf5;color:#08070d}
.btn-primary:hover{background:#e79bfa;color:#08070d}
.badge{display:inline-block;line-height:0}
.badge img{height:40px;width:auto}
.foot{margin-top:24px;font-size:13px;color:#9a91a8}
`.trim();
}

function appStoreBadge() {
  // Official-style App Store badge (SVG) — links to App Store ID 6806097824
  return `<a class="badge" href="${APP_STORE_URL}" aria-label="Download on the App Store">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" height="40" role="img" aria-label="Download on the App Store">
    <rect width="120" height="40" rx="6" fill="#f4f1f8"/>
    <g fill="#08070d">
      <path d="M24.5 8.2c.1 1.1-.3 2.2-1 3-.8.9-2 1.5-3.1 1.4-.1-1.1.4-2.2 1-2.9.8-.9 2.1-1.5 3.1-1.5zM27.4 20.3c-.1.1-1.8 1.1-1.8 3.3 0 2.6 2.2 3.5 2.3 3.5-.1.2-.4 1.2-1.2 2.3-.7 1-1.5 2-2.6 2-.1 0-.8.2-1.6.1-.8-.1-1.5-.4-2.3-.4-.8 0-1.6.3-2.3.4-.9.1-1.5-.2-2.3-.7-1.6-1-2.8-3.6-2.8-5.8 0-2.4 1.6-3.6 3.1-3.6.8 0 1.5.4 2.1.4.6 0 1.4-.5 2.4-.4 1 .1 1.8.4 2.4 1.1-.1.1-.8.5-1.2 1.4.7-.2 1.6.1 2.1.5.4.3.8.8.9 1.3z"/>
      <text x="36" y="15" font-family="Inter,Helvetica,Arial,sans-serif" font-size="7" font-weight="500">Download on the</text>
      <text x="36" y="28" font-family="Inter,Helvetica,Arial,sans-serif" font-size="13" font-weight="700">App Store</text>
    </g>
  </svg>
</a>`;
}

function renderPage({ title, ogTitle, ogDescription, ogImage, body }) {
  const ogTags = [
    `<meta property="og:title" content="${escapeHtml(ogTitle)}">`,
    ogDescription
      ? `<meta property="og:description" content="${escapeHtml(ogDescription)}">`
      : '',
    ogImage
      ? `<meta property="og:image" content="${escapeHtml(ogImage)}">`
      : '',
    `<meta property="og:type" content="website">`,
  ]
    .filter(Boolean)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
${ogTags}
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet">
<style>${baseStyles()}</style>
</head>
<body>
${body}
</body>
</html>`;
}

function renderEventHtml(event, source, sourceId) {
  const title = event.title || 'ShowHunter';
  const venueName = (event.venue && event.venue.name) || '';
  const dateLabel = formatDate(event.date);
  const showTime = event.time_tbd === false && event.doors_time;
  const timeLabel = showTime ? formatTime(event.doors_time) : '';
  const metaParts = [venueName, dateLabel, timeLabel].filter(Boolean);
  const ogDescription = [venueName, dateLabel].filter(Boolean).join(' • ');
  const imageUrl = event.image_url || null;
  const deepLink = `onstage://event?source=${encodeURIComponent(source)}&id=${encodeURIComponent(sourceId)}`;

  const poster = imageUrl
    ? `<img class="poster" src="${escapeHtml(imageUrl)}" alt="">`
    : '';

  const body = `
<div class="wrap">
  <div class="card">
    <a class="logo" href="/showhunter">
      <img src="/apple-touch-icon.png" alt="">
      <span>ShowHunter</span>
    </a>
    ${poster}
    <h1>${escapeHtml(title)}</h1>
    ${metaParts.length ? `<p class="meta">${escapeHtml(metaParts.join(' · '))}</p>` : ''}
    <div class="actions">
      <a class="btn btn-primary" href="${escapeHtml(deepLink)}">Open in ShowHunter</a>
      ${appStoreBadge()}
    </div>
    <p class="foot">Don't have the app? Get it on the App Store.</p>
  </div>
</div>`;

  return renderPage({
    title,
    ogTitle: title,
    ogDescription: ogDescription || undefined,
    ogImage: imageUrl || undefined,
    body,
  });
}

function renderFallbackHtml() {
  const body = `
<div class="wrap">
  <div class="card">
    <a class="logo" href="/showhunter">
      <img src="/apple-touch-icon.png" alt="">
      <span>ShowHunter</span>
    </a>
    <h1>Open in ShowHunter</h1>
    <p class="body">Download the app to see this show and discover live events near you.</p>
    <div class="actions">
      ${appStoreBadge()}
    </div>
  </div>
</div>`;

  return renderPage({
    title: 'ShowHunter',
    ogTitle: 'ShowHunter',
    body,
  });
}

async function lookupEvent(source, sourceId) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    console.error('Missing API_BASE_URL');
    return null;
  }

  const url = `${base.replace(/\/$/, '')}/api/v1/events/${encodeURIComponent(source)}/${encodeURIComponent(sourceId)}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Event lookup failed:', err);
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  const rawId = req.query.id;
  const parts = splitEventId(Array.isArray(rawId) ? rawId[0] : rawId);

  let html = renderFallbackHtml();

  if (parts) {
    const event = await lookupEvent(parts.source, parts.sourceId);
    if (event) {
      html = renderEventHtml(event, parts.source, parts.sourceId);
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).send(req.method === 'HEAD' ? '' : html);
};
