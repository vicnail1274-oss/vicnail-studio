# Hacker News — Show HN Post

> Tone: honest, technical, no hype. HN readers are skeptical — be direct about what it is, what it isn't, and how it works.

---

## Title

**Show HN: DevPlaybook – 42 browser-based dev tools, client-side only, no signup**

---

## Body

I built DevPlaybook (devplaybook.cc) because I kept opening the same slow, ad-heavy sites to do basic tasks like formatting JSON or testing a regex. I wanted something fast and private, so I built it.

**What it is:**
42 developer tools that run entirely in your browser. JSON formatter, API tester, JWT decoder, regex tester, cron expression builder, LLM token counter, Base64 encoder, diff checker, and more. Each tool has its own URL.

**The privacy angle:**
Everything is client-side JavaScript. No requests leave your browser for the free tools. This is particularly relevant for JWT Decoder (why paste tokens into a third-party server?) and API Tester (your request payloads stay local).

**Tech stack:**
- Astro for the static site framework — each page is mostly HTML, JS only loads for the specific tool island
- Preact (3kb vs React's 45kb) for interactive tool components
- Tailwind CSS for styling
- Cloudflare Pages for deployment (global edge, ~100ms TTFB)
- Lighthouse 90+ across all pages

**Architecture decision:**
Each tool is a self-contained Preact island component. Astro's partial hydration means you get zero JavaScript overhead on the page shell. The JSON formatter loads its island JS; the API tester loads its island JS. No shared bundle bloat.

**Business model:**
Free tier: 39 tools, permanently free, no login required.
Pro tier ($9.99/mo): 3 AI-assisted tools (code review, doc generation, SQL builder). Powered by Claude API server-side for these specific tools — these are the only ones that hit a backend.
One-time digital product ($9 on Gumroad): cheatsheets and workflow templates.

**What I'm not claiming:**
- This isn't novel. DevDocs, transform.tools, and CyberChef all exist. I'm not trying to replace them — they solve different problems (docs/transforms/encoding chains).
- The Pro AI tools do hit a server (that's how LLM APIs work). Only the core 39 tools are fully client-side.
- It's not open source yet. I'm evaluating it.

**What I'd love feedback on:**
- Are there tools missing that you actually reach for often?
- Any tools where privacy matters enough that you'd switch from your current solution?
- The LLM Token Counter has been surprisingly popular — is accurate token counting something you'd pay for in a better form?

Code is inspectable in your browser devtools if you want to verify the client-side claims.

---

## Likely HN Questions (Prepared Responses)

**"How is this different from transform.tools?"**
transform.tools is excellent for data transformations between formats. DevPlaybook has a broader scope — API testing, security tools, design utilities, DevOps helpers — not just format transforms. Different scope, some overlap.

**"Why Preact instead of vanilla JS?"**
Most tools have enough interactivity (real-time validation, copy buttons, multi-pane UIs) that vanilla JS would be more code and more maintenance. Preact's 3kb overhead is worth it. For something like a simple hash generator I'd agree vanilla is fine, but the regex tester with live matching and capture group display benefits from reactive state.

**"Your API tester sends requests — that means it hits a server."**
Correct, and that server is the one you're testing, not mine. The request is constructed and dispatched from your browser via `fetch()`. I have no visibility into what you test.

**"Cloudflare can see your traffic."**
Yes, at the TLS/IP layer. Your actual tool input (the JSON you paste, the JWT you decode) never reaches a Cloudflare server — it stays in your browser tab. Standard HTTPS caveats apply.

**"$9.99/mo for 3 AI tools seems expensive."**
Fair. It's aimed at power users who use AI code review regularly. The LLM API costs are real. Happy to hear what pricing feels right to HN readers.
