# I built a free nail art color tool with AI — here's what I learned

**Tags:** ai, webdev, beginners, showdev

**Canonical URL:** https://vicnailstudio.com/ai/ai-nail-color-recommendation-guide

---

A few months ago, I was helping run a nail salon when a recurring problem came up almost daily:

*"I want something that looks good for my skin tone and suits a wedding I'm attending next month — but I don't know where to start."*

Most customers knew they wanted something, but couldn't describe it. Most salon lookup tools were either too generic ("pick from 200 colors!") or too specific ("here are all our Gel Polish SKUs").

So I built a simple free tool: **a nail art color recommendation engine** that takes a few inputs and returns the 3 best color directions for your occasion and skin tone.

Here's what I actually learned from building it.

---

## What the tool does (the non-technical version)

You give it three things:

1. **Skin undertone** — warm, cool, or neutral (with a short guide to help you identify yours)
2. **Occasion** — daily wear, work, date night, wedding, vacation
3. **Season** — current season affects trending tones

It returns: 3 color directions, each with a name, hex code preview, why it suits your inputs, and 2–3 example nail style descriptions.

Simple. Useful. Something I would have wanted as a customer.

---

## Building it: the AI part was easier than I expected

I used Claude (Anthropic's API) to generate the personalized recommendations. The prompt engineering was surprisingly quick to get right — about 4 iterations before results were consistently usable.

The tricky part wasn't the AI. It was **the UX around it**.

### Lesson 1: Users don't want to think about undertones

"What's your skin undertone?" stopped a surprising number of users. They didn't know. So I added an inline mini-guide: *"Look at your wrist veins. Blue/purple → cool. Green → warm. Both → neutral."*

Completion rate went from ~60% to ~90% on that step.

### Lesson 2: Output format matters more than output quality

Early versions returned a wall of text. Technically accurate, but nobody read past the first paragraph.

When I restructured output as: **[Color Name] → [1-line why] → [Style description]**, engagement time tripled. Same underlying content. Different presentation.

### Lesson 3: "Free" needs a reason to exist

I kept getting asked: *"Why is this free?"*

Turned out to be a good question. The tool is free because it drives traffic to VicNail Studio's content (articles, product guides). The recommendation output links to related articles naturally. It's a content engine disguised as a utility tool.

That clarity — knowing *why* the free tool exists in the business model — helped me make better product decisions throughout.

---

## The technical stack (keep it boring)

- **Frontend:** Next.js (already running the site on it)
- **AI:** Claude API via `@anthropic-ai/sdk`
- **Deployment:** Vercel
- **Cost per recommendation:** ~$0.001 (sub-cent, Claude Haiku model)

No database. No authentication. Just a form → API → response → display.

I deliberately kept the stack boring so I could ship in a weekend. It worked.

---

## What surprised me

**AI personalization actually works for niche domains.** I expected vague, generic recommendations. Instead, Claude consistently produced responses that felt genuinely tailored — because the prompt included enough context (undertone + occasion + season) to constrain the output meaningfully.

**The biggest user complaint wasn't the AI — it was mobile layout.** The color swatch display broke on smaller screens and that got more feedback than any recommendation quality issue.

**Domain knowledge in the prompt > sophisticated model.** I included a paragraph of actual nail color theory in the system prompt (warm undertones suit earthy tones, cool undertones suit blue-based neutrals, etc.). That domain knowledge improved outputs far more than any prompt engineering trick.

---

## Is it worth building AI tools for niche/local markets?

Yes — with caveats.

The nail beauty market is huge globally, but most AI tools are built for English-speaking, Western markets. Localization — adapting color recommendations for Asian skin tones and local salon trends — created a meaningful differentiation with very little extra effort.

If you have domain expertise in any niche market, the combination of AI + that expertise is a practical moat. The AI handles breadth. Your domain knowledge handles accuracy and relevance.

---

## Try it

The tool is live and free at [vicnailstudio.com](https://vicnailstudio.com) — look for the color recommendation tool in the AI section.

If you're building something similar (AI + niche domain + content strategy), I'm happy to answer questions in the comments.

---

*This article is cross-posted from [VicNail Studio](https://vicnailstudio.com).*
