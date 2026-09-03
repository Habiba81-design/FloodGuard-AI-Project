# FloodGuard AI - interactive prototype

A clickable prototype of the Find → Evidence → Diagnose → Prioritize workflow for the Alajo, Accra pilot. Act / Verify / Learn are shown as a locked "pilot phase" roadmap, not interactive - this matches the honest "built vs. planned" framing in the Concept deck and Pilot Plan.

## Run it locally first (recommended before deploying)

You need [Node.js](https://nodejs.org) installed (any recent version).

```
npm install
npm run dev
```

Open the local URL it prints (usually `http://localhost:5173`) and click through it once to confirm everything looks right before you deploy or record.

## Deploy and get a live link

**Option A - Netlify Drop (fastest, no account needed)**
```
npm install
npm run build
```
This creates a `dist/` folder. Go to **https://app.netlify.com/drop** and drag the `dist` folder onto the page. You'll get a live URL in seconds.

**Option B - Vercel (needs a free account)**
```
npm install -g vercel
vercel
```
Follow the prompts (defaults are fine). It deploys and gives you a URL directly in the terminal.

**Option C - GitHub Pages**
Push this folder to a GitHub repo, then in repo Settings → Pages, deploy from the `dist/` folder after running `npm run build`, or use the `gh-pages` package.

## What's real vs. illustrative

All location, rainfall, and diagnosis data is sample data clearly labeled in the app header - built to demonstrate the workflow logic, not live sensor/GMet feeds. That's consistent with what your Concept deck and Pilot Plan say is live today vs. planned for the pilot.
