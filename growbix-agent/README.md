# Growbix Script Agent — Vercel Deployment

## What's in here

```
pages/
  index.js        ← The full React app (frontend)
  api/
    claude.js     ← Secure server-side proxy to Anthropic API
styles/
  globals.css
package.json
.env.local.example
```

The API key **never touches the browser**. All Anthropic calls go through
`/api/claude`, which is a Vercel serverless function that injects the key
server-side.

---

## Deploy in 5 steps

### 1. Push to GitHub
Create a new private repo on GitHub and push this folder:
```bash
cd growbix-agent
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/growbix-agent.git
git push -u origin main
```

### 2. Import into Vercel
- Go to https://vercel.com → **Add New Project**
- Import your GitHub repo
- Framework preset will auto-detect as **Next.js**

### 3. Set environment variables
In Vercel → Project Settings → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-your-key-here` |
| `NEXT_PUBLIC_ACCESS_PASSPHRASE` | `your-team-passphrase` (optional) |

If you leave `NEXT_PUBLIC_ACCESS_PASSPHRASE` blank, no login screen appears.

### 4. Add your custom domain
Vercel → Project → **Domains** → Add your domain → follow the DNS instructions
(add a CNAME record pointing to `cname.vercel-dns.com`).

### 5. Deploy
Click **Deploy**. Done. Every future `git push` auto-deploys.

---

## Local development

```bash
cp .env.local.example .env.local
# Fill in your API key in .env.local

npm install
npm run dev
# Open http://localhost:3000
```

---

## Rotating the API key
Just update `ANTHROPIC_API_KEY` in Vercel environment variables and redeploy.
The key is never in the codebase.

## Changing the passphrase
Update `NEXT_PUBLIC_ACCESS_PASSPHRASE` in Vercel and redeploy.
Users will need to re-enter it (it clears on browser session end anyway).
