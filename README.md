# Teamwork Tracker — Personal Analytics

Static, client-only dashboard for [Teamwork.com](https://www.teamwork.com/) that compares **scheduled** (currently manually entered) vs **utilised** (logged time) hours by week or month.

## Requirements

- **Node.js 20+**
- A Teamwork site with **CORS enabled** for your GitHub Pages origin (Site Settings → General → CORS). Without this, the browser cannot call the API.
- **API token** from Teamwork (Profile → API & Mobile).

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173/`). The app uses **hash routing** (`/#/dashboard`) so it works on GitHub Pages.

## Build

```bash
npm run build
npm run preview
```

Production builds use base path `/tw-analytics/` for GitHub Pages. For a fork, change `base` in `vite.config.ts` to match your repository name.

## Deploy (GitHub Pages)

1. Enable **Pages** → Source: **GitHub Actions**.
2. Push to `main`; the workflow in `.github/workflows/deploy.yml` builds and deploys `dist/`.

## Security

- The API token is stored **only in this browser** (encrypted with Web Crypto + a local device id). It is **not** sent to any server except Teamwork.
- Use **Change token**, **Logout**, or **Clear stored data** on shared machines.

## Limitations

- **Rate limits**: Teamwork API limits (e.g. 150 req/min on Grow). The client throttles when `X-Rate-Limit-Remaining` is low.
- **No backend**: All aggregation runs in the browser; large accounts may feel slower.

## License

MIT

## Disclaimer

This is a personal project developed entirely using AI.