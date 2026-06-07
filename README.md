# 🤖 AI Customer Support Chatbot Widget

A 100% free, production-ready embeddable chat widget powered by Google Gemini AI.
Zero monthly subscription cost. Deploy in under 15 minutes.

---

## 📁 Project Structure

```
chatbot-widget/
├── api/
│   └── chat.js          ← Serverless backend (Vercel)
├── widget/
│   └── chatbot.js       ← Embeddable frontend widget
├── knowledge.json       ← Your client's knowledge base
├── vercel.json          ← Vercel config
├── package.json
└── README.md
```

---

## 🚀 STEP 1 — Get a Free Gemini API Key

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with a Google account
3. Click **"Create API Key"** → copy it somewhere safe
4. The free tier gives you **15 requests/minute** and **1 million tokens/day** — plenty for most clients

---

## 🚀 STEP 2 — Deploy the Backend to Vercel (Free)

### 2a. Create a GitHub repository

1. Go to **https://github.com/new**
2. Name it `ai-chatbot-backend` (private is fine)
3. Upload these files to the repo:
   - `api/chat.js`
   - `knowledge.json`
   - `vercel.json`
   - `package.json`

### 2b. Deploy to Vercel

1. Go to **https://vercel.com** → sign up free with GitHub
2. Click **"Add New Project"** → import your `ai-chatbot-backend` repo
3. Leave all settings as default → click **"Deploy"**
4. Once deployed, note your URL: `https://ai-chatbot-backend-xxxx.vercel.app`

### 2c. Add your Gemini API Key securely

1. In Vercel dashboard → open your project → **Settings → Environment Variables**
2. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** (paste your API key from Step 1)
   - **Environment:** Production + Preview + Development
3. Click **Save** → go to **Deployments** → click **"Redeploy"**

✅ Your backend API is now live at:
`https://ai-chatbot-backend-xxxx.vercel.app/api/chat`

---

## 🚀 STEP 3 — Host the Widget File (Free)

### Option A: Host on the same Vercel project (easiest)

Just add `widget/chatbot.js` to the root of your project and push.
It will be served at:
`https://ai-chatbot-backend-xxxx.vercel.app/widget/chatbot.js`

### Option B: GitHub Pages (also free)

1. Create a new GitHub repo named `chatbot-widget-cdn`
2. Upload `widget/chatbot.js` into it
3. Go to **Settings → Pages** → Source: **main branch** → Save
4. Widget is at: `https://yourusername.github.io/chatbot-widget-cdn/chatbot.js`

---

## 🚀 STEP 4 — Customize the knowledge.json

Open `knowledge.json` and edit:

| Field | What to change |
|-------|---------------|
| `_meta.business_name` | Your client's business name |
| `_meta.bot_name` | The chatbot's name (e.g. "Aria", "Max", "ZipBot") |
| `_meta.bot_greeting` | First message the bot sends |
| `_meta.contact_email` | Client's support email |
| `_meta.fallback_message` | What bot says when it doesn't know |
| `qa_pairs` | Add/edit specific questions and answers |
| `general_info` | Business description, location, team info |
| `policies` | Return policy, warranties, terms |
| `rules` | Behavioural guardrails for the AI |

After editing, push to GitHub. Vercel auto-redeploys in ~30 seconds.

---

## 🚀 STEP 5 — Embed on the Client's Website

Have your client paste this ONE line before `</body>`:

```html
<script
  src="https://YOUR-CDN-URL/widget/chatbot.js"
  data-api="https://YOUR-BACKEND.vercel.app/api/chat"
  data-bot-name="Aria"
  data-greeting="Hi! How can I help you today?"
  data-color="#2563EB"
  defer
></script>
```

### Widget Configuration Options

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-api` | URL to your Vercel backend | Required |
| `data-bot-name` | Name shown in the header | "Support" |
| `data-greeting` | Opening message | "Hi! How can I help?" |
| `data-color` | Brand hex color | #2563EB (blue) |

### Color examples for different clients:
- Blue: `#2563EB`
- Purple: `#7C3AED`
- Green: `#059669`
- Red: `#DC2626`
- Black: `#0F172A`

---

## 🧠 How to Feed a Client's Website Data into the Bot

### Method 1: Manual (easiest)
1. Visit the client's website
2. Copy text from key pages: Home, About, Services, Pricing, FAQ, Contact
3. Ask Claude: *"Format this text as a knowledge.json file for my chatbot"*
4. Paste the result into your `knowledge.json`

### Method 2: Free scraping tool
1. Go to **https://webscraper.io** (free browser extension)
2. Scrape the text from each page
3. Paste all the text to Claude and ask it to structure a `knowledge.json`

---

## 🔒 Security Notes

- ✅ Your Gemini API key is **only on Vercel servers** — never in the browser
- ✅ Messages are capped at 800 characters client-side, 2000 server-side
- ✅ Only `user` and `model` roles are accepted — no prompt injection via role spoofing
- ✅ Add your client's domain to `Access-Control-Allow-Origin` in `chat.js` for production:
  ```js
  res.setHeader('Access-Control-Allow-Origin', 'https://yourclient.com');
  ```

---

## 💡 Pricing Model Ideas (for reselling)

| Tier | What you charge | Your cost |
|------|-----------------|-----------|
| Basic Setup | $99–$199 one-time | $0 |
| Monthly Maintenance | $29–$49/month | $0 |
| Knowledge Base Updates | $25/update | $0 |
| Custom Branding | $49 one-time | $0 |

Your only cost is time. Everything runs on free tiers.

---

## ❓ Troubleshooting

**Widget doesn't appear** → Check browser console for errors. Confirm the `src` URL is correct and accessible.

**Bot says "I don't have this information"** → The answer isn't in your `knowledge.json`. Add a `qa_pair` entry for that question.

**API errors in console** → Check that `GEMINI_API_KEY` is set in Vercel → Environment Variables. Redeploy after adding it.

**CORS error** → Make sure `data-api` in the script tag points to your Vercel URL, not localhost.

**Rate limit hit** → Gemini free tier is 15 req/min. If a client is getting heavy traffic, implement rate limiting or upgrade to a paid API key.
