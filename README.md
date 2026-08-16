# East Heights Labs — Holding Page

Static holding page with email capture via Resend. Deployed on Vercel at eastheightslabs.com.

## Structure

```
├── public/
│   ├── index.html    — the page
│   └── hero.jpg      — background photo (replace with licensed Houston Heights shot)
├── api/
│   └── subscribe.js  — Vercel serverless function, posts to Resend audience
├── vercel.json       — routing + security headers
├── package.json
└── .env.example      — required env vars
```

## Setup

### 1. Resend

1. Create account at [resend.com](https://resend.com) (free tier: 3k emails/mo)
2. Add & verify domain: `eastheightslabs.com` (adds DNS records)
3. Create an Audience (Resend > Audiences > Create)
4. Generate an API key (Resend > API Keys)

### 2. Deploy to Vercel

```bash
npm install
npx vercel login
npx vercel --prod
```

Then in Vercel dashboard > Project > Settings > Environment Variables, add:
- `RESEND_API_KEY`
- `RESEND_AUDIENCE_ID`

Redeploy after adding env vars.

### 3. Connect domain

In Vercel dashboard > Project > Settings > Domains:
- Add `eastheightslabs.com`
- Vercel will give you DNS records — add them at your registrar

### 4. Hero photo

Replace `public/hero.jpg` with the licensed Houston Heights aerial shot when ready.
License from Shutterstock or Getty (~$30-50 standard web license).

## Email for the domain

Set up `hello@eastheightslabs.com` via:
- **Resend** (if you want to send from it too — free, recommended)
- **Google Workspace** ($6/mo, full Gmail)
- **Cloudflare Email Routing** (free forwarding to personal Gmail)
