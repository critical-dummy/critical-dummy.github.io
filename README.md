# critical-dummy

Personal developer website for `critical-dummy` built with Next.js App Router, TypeScript, Tailwind CSS, and the GitHub REST API.

## Customization

All editable copy, navigation links, development interests, highlighted repository names, theme accent tokens, and contact channels live in `config/site.ts`.

## Environment Variables

- `GITHUB_TOKEN` (optional, server-side only): raises the GitHub REST API rate limit from 60 to 5,000 requests/hour. Never expose this token with a `NEXT_PUBLIC_` prefix.
- `NEXT_PUBLIC_SITE_URL` (optional): sets the canonical `metadataBase` URL when serving behind a primary custom domain.

## Dual-Domain Deployment (`critical-dummy.github.io` + Custom Domain on Vercel)

1. Deploy this repository to Vercel (`npm run build` / standard Next.js preset).
2. Add both your custom domain and `critical-dummy.github.io` (via CNAME DNS record pointing to Vercel's target, or serve the built site across both domains) in the Vercel project's **Domains** settings without forcing a redirect between them so both domains serve the exact same website.
3. All internal routes use relative paths and `metadataBase` adapts automatically via `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL`.
