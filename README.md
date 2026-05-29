# XXVI Strengths — Deployment Guide

## What's in this package

A complete web app built with React + Vite, deployable to Vercel in about 5 minutes.

```
xxvi-strengths/
├── src/
│   ├── main.jsx          # React entry point
│   └── App.jsx           # The full application
├── api/
│   └── narrative.js      # Serverless function — calls Anthropic API
├── index.html            # HTML entry point
├── vite.config.js        # Vite config
├── vercel.json           # Vercel routing config
├── package.json          # Dependencies
└── .env.example          # Environment variable template
```

---

## Deploy to Vercel (recommended — free tier is fine)

### Step 1 — Get the code onto GitHub
1. Create a free account at github.com if you don't have one
2. Create a new repository called `xxvi-strengths`
3. Upload all files from this zip into that repository

### Step 2 — Connect to Vercel
1. Go to vercel.com and sign up / log in with your GitHub account
2. Click **Add New → Project**
3. Select your `xxvi-strengths` repository
4. Vercel will auto-detect it as a Vite project — click **Deploy**

### Step 3 — Add your Anthropic API key
1. In Vercel, go to your project → **Settings → Environment Variables**
2. Add a new variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key (get one at console.anthropic.com)
3. Click **Save** then **Redeploy**

That's it — your app will be live at `xxvi-strengths.vercel.app` (or similar).

---

## Custom domain (optional)
1. In Vercel → **Settings → Domains**
2. Add your domain e.g. `strengths.xxvi.com.au`
3. Follow the DNS instructions Vercel provides

---

## Local development
```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

---

## Getting an Anthropic API key
1. Go to console.anthropic.com
2. Sign up / log in
3. Go to **API Keys** → **Create Key**
4. Copy the key and add it to Vercel as above

The narrative generation (the personalised summary on the results page) uses the API. Everything else — questions, scoring, bar chart, visualisation — works without it.

---

## Notes
- The app shuffles task order within each section on every new session
- No data is stored — results exist only in the browser session
- Print / Save PDF uses the browser's built-in print dialog
