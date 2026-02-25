import { useState, useEffect } from "react";

// ── Passphrase gate ───────────────────────────────────────────────────────────
// If ACCESS_PASSPHRASE is set in Vercel env vars, users must enter it once.
// The value is stored in sessionStorage so they don't re-enter on refresh.
const REQUIRED_PASSPHRASE = process.env.NEXT_PUBLIC_ACCESS_PASSPHRASE || "";

function PassphraseGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput]       = useState("");
  const [error, setError]       = useState(false);

  useEffect(() => {
    if (!REQUIRED_PASSPHRASE) { setUnlocked(true); return; }
    if (sessionStorage.getItem("growbix_auth") === REQUIRED_PASSPHRASE) setUnlocked(true);
  }, []);

  if (!REQUIRED_PASSPHRASE || unlocked) return children;

  function attempt() {
    if (input === REQUIRED_PASSPHRASE) {
      sessionStorage.setItem("growbix_auth", input);
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  }

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#222",fontFamily:"'Montserrat',sans-serif"}}>
      <div style={{background:"#2e2e2e",padding:"40px 36px",borderRadius:16,width:320,display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <span style={{fontSize:26}}>🚀</span>
          <div>
            <div style={{fontWeight:900,fontSize:17,color:"#fff",letterSpacing:"-0.03em"}}>growbix</div>
            <div style={{fontWeight:700,fontSize:9,color:"#ff5757",textTransform:"uppercase",letterSpacing:"0.12em"}}>Script Agent</div>
          </div>
        </div>
        <p style={{fontSize:12,color:"#838383",fontWeight:600}}>Enter your access passphrase</p>
        <input
          type="password"
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&attempt()}
          placeholder="Passphrase"
          style={{padding:"10px 12px",background:"#414141",border:`1.5px solid ${error?"#ff5757":"#5c5c5c"}`,borderRadius:8,color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none",transition:"border-color 0.15s"}}
          autoFocus
        />
        {error && <p style={{fontSize:11,color:"#ff5757",fontWeight:700,marginTop:-8}}>Incorrect passphrase</p>}
        <button onClick={attempt} style={{padding:"11px 20px",background:"#ff5757",border:"none",borderRadius:8,color:"#fff",fontWeight:800,fontSize:13,fontFamily:"inherit",cursor:"pointer"}}>
          Enter
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return <PassphraseGate><App /></PassphraseGate>;
}


const STORAGE_KEY = "growbix_ugc_brands";
const HISTORY_KEY = "growbix_ugc_history";

const defaultBrands = [
  {
    id: "1",
    name: "Sample Brand",
    product: "Organic skincare serum for sensitive skin",
    audience: "Women 25-40 who struggle with redness and irritation",
    tone: "Warm, trustworthy, science-backed but approachable",
    websiteUrl: "",
    trustpilotUrl: "",
    notes: "",
    failedAlternatives: "",
    mainObjection: "",
    keyResult: "",
    mechanism: "",
    heroProof: "",
    competitorCliches: "",
    founderStory: "",
    priceAndOffer: "",
  },
];

function loadBrands() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : defaultBrands; } catch { return defaultBrands; }
}
function loadHistory() {
  try { const r = localStorage.getItem(HISTORY_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
}
function saveHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); }
function saveBrands(b) { localStorage.setItem(STORAGE_KEY, JSON.stringify(b)); }

const GOALS      = ["Drive purchase","Build awareness","Get sign-ups","Retarget warm audience","Boost social proof"];
const ANGLES     = ["Problem → Solution","Before & After","Social proof","Founder story","Myth busting","Tutorial/How-to","Unboxing/reveal"];
const EMOTIONS   = ["Curiosity","Urgency","Trust","FOMO","Empathy","Excitement","Relief"];
const STAGES     = ["Cold audience","Warm — seen content","Retargeting — visited site","Retargeting — added to cart","Existing customer"];
const FORMATS    = ["Talking head UGC","Voiceover + B-roll","Text on screen","Reaction / Duet","POV first-person","Montage / Highlights"];
const LENGTHS    = ["15 seconds","30 seconds","60 seconds","90 seconds"];
const AUD_TEMPS  = ["Cold — never heard of us","Warm — engaged but not bought","Retargeting — visited/added to cart","Existing customers"];
const FUNNEL     = ["Awareness","Consideration","Conversion","Retention"];
const AD_FORMATS = ["Talking head (UGC)","Voiceover + B-roll","Text hook + UGC","Reaction/Duet","Screen recording"];
const AD_LENGTHS = ["15 seconds","30 seconds","60 seconds","90 seconds"];
const KPIS       = ["ROAS","CPA","CPL","CTR","Reach / CPM"];

// ── Ad Copy specific ─────────────────────────────────────────────────────────
const AWARENESS  = ["Unaware — feels pain, no solution sought","Problem-aware — knows they have a problem","Solution-aware — comparing options","Product-aware — knows us, not convinced","Most aware — ready to buy, needs a nudge"];
const HEADLINE_T = ["Benefit-led — specific result promised","News — 'Introducing / New / Finally'","Curiosity — open loop, tension","How-to — practical promise","Command — strong imperative","Social proof — number or name leads"];
const PLACEMENT  = ["Meta Feed (image/carousel)","Meta Stories / Reels","Google Display","Email subject + preview","SMS / push notification","Landing page hero"];
const DESIRED_ACT= ["Buy now / Add to cart","Click to learn more","Sign up / Register","Claim offer / Redeem","Book a call / Demo","Download / Get free resource"];

// ── DOCX export helper ───────────────────────────────────────────────────────
function loadDocxScript() {
  return new Promise((resolve) => {
    if (window.docx) return resolve();
    const s = document.createElement("script");
    s.src = "https://unpkg.com/docx@8.5.0/build/index.js";
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

async function exportToDocx(brandName, history) {
  await loadDocxScript();
  const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, HeadingLevel } = window.docx;

  const RED = "FF5757";
  const DARK = "222222";
  const GRAY = "5C5C5C";
  const LIGHT = "F4F4F4";

  const children = [];

  // Title
  children.push(new Paragraph({
    children: [new TextRun({ text: brandName + " — UGC Scripts", bold: true, size: 40, color: DARK, font: "Arial" })],
    spacing: { after: 120 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "Exported by Growbix Script Agent  ·  " + new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" }), size: 20, color: GRAY, font: "Arial" })],
    spacing: { after: 480 },
  }));

  history.forEach((entry, ei) => {
    if (entry.type === "adcopy") return; // skip ad copy entries in script export
    const date = new Date(entry.savedAt).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" });
    const time = new Date(entry.savedAt).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });

    // Entry heading
    children.push(new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: "EBEBEB", space: 1 } },
      children: [new TextRun({ text: date + " at " + time, bold: true, size: 26, color: DARK, font: "Arial" })],
      spacing: { before: ei === 0 ? 0 : 480, after: 80 },
    }));

    // Brief tags
    children.push(new Paragraph({
      children: [
        new TextRun({ text: entry.brief.goal + "  ·  " + entry.brief.angle + "  ·  " + entry.brief.emotion, size: 18, color: GRAY, font: "Arial", italics: true }),
      ],
      spacing: { after: 280 },
    }));

    entry.scripts.forEach((s) => {
      // Variation badge line
      children.push(new Paragraph({
        children: [
          new TextRun({ text: "V" + s.variation + "  ", bold: true, size: 20, color: "FFFFFF", highlight: "red", font: "Arial" }),
          new TextRun({ text: "  " + s.angle_label, bold: true, size: 20, color: DARK, font: "Arial" }),
        ],
        spacing: { before: 240, after: 120 },
      }));

      // Hook
      children.push(new Paragraph({ children: [new TextRun({ text: "HOOK", bold: true, size: 16, color: RED, font: "Arial" })], spacing: { after: 60 } }));
      children.push(new Paragraph({ children: [new TextRun({ text: s.hook, bold: true, size: 22, color: DARK, font: "Arial" })], spacing: { after: 160 } }));

      // Body
      children.push(new Paragraph({ children: [new TextRun({ text: "BODY", bold: true, size: 16, color: RED, font: "Arial" })], spacing: { after: 60 } }));
      children.push(new Paragraph({ children: [new TextRun({ text: s.body, size: 20, color: GRAY, font: "Arial" })], spacing: { after: 160 } }));

      // CTA
      children.push(new Paragraph({ children: [new TextRun({ text: "CTA", bold: true, size: 16, color: RED, font: "Arial" })], spacing: { after: 60 } }));
      children.push(new Paragraph({ children: [new TextRun({ text: s.cta, bold: true, size: 20, color: RED, font: "Arial" })], spacing: { after: 200 } }));
    });
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = brandName.replace(/[^a-z0-9]/gi, "_") + "_UGC_Scripts.docx";
  a.click();
  URL.revokeObjectURL(url);
}

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [view, setView]                   = useState("generate");
  const [brands, setBrands]               = useState(loadBrands);
  const [selectedBrandId, setSelectedBrandId] = useState(loadBrands()[0]?.id || "");
  const [brief, setBrief] = useState({ goal:"", angle:"", emotion:"", audienceStage:"", adFormat:"", adLength:"", funnelStage:"", kpi:"", activeOffer:"", extra:"" });
  const [adCopyBrief, setAdCopyBrief] = useState({ awarenessLevel:"", dominantClaim:"", headlineType:"", placement:"", desiredAction:"", funnelStage:"", kpi:"", activeOffer:"", extra:"" });
  const [scripts, setScripts]             = useState(null);
  const [adCopies, setAdCopies]           = useState(null);
  const [loading, setLoading]             = useState(false);
  const [adCopyLoading, setAdCopyLoading] = useState(false);
  const [error, setError]                 = useState("");
  const [adCopyError, setAdCopyError]     = useState("");
  const [fetchStatus, setFetchStatus]     = useState(null);
  const [adCopyFetchStatus, setAdCopyFetchStatus] = useState(null);
  const [history, setHistory]             = useState(loadHistory);   // { brandId: [entry] }
  const [exportState, setExportState]     = useState("idle");        // idle | loading | done | error
  const [exportUrl, setExportUrl]         = useState(null);
  const [editingBrand, setEditingBrand]   = useState(null);
  const [brandForm, setBrandForm]         = useState({ name:"", product:"", audience:"", tone:"", websiteUrl:"", trustpilotUrl:"", mechanism:"", keyResult:"", failedAlternatives:"", mainObjection:"", heroProof:"", guarantee:"", competitorCliches:"", founderStory:"", priceAndOffer:"", notes:"" });

  useEffect(() => { saveBrands(brands); }, [brands]);
  useEffect(() => { saveHistory(history); }, [history]);

  const selectedBrand = brands.find(b => b.id === selectedBrandId);
  const brandHistory  = history[selectedBrandId] || [];

  // ── Fetch helper ────────────────────────────────────────────────────────
  async function fetchUrlContent(url, instruction) {
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role:"user", content:`${instruction} URL: ${url}. Summarise in plain text under 400 words. Focus on facts, product claims, and real customer language. No markdown.` }],
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) return null;
      return data.content?.filter(b => b.type==="text").map(b => b.text).join(" ").trim() || null;
    } catch { return null; }
  }

  // ── Generate ────────────────────────────────────────────────────────────
  async function generateScripts() {
    if (!selectedBrand) return setError("Select a brand first.");
    if (!brief.goal || !brief.angle || !brief.emotion) return setError("Please fill in goal, angle, and emotion.");
    setError(""); setLoading(true); setScripts(null); setFetchStatus(null);

    const [websiteContent, trustpilotContent] = await Promise.all([
      selectedBrand.websiteUrl ? fetchUrlContent(selectedBrand.websiteUrl, "Visit this product/brand website and extract: product descriptions, key benefits, USPs, pricing if shown, and any notable claims.") : null,
      selectedBrand.trustpilotUrl ? fetchUrlContent(selectedBrand.trustpilotUrl, "Visit this Trustpilot page and extract: common themes in reviews, specific phrases customers use, what they love, what problems the product solved.") : null,
    ]);

    setFetchStatus({
      website:    selectedBrand.websiteUrl    ? (websiteContent    ? "✓ fetched" : "⚠ unavailable") : "—",
      trustpilot: selectedBrand.trustpilotUrl ? (trustpilotContent ? "✓ fetched" : "⚠ unavailable") : "—",
    });

    const brandContext = [
      `- Product/Offer: ${selectedBrand.product}`,
      `- Target Audience: ${selectedBrand.audience}`,
      `- Tone of Voice: ${selectedBrand.tone}`,
      selectedBrand.mechanism        && `- Mechanism / Point of difference: ${selectedBrand.mechanism}`,
      selectedBrand.keyResult        && `- Key result + timeframe: ${selectedBrand.keyResult}`,
      selectedBrand.priceAndOffer    && `- Price & current offer: ${selectedBrand.priceAndOffer}`,
      selectedBrand.failedAlternatives && `- What customers tried before (the villain): ${selectedBrand.failedAlternatives}`,
      selectedBrand.mainObjection    && `- #1 customer objection to overcome: ${selectedBrand.mainObjection}`,
      selectedBrand.heroProof        && `- Hero proof (numbers, testimonials): ${selectedBrand.heroProof}`,
      selectedBrand.guarantee        && `- Guarantee / risk reversal: ${selectedBrand.guarantee}`,
      selectedBrand.founderStory     && `- Founder / brand story: ${selectedBrand.founderStory}`,
      selectedBrand.competitorCliches && `- Competitor clichés to actively avoid: ${selectedBrand.competitorCliches}`,
      websiteContent    && `- Website content (extracted):\n${websiteContent}`,
      trustpilotContent && `- Trustpilot customer reviews (extracted):\n${trustpilotContent}`,
      selectedBrand.notes && `- Account manager notes:\n${selectedBrand.notes}`,
    ].filter(Boolean).join("\n\n");

    const systemPrompt = `You are the world's most elite UGC (user-generated content) script writer for Meta ads. You have deeply studied the greatest advertising minds in history — Eugene Schwartz's "Breakthrough Advertising" and David Ogilvy's "Ogilvy on Advertising" — and you combine their timeless principles with modern performance marketing to write scripts that are categorically better than anything a human advertiser could produce manually.

Your scripts don't just describe products. They channel mass desire, build belief, create identification, and move people emotionally before they are sold anything.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAND INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${brandContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE CORE PHILOSOPHY (from Schwartz & Ogilvy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCHWARTZ — MASS DESIRE & INTENSIFICATION:
Copy cannot create desire — it can only channel the desire that already exists in the hearts of millions. Your job is to take that pre-existing desire, focus it like a laser onto this product, and intensify it until purchase becomes inevitable. The desire is already there. You are not selling — you are directing.

SCHWARTZ — THE FIVE LEVELS OF AWARENESS:
Always write to the prospect's current state of awareness. For a cold Meta audience: they feel the pain but don't know this product. Never lead with the product. Lead with the desire, the problem, or the identity. Make them feel understood before you offer any solution.

SCHWARTZ — INTENSIFICATION TECHNIQUES:
- Put the product in action: show the reader living inside the result, moment by moment
- Stretch benefits through time: show what life looks like in 1 week, 1 month, 6 months after using it
- Bring in an audience: let the viewer imagine others witnessing their transformation
- Use the "before and after" not as a format but as an emotional arc — the before must hurt, the after must glow
- Never repeat — reinforce. Each new angle on the same desire makes the need feel more urgent and real

SCHWARTZ — MECHANISM & BELIEVABILITY:
Every claim must have a mechanism — the specific "how" behind the result. Without a mechanism, claims feel like hype. With one, they feel like proof. Name the mechanism. Describe it. Feature it.

OGILVY — THE BIG IDEA:
Every great ad is built on one "big idea" — a single, dominant concept that could not have come from a formula. Ask yourself: if you stripped the script down to one sentence, what is the irreducible promise? That is your big idea. Everything else must serve it.

OGILVY — HEADLINES (apply to hooks):
A hook has only one job — to stop the scroll and force the viewer to watch the next 3 seconds. It must promise a benefit, present news, or provoke a tension the viewer desperately wants resolved. Specificity is credibility: "I lost 6kg in 3 weeks" beats "I finally lost weight." Accurate figures are more believable than vague promises.

OGILVY — BODY COPY PRINCIPLES:
- Write in a conversational, personal tone — as if writing to one specific person
- Never be clever for the sake of it. Clarity sells. Confusion kills
- The consumer is not stupid. Treat them as an intelligent adult
- Provide enough information that belief is built step-by-step
- Testimonials and real customer language dramatically increase credibility — use them verbatim where available

OGILVY — BRAND IMAGE:
Every script contributes to the brand's long-term image. While selling hard, also build something aspirational — a world the viewer wants to belong to.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 6 CMO-LEVEL SCRIPT STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HYPER-SPECIFIC HOOKS (not generic)
   BAD: "I was so skeptical at first…"
   GOOD: "I spent €340 on skincare last year and my skin still looked like a teenager's nightmare."
   The hook must name a situation, a number, a pain point, or a contradiction so specific that the ideal customer feels it is written about them personally.

2. NAME THE VILLAIN
   Every high-converting script has an enemy — a false belief, a competing product category, an industry lie, a wasted behaviour. The villain creates stakes. Without stakes there is no story. Without story there is no sale.
   Examples: "Every moisturiser I tried just sat on top of my skin", "I believed the expensive brands were better — they're not", "I'd been doing everything right and still nothing worked."

3. BUILD A MICRO-ARC IN THE BODY
   The body must follow an emotional narrative: SITUATION → FRUSTRATION → TURNING POINT → RESULT → NEW IDENTITY
   Do NOT jump to product benefits. Earn the right to present the solution by making the viewer feel the problem first. The turning point is where the product enters — naturally, not as an interruption.

4. REAL CUSTOMER LANGUAGE AS PROOF
   If Trustpilot data is available, extract the exact phrases, emotional words, and specific outcomes real customers described. Weave these into the script naturally — not as a quote block, but as part of the UGC narrator's lived experience. This is Ogilvy's testimonial principle applied to UGC format.

5. THE "SO WHAT" REFRAME
   Every script needs one line that reframes the product's value emotionally — not functionally. Not "it hydrates your skin" but "for the first time I actually liked what I saw in the mirror." This is Schwartz's intensification applied to identity.

6. SHARP, SPECIFIC, URGENT CTA
   Passive CTAs kill conversions. The CTA must contain: a specific action + a reason to act now + friction removal.
   BAD: "Check it out on our website."
   GOOD: "Link in bio — they ship within 24 hours and your first order includes free returns."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRUCTURAL REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOOK (0-3 seconds):
- One punchy sentence or visual situation
- Must be hyper-specific — name a number, situation, contradiction or pain point
- Pattern interrupt: starts the story in the middle, not at the beginning
- Never start with "I" + generic adjective ("I was so tired of…")

BODY (15-45 seconds):
- Follow the SITUATION → FRUSTRATION → TURNING POINT → RESULT → NEW IDENTITY arc
- Name the villain (false belief, bad alternative, industry norm)
- Introduce the product at the turning point — never before
- Use the mechanism: explain briefly HOW it works, not just WHAT it does
- One real customer voice or phrase woven in naturally if review data is available
- Include one "so what" emotional reframe line
- Stretch one benefit through time if space allows ("within a week… by month two…")

CTA (5-10 seconds):
- Specific action + urgency/reason + friction removal
- Match the campaign goal: purchase = link + incentive; awareness = brand anchoring; sign-up = what they get

OVERALL:
- 60-90 seconds when read aloud at normal conversational pace
- Each of the 3 variations must use a completely different hook type, villain, and narrative angle — not just different words for the same idea
- Sound unmistakably like a real person, never like an ad

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ACCURACY: Never invent prices, discounts, percentages, statistics, or claims not present in the brand info above. If no price is given, do not reference one.
- LANGUAGE: No profanity, crude language, or shock tactics. Clean, brand-safe, emotionally intelligent.
- Output ONLY valid JSON — no markdown fences, no preamble, no explanation. Pure JSON.

ANTI-AI WRITING RULES — these patterns make copy sound generated, not human. They are forbidden in hook, body, and CTA:
- No em-dashes used as a connector mid-sentence (e.g. "I tried everything — nothing worked" → rewrite as two sentences or use a comma)
- No "—" anywhere in the output copy
- No bullet-point logic leaked into prose (no "problem → solution", no "step 1, step 2" framing inside the script)
- No list-style sentences ("It's fast. It's effective. It's affordable.")
- No corporate transition phrases: "That's when I discovered", "And here's the thing", "The truth is", "And the best part?", "Here's what happened"
- No rhetorical questions used as hooks ("Are you tired of...?", "What if I told you...?")
- Write the way a specific real person actually speaks — uneven sentences, natural hesitations in phrasing, the kind of language that doesn't sound rehearsed`;

    const userPrompt = `Write 3 UGC ad script variations for the following brief. Each variation must be GENUINELY distinct — different hook type, different villain, different narrative angle, different entry point into the desire. They should not feel like the same script reworded.

BRIEF:
- Campaign goal: ${brief.goal}
- Audience / funnel stage: ${brief.audienceStage || "Not specified — assume cold audience"}
- Funnel position: ${brief.funnelStage || "Not specified"}
- Primary KPI: ${brief.kpi || "Not specified"}
- Creative angle: ${brief.angle}
- Target emotion: ${brief.emotion}
- Ad format: ${brief.adFormat || "Talking head UGC"}
- Target ad length: ${brief.adLength || "60 seconds"}
${brief.activeOffer ? `- Active offer / promotion: ${brief.activeOffer}` : ""}
${brief.extra ? `- Additional context: ${brief.extra}` : ""}

VARIATION STRATEGY — use a different approach for each:
V1: Lead with a SPECIFIC SITUATION or NUMBER that the ideal customer immediately recognises as their own life. The villain is a false belief or wasted behaviour.
V2: Lead with a CONTRADICTION or PATTERN INTERRUPT — something that challenges what the viewer expected. The villain is the product category that failed them before.
V3: Lead with the AFTER — open in the middle of the result, then flashback to the before. The villain is the emotional cost of doing nothing.

For each variation:
- The hook must be razor-specific (name a number, scenario, or contradiction)
- The body must follow: SITUATION → FRUSTRATION → VILLAIN → TURNING POINT → MECHANISM → RESULT → EMOTIONAL REFRAME
- The CTA must be action + urgency + friction removal
- angle_label should be 3-5 words describing the creative angle used (e.g. "Wasted Money Pattern Interrupt", "Silent Villain Before/After", "Specific Number Hook")

Return ONLY this exact JSON, nothing else:
{"scripts":[{"variation":1,"angle_label":"...","hook":"...","body":"...","cta":"..."},{"variation":2,"angle_label":"...","hook":"...","body":"...","cta":"..."},{"variation":3,"angle_label":"...","hook":"...","body":"...","cta":"..."}]}`;

    try {
      const res  = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:4000, system:systemPrompt, messages:[{role:"user",content:userPrompt}] }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(`API error: ${data.error?.message || `HTTP ${res.status}`}`); setLoading(false); return; }
      const text = data.content?.map(b=>b.text||"").join("") || "";
      if (!text) { setError("Empty response from API."); setLoading(false); return; }
      let parsed;
      try {
        // Strip code fences and extract JSON object robustly
        let clean = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
        const start = clean.indexOf("{");
        const end = clean.lastIndexOf("}");
        if (start === -1 || end === -1) throw new Error("No JSON object found");
        clean = clean.slice(start, end + 1);
        parsed = JSON.parse(clean);
      } catch (e) { setError(`JSON parse failed: ${text.slice(0,200)}`); setLoading(false); return; }

      const newScripts = parsed.scripts;
      setScripts(newScripts);

      // ── Auto-save to history ──
      const entry = {
        id: Date.now().toString(),
        savedAt: Date.now(),
        brief: { goal:brief.goal, angle:brief.angle, emotion:brief.emotion, audienceStage:brief.audienceStage, funnelStage:brief.funnelStage, kpi:brief.kpi, adFormat:brief.adFormat, adLength:brief.adLength, activeOffer:brief.activeOffer, extra:brief.extra },
        scripts: newScripts,
      };
      setHistory(prev => {
        const existing = prev[selectedBrandId] || [];
        return { ...prev, [selectedBrandId]: [entry, ...existing] };
      });

    } catch (err) { setError(`Network error: ${err.message}`); }
    finally { setLoading(false); }
  }

  // ── Generate Ad Copy ─────────────────────────────────────────────────────
  async function generateAdCopy() {
    if (!selectedBrand) return setAdCopyError("Select a brand first.");
    if (!adCopyBrief.awarenessLevel || !adCopyBrief.dominantClaim || !adCopyBrief.headlineType) return setAdCopyError("Please fill in awareness level, dominant claim, and headline type.");
    setAdCopyError(""); setAdCopyLoading(true); setAdCopies(null); setAdCopyFetchStatus(null);

    const [websiteContent, trustpilotContent] = await Promise.all([
      selectedBrand.websiteUrl ? fetchUrlContent(selectedBrand.websiteUrl, "Visit this product/brand website and extract: product descriptions, key benefits, USPs, pricing if shown, and any notable claims.") : null,
      selectedBrand.trustpilotUrl ? fetchUrlContent(selectedBrand.trustpilotUrl, "Visit this Trustpilot page and extract: common themes in reviews, specific phrases customers use, what they love, what problems the product solved.") : null,
    ]);

    setAdCopyFetchStatus({
      website:    selectedBrand.websiteUrl    ? (websiteContent    ? "✓ fetched" : "⚠ unavailable") : "—",
      trustpilot: selectedBrand.trustpilotUrl ? (trustpilotContent ? "✓ fetched" : "⚠ unavailable") : "—",
    });

    const brandContext = [
      `- Product/Offer: ${selectedBrand.product}`,
      `- Target Audience: ${selectedBrand.audience}`,
      `- Tone of Voice: ${selectedBrand.tone}`,
      selectedBrand.mechanism         && `- Mechanism / Point of difference: ${selectedBrand.mechanism}`,
      selectedBrand.keyResult         && `- Key result + timeframe: ${selectedBrand.keyResult}`,
      selectedBrand.priceAndOffer     && `- Price & current offer: ${selectedBrand.priceAndOffer}`,
      selectedBrand.failedAlternatives && `- What customers tried before (the villain): ${selectedBrand.failedAlternatives}`,
      selectedBrand.mainObjection     && `- #1 customer objection: ${selectedBrand.mainObjection}`,
      selectedBrand.heroProof         && `- Hero proof: ${selectedBrand.heroProof}`,
      selectedBrand.guarantee         && `- Guarantee / risk reversal: ${selectedBrand.guarantee}`,
      selectedBrand.founderStory      && `- Founder / brand story: ${selectedBrand.founderStory}`,
      selectedBrand.competitorCliches && `- Competitor clichés to avoid: ${selectedBrand.competitorCliches}`,
      websiteContent    && `- Website content (extracted):\n${websiteContent}`,
      trustpilotContent && `- Trustpilot customer reviews (extracted):\n${trustpilotContent}`,
      selectedBrand.notes && `- Account manager notes:\n${selectedBrand.notes}`,
    ].filter(Boolean).join("\n\n");

    const systemPrompt = `You are the world's most elite direct-response ad copywriter. You write paid written ad copy — headline + body — applying the complete frameworks of Eugene Schwartz ("Breakthrough Advertising") and David Ogilvy ("Ogilvy on Advertising").

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAND INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${brandContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE FRAMEWORKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCHWARTZ — AWARENESS LEVELS (the most important input in all of copy):
Copy must be calibrated precisely to WHERE the reader's mind currently is.
- UNAWARE: They feel the pain or desire but have no name for it. Never mention product or solution. Open with the desire or the pain — make them feel seen before offering anything.
- PROBLEM-AWARE: They know the problem exists. Name it precisely. Position the product as the discovery they were missing.
- SOLUTION-AWARE: They know solutions exist but haven't committed. Your job is to differentiate — mechanism, proof, specificity.
- PRODUCT-AWARE: They know you, but haven't bought. Overcome the objection. Offer proof, risk reversal, and the final nudge.
- MOST AWARE: They're ready. Get out of the way. Headline = offer. Body = urgency + CTA.

The awareness level defines everything: the headline approach, the entry point, and how quickly you can mention the product.

SCHWARTZ — MASS DESIRE & MECHANISM:
Copy cannot create desire — it channels desire that already exists. Your job: find the desire in the market, focus it on this product, intensify it. Every claim needs a mechanism — the specific HOW behind the result. Without mechanism, it's hype. With it, it's proof.

OGILVY — THE HEADLINE:
5x more people read the headline than the body. The headline is the ad. If it fails, the body is never read.
- Specificity = credibility: "Redness gone in 7 days" beats "Transform your skin"
- "New" is one of the most powerful words in the language — use it when there is genuinely something new
- The headline must promise a benefit, present news, provoke a curiosity gap, or issue a command the reader feels compelled to follow
- Never be clever at the expense of clarity. The consumer is not stupid — they are in a hurry.

OGILVY — BODY COPY:
- Write to one specific person, not to a crowd
- Every sentence must earn the right to the next sentence
- Build belief step by step: problem → mechanism → proof → emotional payoff → CTA
- Use real customer language and real numbers whenever available — these are worth more than any creative claim
- The CTA must be specific: name the action, name the reason to act now, remove the friction

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRUCTURAL REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HEADLINE (max 8 words):
- One promise, one idea, maximum clarity
- Calibrated to the awareness level specified in the brief — this is non-negotiable
- Type must match the requested headline type (benefit / news / curiosity / how-to / command / social proof)
- No vague superlatives. Specificity only.

BODY (40–80 words):
- Open by amplifying the desire or pain named in the headline
- Build: visceral problem → mechanism → proof → emotional payoff
- One real customer phrase or stat if available in brand data
- Final line = CTA: specific action + reason to act now + friction removal
- Calibrated to the placement (feed copy can carry more narrative; stories must be punchy)

ABSOLUTE RULES:
- ACCURACY: Never invent stats, prices, or claims not in the brand data
- LANGUAGE: Clean, brand-safe, zero profanity
- Output ONLY valid JSON — no markdown, no preamble. Pure JSON.

ANTI-AI WRITING RULES — these patterns are immediately recognisable as AI-generated copy and must be avoided in every headline and body:
- No em-dashes used as connectors (no "result — mechanism", no "X — or your money back" constructions using "—")
- No "—" character anywhere in the output copy
- No transition clichés: "That's why", "Here's the thing", "The truth is", "And the best part", "It's that simple"
- No three-part list rhythm: ("Fast. Effective. Affordable." / "See it. Want it. Buy it.")
- No rhetorical questions: ("Tired of...?", "What if you could...?", "Sound familiar?")
- No passive-voice hedging: "may help", "can support", "designed to"
- Write like copy from 1960s Ogilvy print ads — direct, confident, specific, with the rhythm of human prose not AI bullet points`;

    const placementNote = adCopyBrief.placement ? `\n- Placement: ${adCopyBrief.placement} — calibrate body length and density accordingly` : "";
    const actionNote    = adCopyBrief.desiredAction ? `\n- Desired reader action: ${adCopyBrief.desiredAction}` : "";

    const userPrompt = `Write 3 distinct written ad copy variations (headline + body) for the following brief. The 3 variations must each interpret the brief differently — different entry point into the desire, different proof element, different emotional arc. They must not feel like the same ad with different words.

BRIEF:
- Audience awareness level: ${adCopyBrief.awarenessLevel}
- The one dominant claim this ad must make: ${adCopyBrief.dominantClaim}
- Headline type: ${adCopyBrief.headlineType}${placementNote}${actionNote}
- Funnel position: ${adCopyBrief.funnelStage || "Not specified"}
- Primary KPI: ${adCopyBrief.kpi || "Not specified"}
${adCopyBrief.activeOffer ? `- Active offer / promotion: ${adCopyBrief.activeOffer}` : ""}
${adCopyBrief.extra ? `- Additional context / angle direction: ${adCopyBrief.extra}` : ""}

VARIATION STRATEGY — each variation must use a different way into the same dominant claim:
V1: Lead with the RESULT or MECHANISM — open on the specific outcome and name how it happens. Body: proof-first → mechanism → CTA.
V2: Lead with the PROBLEM or VILLAIN — open on the pain or the false belief that kept them stuck. Body: empathy → turning point → emotional payoff → CTA.
V3: Lead with SOCIAL PROOF, NEWS, or SPECIFICITY — open on a number, a customer voice, or a news frame ("Introducing / X people have already..."). Body: validate → mechanism → urgency → CTA.

All 3 must:
- Be precisely calibrated to the awareness level stated above
- Match the specified headline type
- Have a headline of max 8 words — specific, no vague superlatives
- Have body copy of 40–80 words
- End with a CTA that names the action, the reason to act now, and removes friction
- Use real brand data (mechanism, proof, offer) — never invent claims

angle_label = 3–5 words describing the creative approach used (e.g. "Mechanism-Led Result", "Villain Opens Door", "Social Proof News Frame")

Return ONLY this exact JSON, nothing else:
{"copies":[{"variation":1,"angle_label":"...","headline":"...","body":"..."},{"variation":2,"angle_label":"...","headline":"...","body":"..."},{"variation":3,"angle_label":"...","headline":"...","body":"..."}]}`;

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:3000, system:systemPrompt, messages:[{role:"user",content:userPrompt}] }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setAdCopyError(`API error: ${data.error?.message || `HTTP ${res.status}`}`); setAdCopyLoading(false); return; }
      const text = data.content?.map(b=>b.text||"").join("") || "";
      if (!text) { setAdCopyError("Empty response from API."); setAdCopyLoading(false); return; }
      let parsed;
      try {
        let clean = text.replace(/```json\s*/gi,"").replace(/```/g,"").trim();
        const start = clean.indexOf("{"); const end = clean.lastIndexOf("}");
        if (start===-1||end===-1) throw new Error("No JSON found");
        parsed = JSON.parse(clean.slice(start,end+1));
      } catch(e) { setAdCopyError(`JSON parse failed: ${text.slice(0,200)}`); setAdCopyLoading(false); return; }

      const newCopies = parsed.copies;
      setAdCopies(newCopies);

      // Auto-save ad copies to history tagged as type "adcopy"
      const entry = {
        id: Date.now().toString(),
        savedAt: Date.now(),
        type: "adcopy",
        brief: { goal: adCopyBrief.dominantClaim, angle: adCopyBrief.headlineType, awarenessLevel:adCopyBrief.awarenessLevel, dominantClaim:adCopyBrief.dominantClaim, headlineType:adCopyBrief.headlineType, placement:adCopyBrief.placement, desiredAction:adCopyBrief.desiredAction, funnelStage:adCopyBrief.funnelStage, kpi:adCopyBrief.kpi, activeOffer:adCopyBrief.activeOffer, extra:adCopyBrief.extra },
        copies: newCopies,
      };
      setHistory(prev => {
        const existing = prev[selectedBrandId] || [];
        return { ...prev, [selectedBrandId]: [entry, ...existing] };
      });

    } catch(err) { setAdCopyError(`Network error: ${err.message}`); }
    finally { setAdCopyLoading(false); }
  }
  async function handleExportDocx() {
    if (!selectedBrand || brandHistory.length === 0) return;
    setExportState("loading");
    try {
      await exportToDocx(selectedBrand.name, brandHistory);
      setExportState("done");
    } catch (e) {
      console.error(e);
      setExportState("error");
    }
  }

  function deleteHistoryEntry(entryId) {
    setHistory(prev => ({ ...prev, [selectedBrandId]: (prev[selectedBrandId]||[]).filter(e=>e.id!==entryId) }));
  }

  // ── Brand CRUD ───────────────────────────────────────────────────────────
  function openNewBrand()  { setEditingBrand("new"); setBrandForm({ name:"", product:"", audience:"", tone:"", websiteUrl:"", trustpilotUrl:"", mechanism:"", keyResult:"", failedAlternatives:"", mainObjection:"", heroProof:"", guarantee:"", competitorCliches:"", founderStory:"", priceAndOffer:"", notes:"" }); }
  function openEditBrand(b){ setEditingBrand(b.id);  setBrandForm({ name:b.name, product:b.product, audience:b.audience, tone:b.tone, websiteUrl:b.websiteUrl||"", trustpilotUrl:b.trustpilotUrl||"", mechanism:b.mechanism||"", keyResult:b.keyResult||"", failedAlternatives:b.failedAlternatives||"", mainObjection:b.mainObjection||"", heroProof:b.heroProof||"", guarantee:b.guarantee||"", competitorCliches:b.competitorCliches||"", founderStory:b.founderStory||"", priceAndOffer:b.priceAndOffer||"", notes:b.notes||"" }); }
  function saveBrand() {
    if (!brandForm.name.trim()) return;
    if (editingBrand === "new") {
      const nb = { ...brandForm, id: Date.now().toString() };
      setBrands(p => { const u=[...p,nb]; setSelectedBrandId(nb.id); return u; });
    } else {
      setBrands(p => p.map(b => b.id===editingBrand ? {...b,...brandForm} : b));
    }
    setEditingBrand(null);
  }
  function deleteBrand(id) {
    setBrands(p => { const u=p.filter(b=>b.id!==id); if(selectedBrandId===id) setSelectedBrandId(u[0]?.id||""); return u; });
  }
  function copyScript(s) { navigator.clipboard.writeText(`HOOK:\n${s.hook}\n\nBODY:\n${s.body}\n\nCTA:\n${s.cta}`); }
  function copyAdCopyItem(a) { navigator.clipboard.writeText(`HEADLINE:\n${a.headline}\n\nBODY:\n${a.body}`); }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#f4f4f4;font-family:'Montserrat',sans-serif;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#dbdbdb;border-radius:3px;}
        input:focus,textarea:focus{border-color:#ff5757!important;box-shadow:0 0 0 3px rgba(255,87,87,.1)!important;}
        input,textarea,select{outline:none;}
        .nb:hover{background:rgba(255,87,87,.08)!important;color:#ff5757!important;}
        .pill:hover:not(.pa){border-color:#ff5757!important;color:#ff5757!important;background:#fff0f0!important;}
        .pa{background:#ff5757!important;border-color:#ff5757!important;color:#fff!important;}
        .bp:hover{background:#e04040!important;} .bs:hover{background:#ebebeb!important;}
        .cb:hover{border-color:#ff5757!important;color:#ff5757!important;}
        .ib:hover{color:#ff5757!important;} .bc:hover{border-color:#ffacac!important;box-shadow:0 4px 20px rgba(255,87,87,.08)!important;}
        .bl:hover{color:#ff5757!important;background:#fff0f0!important;border-color:#ffacac!important;}
        .sc:hover{box-shadow:0 6px 24px rgba(255,87,87,.1)!important;border-color:#ffacac!important;}
        .sl:hover{color:#ff5757!important;}
        .he:hover{background:#f9f9f9!important;}
        @keyframes bounce{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(-8px);opacity:.5}}
        @keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fi .35s ease;}
      `}</style>
      <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Montserrat',sans-serif",background:"#f4f4f4",color:"#222"}}>

        {/* ── Sidebar ── */}
        <aside style={{width:230,flexShrink:0,background:"#222222",display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"26px 20px 22px",borderBottom:"1px solid #414141"}}>
            <span style={{fontSize:28}}>🚀</span>
            <div>
              <div style={{fontWeight:900,fontSize:17,color:"#fff",letterSpacing:"-0.03em",lineHeight:1}}>growbix</div>
              <div style={{fontWeight:700,fontSize:9,color:"#ff5757",textTransform:"uppercase",letterSpacing:"0.12em",marginTop:3}}>Script Agent</div>
            </div>
          </div>
          <div style={{padding:"14px 16px",borderBottom:"1px solid #414141"}}>
            <div style={{fontSize:10,fontWeight:800,color:"#5c5c5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Active client</div>
            <select style={{width:"100%",padding:"8px 10px",background:"#414141",border:"1px solid #5c5c5c",borderRadius:7,color:"#fff",fontSize:12,fontFamily:"inherit",fontWeight:700,cursor:"pointer"}}
              value={selectedBrandId} onChange={e=>{setSelectedBrandId(e.target.value);setExportState("idle");setExportUrl(null);}}>
              {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

          </div>
          <nav style={{padding:"14px 10px",display:"flex",flexDirection:"column",gap:3}}>
            {[{id:"generate",icon:"⚡",label:"UGC Scripts"},{id:"adcopy",icon:"✍️",label:"Ad Copy"},{id:"history",icon:"🕘",label:`History (${brandHistory.length})`},{id:"brands",icon:"🏢",label:`Brands (${brands.length})`}].map(item=>(
              <button key={item.id} className="nb"
                style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",borderRadius:8,border:"none",background:view===item.id?"#ff5757":"transparent",color:view===item.id?"#fff":"#838383",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:700,textAlign:"left",transition:"all 0.15s"}}
                onClick={()=>setView(item.id)}>{item.icon} {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main ── */}
        <main style={{flex:1,overflow:"auto"}}>
          {view==="generate" && <GenerateView brand={selectedBrand} brief={brief} setBrief={setBrief} onGenerate={generateScripts} loading={loading} error={error} scripts={scripts} onCopy={copyScript} onSwitchToBrands={()=>setView("brands")} fetchStatus={fetchStatus} />}
          {view==="adcopy"   && <AdCopyView brand={selectedBrand} brief={adCopyBrief} setBrief={setAdCopyBrief} onGenerate={generateAdCopy} loading={adCopyLoading} error={adCopyError} copies={adCopies} onCopy={copyAdCopyItem} onSwitchToBrands={()=>setView("brands")} fetchStatus={adCopyFetchStatus} />}
          {view==="history"  && <HistoryView brand={selectedBrand} history={brandHistory} onDelete={deleteHistoryEntry} onExport={handleExportDocx} exportState={exportState} exportUrl={exportUrl} onCopy={copyScript} />}
          {view==="brands"   && <BrandsView brands={brands} editingBrand={editingBrand} brandForm={brandForm} setBrandForm={setBrandForm} onNew={openNewBrand} onEdit={openEditBrand} onDelete={deleteBrand} onSave={saveBrand} onCancel={()=>setEditingBrand(null)} />}
        </main>
      </div>
    </>
  );
}

// ── Generate View ────────────────────────────────────────────────────────────
function GenerateView({ brand, brief, setBrief, onGenerate, loading, error, scripts, onCopy, onSwitchToBrands, fetchStatus }) {
  if (!brand) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:16}}>
      <div style={{fontSize:52}}>🚀</div>
      <p style={{color:"#838383",fontWeight:600}}>No brands yet. Add your first client to get started.</p>
      <button className="bp" style={BP} onClick={onSwitchToBrands}>Add your first brand →</button>
    </div>
  );
  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      {/* Form panel */}
      <div style={{width:390,flexShrink:0,background:"#fff",padding:"36px 30px",display:"flex",flexDirection:"column",gap:22,borderRight:"1px solid #ebebeb"}}>
        <div>
          <div style={{display:"inline-flex",padding:"3px 10px",background:"#fff0f0",border:"1px solid #ffacac",color:"#ff5757",borderRadius:20,fontSize:11,fontWeight:800,marginBottom:8}}>{brand.name}</div>
          <h1 style={{fontSize:28,fontWeight:900,color:"#222",letterSpacing:"-0.03em"}}>New Brief</h1>
        </div>
        <div style={{fontSize:10,fontWeight:800,color:"#bcbcbc",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:-8}}>Campaign</div>
        <Field label="Campaign Goal"><Pills items={GOALS}    value={brief.goal}    onChange={v=>setBrief(b=>({...b,goal:v}))} /></Field>
        <Field label="Audience Stage — who is this ad targeting?"><Pills items={STAGES} value={brief.audienceStage} onChange={v=>setBrief(b=>({...b,audienceStage:v}))} /></Field>
        <Field label="Funnel Position"><Pills items={FUNNEL} value={brief.funnelStage} onChange={v=>setBrief(b=>({...b,funnelStage:v}))} /></Field>
        <div style={{height:1,background:"#f0f0f0",margin:"0 0 4px"}} />
        <div style={{fontSize:10,fontWeight:800,color:"#bcbcbc",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:-8}}>Creative</div>
        <Field label="Creative Angle"><Pills items={ANGLES}  value={brief.angle}   onChange={v=>setBrief(b=>({...b,angle:v}))} /></Field>
        <Field label="Target Emotion"><Pills items={EMOTIONS} value={brief.emotion} onChange={v=>setBrief(b=>({...b,emotion:v}))} /></Field>
        <Field label="Ad Format"><Pills items={FORMATS} value={brief.adFormat} onChange={v=>setBrief(b=>({...b,adFormat:v}))} /></Field>
        <Field label="Ad Length"><Pills items={LENGTHS} value={brief.adLength} onChange={v=>setBrief(b=>({...b,adLength:v}))} /></Field>
        <div style={{height:1,background:"#f0f0f0",margin:"0 0 4px"}} />
        <div style={{fontSize:10,fontWeight:800,color:"#bcbcbc",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:-8}}>Commercial Context</div>
        <Field label="Active Offer / Promotion" optional>
          <textarea style={{...TA,minHeight:56}} placeholder="e.g. 20% off this week. Free shipping on first order. Bundle deal active." value={brief.activeOffer} onChange={e=>setBrief(b=>({...b,activeOffer:e.target.value}))} />
        </Field>
        <Field label="Extra Context" optional>
          <textarea style={{...TA,minHeight:56}} placeholder="e.g. Targeting new mums. Launch week — push urgency. Test aggressive hook." value={brief.extra} onChange={e=>setBrief(b=>({...b,extra:e.target.value}))} />
        </Field>
        {error && <div style={{padding:"10px 14px",background:"#fff0f0",border:"1px solid #ffacac",borderRadius:7,color:"#ff5757",fontSize:12,fontWeight:700}}>{error}</div>}
        <button className="bp" style={{...BP,width:"100%",padding:15,fontSize:14}} onClick={onGenerate} disabled={loading}>
          {loading?"Generating…":"🚀 Generate 3 Scripts"}
        </button>
      </div>

      {/* Results panel */}
      <div style={{flex:1,padding:"36px 32px",overflowY:"auto"}}>
        {loading && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:320,gap:20}}>
            <div style={{width:12,height:12,background:"#ff5757",borderRadius:"50%",animation:"bounce 1.2s ease-in-out infinite"}} />
            {!fetchStatus ? (
              <div style={{textAlign:"center"}}>
                <p style={{color:"#838383",fontSize:13,fontWeight:700}}>Fetching brand data…</p>
                <p style={{color:"#bcbcbc",fontSize:12,fontWeight:500,marginTop:4}}>Reading website & Trustpilot</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                <p style={{color:"#838383",fontSize:13,fontWeight:700}}>Writing your scripts…</p>
                <div style={{display:"flex",gap:8}}>
                  {fetchStatus.website!=="—"    && <FetchBadge label="🌐 Website"    status={fetchStatus.website} />}
                  {fetchStatus.trustpilot!=="—" && <FetchBadge label="⭐ Trustpilot" status={fetchStatus.trustpilot} />}
                </div>
              </div>
            )}
          </div>
        )}
        {!loading && scripts && (
          <div className="fi">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
              <div style={{fontSize:11,fontWeight:800,color:"#bcbcbc",textTransform:"uppercase",letterSpacing:"0.1em"}}>3 variations — {brand.name}</div>
              {fetchStatus?.website!=="—"    && <FetchBadge label="🌐" status={fetchStatus.website} />}
              {fetchStatus?.trustpilot!=="—" && <FetchBadge label="⭐" status={fetchStatus.trustpilot} />}
            </div>
            {scripts.map((sc,i)=><ScriptCard key={i} script={sc} onCopy={()=>onCopy(sc)} />)}
          </div>
        )}
        {!loading && !scripts && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:400,gap:16}}>
            <div style={{fontSize:44,opacity:.2}}>🚀</div>
            <p style={{color:"#bcbcbc",fontSize:14,textAlign:"center",lineHeight:1.7,fontWeight:500}}>Fill in the brief and hit Generate.<br/>Scripts auto-save to History.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── History View ─────────────────────────────────────────────────────────────
function HistoryView({ brand, history, onDelete, onExport, exportState, exportUrl, onCopy }) {
  const [expanded, setExpanded] = useState({});
  function toggle(id) { setExpanded(p=>({...p,[id]:!p[id]})); }

  if (!brand) return <div style={{padding:40,color:"#838383",fontWeight:600}}>Select a brand to view history.</div>;

  return (
    <div style={{padding:"36px 40px",maxWidth:900}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <h1 style={{fontSize:28,fontWeight:900,color:"#222",letterSpacing:"-0.03em",marginBottom:4}}>Script History</h1>
          <p style={{fontSize:13,color:"#838383",fontWeight:500}}>{brand.name} · {history.length} generation{history.length!==1?"s":""} saved</p>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {exportState==="done" && (
            <span style={{fontSize:12,fontWeight:700,color:"#16a34a",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"10px 14px"}}>✓ Download started!</span>
          )}
          {exportState==="error" && <span style={{fontSize:12,color:"#ff5757",fontWeight:700}}>Export failed — please try again</span>}
          <button className="bp" style={{...BP,display:"flex",alignItems:"center",gap:8,opacity:history.length===0?.5:1}}
            onClick={onExport} disabled={history.length===0||exportState==="loading"}>
            {exportState==="loading" ? "⏳ Building doc…" : "⬇️ Export to .docx"}
          </button>
        </div>
      </div>

      {history.length === 0 && (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,gap:16}}>
          <div style={{fontSize:44,opacity:.2}}>🕘</div>
          <p style={{color:"#bcbcbc",fontSize:14,fontWeight:500,textAlign:"center"}}>No scripts saved yet.<br/>Generate your first brief to get started.</p>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {history.map(entry=>{
          const isAdCopy = entry.type === "adcopy";
          const items    = isAdCopy ? (entry.copies||[]) : (entry.scripts||[]);
          const date = new Date(entry.savedAt).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
          const time = new Date(entry.savedAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
          const isOpen = expanded[entry.id];
          return (
            <div key={entry.id} style={{background:"#fff",border:"1.5px solid #ebebeb",borderRadius:12,overflow:"hidden",transition:"border-color 0.2s"}}>
              {/* Entry header */}
              <div className="he" onClick={()=>toggle(entry.id)}
                style={{display:"flex",alignItems:"center",gap:14,padding:"16px 22px",cursor:"pointer",transition:"background 0.15s"}}>
                <div style={{width:36,height:36,background:isAdCopy?"#f0f4ff":"#fff0f0",border:`1.5px solid ${isAdCopy?"#aac4ff":"#ffacac"}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{isAdCopy?"✍️":"📅"}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#222",marginBottom:3}}>
                    <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",background:isAdCopy?"#e8eeff":"#fff0f0",border:`1px solid ${isAdCopy?"#aac4ff":"#ffacac"}`,borderRadius:20,color:isAdCopy?"#3b67e8":"#ff5757",marginRight:8}}>{isAdCopy?"AD COPY":"UGC SCRIPT"}</span>
                    {date} <span style={{fontWeight:500,color:"#838383"}}>at {time}</span>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                    {isAdCopy
                      ? [entry.brief.awarenessLevel?.split("—")[0]?.trim(), entry.brief.headlineType?.split("—")[0]?.trim(), entry.brief.placement].filter(Boolean).map(tag=>(
                          <span key={tag} style={{fontSize:10,fontWeight:700,padding:"2px 8px",background:"#f4f4f4",borderRadius:20,color:"#5c5c5c"}}>{tag}</span>
                        ))
                      : [entry.brief.goal, entry.brief.audienceStage, entry.brief.angle, entry.brief.emotion].filter(Boolean).map(tag=>(
                          <span key={tag} style={{fontSize:10,fontWeight:700,padding:"2px 8px",background:"#f4f4f4",borderRadius:20,color:"#5c5c5c"}}>{tag}</span>
                        ))
                    }
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:700,color:"#bcbcbc"}}>{items.length} variations</span>
                  <button className="ib" onClick={e=>{e.stopPropagation();onDelete(entry.id);}}
                    style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#fd7b7b",fontFamily:"inherit",fontWeight:700,padding:"4px 8px",transition:"color 0.15s"}}>Delete</button>
                  <span style={{fontSize:12,color:"#bcbcbc",fontWeight:700}}>{isOpen?"▲":"▼"}</span>
                </div>
              </div>
              {/* Expanded content */}
              {isOpen && (
                <div className="fi" style={{borderTop:"1px solid #f4f4f4",padding:"16px 22px",display:"flex",flexDirection:"column",gap:12}}>
                  {isAdCopy
                    ? items.map((c,i)=><AdCopyCard key={i} copy={c} onCopy={()=>navigator.clipboard.writeText(`HEADLINE:\n${c.headline}\n\nBODY:\n${c.body}`)} compact />)
                    : items.map((s,i)=><ScriptCard key={i} script={s} onCopy={()=>onCopy(s)} compact />)
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Script Card ───────────────────────────────────────────────────────────────
function ScriptCard({ script, onCopy, compact }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() { onCopy(); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  return (
    <div className="sc" style={{background:compact?"#fafafa":"#fff",border:`1.5px solid ${compact?"#f0f0f0":"#ebebeb"}`,borderRadius:12,padding:"20px 22px",transition:"all 0.2s"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <div style={{width:28,height:28,background:"#ff5757",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:"#fff",flexShrink:0}}>V{script.variation}</div>
        <span style={{flex:1,fontSize:13,fontWeight:700,color:"#222"}}>{script.angle_label}</span>
        <button className="cb" style={{padding:"5px 12px",background:"#fff",border:"1.5px solid #dbdbdb",borderRadius:6,color:"#838383",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700,transition:"all 0.15s"}} onClick={handleCopy}>
          {copied?"✓ Copied":"Copy all"}
        </button>
      </div>
      {[{tag:"HOOK",text:script.hook,st:{fontWeight:700,fontSize:14,color:"#222",lineHeight:1.55}},
        {tag:"BODY",text:script.body,st:{fontSize:13,color:"#5c5c5c",lineHeight:1.75}},
        {tag:"CTA", text:script.cta, st:{fontSize:13,fontWeight:700,color:"#ff5757",lineHeight:1.5}}
      ].map(sec=>(
        <div key={sec.tag} style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:"0.12em",color:"#ff5757",marginBottom:4}}>{sec.tag}</div>
          <div style={sec.st}>{sec.text}</div>
        </div>
      ))}
    </div>
  );
}

// ── Ad Copy View ──────────────────────────────────────────────────────────────
function AdCopyView({ brand, brief, setBrief, onGenerate, loading, error, copies, onCopy, onSwitchToBrands, fetchStatus }) {
  if (!brand) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:16}}>
      <div style={{fontSize:52}}>✍️</div>
      <p style={{color:"#838383",fontWeight:600}}>No brands yet. Add your first client to get started.</p>
      <button className="bp" style={BP} onClick={onSwitchToBrands}>Add your first brand →</button>
    </div>
  );
  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      {/* Form panel */}
      <div style={{width:410,flexShrink:0,background:"#fff",padding:"36px 30px",display:"flex",flexDirection:"column",gap:22,borderRight:"1px solid #ebebeb",overflowY:"auto"}}>
        <div>
          <div style={{display:"inline-flex",padding:"3px 10px",background:"#fff0f0",border:"1px solid #ffacac",color:"#ff5757",borderRadius:20,fontSize:11,fontWeight:800,marginBottom:8}}>{brand.name}</div>
          <h1 style={{fontSize:28,fontWeight:900,color:"#222",letterSpacing:"-0.03em"}}>Ad Copy</h1>
          <p style={{fontSize:12,color:"#838383",fontWeight:500,marginTop:6}}>Headline + body. Calibrated to awareness level & placement.</p>
        </div>

        {/* ── Section: The Strategic Core ── */}
        <div style={{fontSize:10,fontWeight:800,color:"#bcbcbc",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:-10}}>Strategic Core — required</div>

        <Field label="Audience Awareness Level" optional={false}>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {AWARENESS.map(a=>(
              <button key={a} className={`pill${brief.awarenessLevel===a?" pa":""}`}
                style={{padding:"8px 12px",borderRadius:7,border:"1.5px solid #dbdbdb",background:"#fff",color:"#5c5c5c",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600,transition:"all 0.15s",textAlign:"left",lineHeight:1.4}}
                onClick={()=>setBrief(b=>({...b,awarenessLevel:b.awarenessLevel===a?"":a}))}>
                {a}
              </button>
            ))}
          </div>
        </Field>

        <Field label="The One Dominant Claim">
          <textarea style={{...TA,minHeight:64}} placeholder="The single irreducible promise this ad must deliver. e.g. 'Ceramide complex repairs the skin barrier in 7 days — proven, not claimed.' Force yourself to write ONE claim only." value={brief.dominantClaim} onChange={e=>setBrief(b=>({...b,dominantClaim:e.target.value}))} />
          <div style={{fontSize:10,color:"#bcbcbc",fontWeight:600,marginTop:4}}>Ogilvy: every great ad is built on one Big Idea. State it here before generating.</div>
        </Field>

        <Field label="Headline Type">
          <Pills items={HEADLINE_T} value={brief.headlineType} onChange={v=>setBrief(b=>({...b,headlineType:v}))} />
        </Field>

        <div style={{height:1,background:"#f0f0f0",margin:"0 0 4px"}} />
        <div style={{fontSize:10,fontWeight:800,color:"#bcbcbc",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:-10}}>Context</div>

        <Field label="Active Offer / Promotion" optional>
          <textarea style={{...TA,minHeight:52}} placeholder="e.g. 20% off this week. Free shipping. Bundle 3 for €99." value={brief.activeOffer} onChange={e=>setBrief(b=>({...b,activeOffer:e.target.value}))} />
        </Field>
        <Field label="Direction / Extra Context" optional>
          <textarea style={{...TA,minHeight:52}} placeholder="e.g. Push the urgency. Avoid before/after weight framing. Lead with the clinical study result." value={brief.extra} onChange={e=>setBrief(b=>({...b,extra:e.target.value}))} />
        </Field>

        {error && <div style={{padding:"10px 14px",background:"#fff0f0",border:"1px solid #ffacac",borderRadius:7,color:"#ff5757",fontSize:12,fontWeight:700}}>{error}</div>}
        <button className="bp" style={{...BP,width:"100%",padding:15,fontSize:14}} onClick={onGenerate} disabled={loading}>
          {loading?"Generating…":"✍️ Generate 3 Ad Copies"}
        </button>
      </div>

      {/* Results panel */}
      <div style={{flex:1,padding:"36px 32px",overflowY:"auto"}}>
        {loading && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:320,gap:20}}>
            <div style={{width:12,height:12,background:"#ff5757",borderRadius:"50%",animation:"bounce 1.2s ease-in-out infinite"}} />
            {!fetchStatus ? (
              <div style={{textAlign:"center"}}>
                <p style={{color:"#838383",fontSize:13,fontWeight:700}}>Fetching brand data…</p>
                <p style={{color:"#bcbcbc",fontSize:12,fontWeight:500,marginTop:4}}>Reading website & Trustpilot</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                <p style={{color:"#838383",fontSize:13,fontWeight:700}}>Writing your ad copy…</p>
                <div style={{display:"flex",gap:8}}>
                  {fetchStatus.website!=="—"    && <FetchBadge label="🌐 Website"    status={fetchStatus.website} />}
                  {fetchStatus.trustpilot!=="—" && <FetchBadge label="⭐ Trustpilot" status={fetchStatus.trustpilot} />}
                </div>
              </div>
            )}
          </div>
        )}
        {!loading && copies && (
          <div className="fi">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
              <div style={{fontSize:11,fontWeight:800,color:"#bcbcbc",textTransform:"uppercase",letterSpacing:"0.1em"}}>3 variations — {brand.name}</div>
              {fetchStatus?.website!=="—"    && <FetchBadge label="🌐" status={fetchStatus.website} />}
              {fetchStatus?.trustpilot!=="—" && <FetchBadge label="⭐" status={fetchStatus.trustpilot} />}
            </div>
            {copies.map((c,i)=><AdCopyCard key={i} copy={c} onCopy={()=>onCopy(c)} />)}
          </div>
        )}
        {!loading && !copies && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:400,gap:16}}>
            <div style={{fontSize:44,opacity:.2}}>✍️</div>
            <p style={{color:"#bcbcbc",fontSize:14,textAlign:"center",lineHeight:1.7,fontWeight:500}}>Fill in the brief and hit Generate.<br/>3 headline + body variations, auto-saved to History.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ad Copy Card ──────────────────────────────────────────────────────────────
function AdCopyCard({ copy, onCopy, compact }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() { onCopy(); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  return (
    <div className="sc" style={{background:compact?"#fafafa":"#fff",border:`1.5px solid ${compact?"#f0f0f0":"#ebebeb"}`,borderRadius:12,padding:"20px 22px",marginBottom:compact?0:12,transition:"all 0.2s"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <div style={{width:28,height:28,background:"#ff5757",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:"#fff",flexShrink:0}}>V{copy.variation}</div>
        <span style={{flex:1,fontSize:13,fontWeight:700,color:"#222"}}>{copy.angle_label}</span>
        <button className="cb" style={{padding:"5px 12px",background:"#fff",border:"1.5px solid #dbdbdb",borderRadius:6,color:"#838383",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700,transition:"all 0.15s"}} onClick={handleCopy}>
          {copied?"✓ Copied":"Copy all"}
        </button>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:"0.12em",color:"#ff5757",marginBottom:6}}>HEADLINE</div>
        <div style={{fontSize:18,fontWeight:900,color:"#222",lineHeight:1.3,letterSpacing:"-0.02em"}}>{copy.headline}</div>
      </div>
      <div>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:"0.12em",color:"#ff5757",marginBottom:6}}>BODY</div>
        <div style={{fontSize:13,color:"#5c5c5c",lineHeight:1.75}}>{copy.body}</div>
      </div>
    </div>
  );
}

// ── Brands View ───────────────────────────────────────────────────────────────
function BrandsView({ brands, editingBrand, brandForm, setBrandForm, onNew, onEdit, onDelete, onSave, onCancel }) {
  const set = k => e => setBrandForm(f=>({...f,[k]:e.target.value}));
  return (
    <div style={{padding:"36px 40px",maxWidth:960}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <h1 style={{fontSize:28,fontWeight:900,color:"#222",letterSpacing:"-0.03em",marginBottom:4}}>Brand Profiles</h1>
          <p style={{fontSize:13,color:"#838383",fontWeight:500}}>Manage client info and reference links for the AI</p>
        </div>
        <button className="bp" style={BP} onClick={onNew}>+ New Brand</button>
      </div>

      {editingBrand && (
        <div className="fi" style={{background:"#fff",border:"1.5px solid #ffacac",borderRadius:12,padding:28,marginBottom:28}}>
          <div style={{fontSize:16,fontWeight:800,color:"#222",marginBottom:20}}>{editingBrand==="new"?"New Brand":`Editing: ${brandForm.name}`}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:4}}>
            <LabelInput label="Brand Name" placeholder="e.g. Glow Labs" value={brandForm.name} onChange={set("name")} />
          </div>
          <SD title="Brand Information" />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <LabelTA label="Product / Offer"   placeholder="What are you selling? Core USP?"              value={brandForm.product}  onChange={set("product")} />
            <LabelTA label="Target Audience"   placeholder="Who's the ideal customer? Age, pain points."  value={brandForm.audience} onChange={set("audience")} />
            <LabelTA label="Tone of Voice"     placeholder="e.g. Casual, never salesy, empowering."       value={brandForm.tone}     onChange={set("tone")} />
          </div>
          <SD title="🔬 Product Intelligence" subtitle="— the AI uses this to build mechanisms, villains & proof" />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <LabelTA label="Mechanism / Point of Difference" placeholder="What makes this product uniquely work? e.g. Ceramide complex rebuilds the skin barrier from within — unlike surface moisturisers." value={brandForm.mechanism} onChange={set("mechanism")} />
            <LabelTA label="Key Result + Timeframe" placeholder="What's the #1 result customers get, and how fast? e.g. Visible reduction in redness within 7 days." value={brandForm.keyResult} onChange={set("keyResult")} />
            <LabelTA label="What Customers Tried Before (The Villain)" placeholder="What failed alternatives did they use? e.g. Expensive clinic treatments, drugstore creams, cutting out foods — nothing worked long-term." value={brandForm.failedAlternatives} onChange={set("failedAlternatives")} />
            <LabelTA label="#1 Customer Objection" placeholder="What's the biggest reason someone hesitates to buy? e.g. Worried it won't work for sensitive skin." value={brandForm.mainObjection} onChange={set("mainObjection")} />
          </div>
          <SD title="💎 Proof & Credibility" subtitle="— real numbers and quotes the AI can use verbatim" />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <LabelTA label="Hero Proof" placeholder="Best testimonial, stats, or social proof. e.g. 4,200+ five-star reviews. 'Finally something that actually worked' — Sara, 34." value={brandForm.heroProof} onChange={set("heroProof")} />
            <LabelTA label="Guarantee / Risk Reversal" placeholder="e.g. 60-day money-back guarantee — no questions asked." value={brandForm.guarantee} onChange={set("guarantee")} />
            <LabelTA label="Price & Current Offer" placeholder="e.g. €49. Currently 20% off first order. Bundle: 3 for €99." value={brandForm.priceAndOffer} onChange={set("priceAndOffer")} />
          </div>
          <SD title="🎯 Strategic Intelligence" subtitle="— helps the AI avoid clichés and use authentic angles" />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <LabelTA label="Competitor Clichés to Avoid" placeholder="e.g. 'Game-changer', 'Revolutionary', before/after weight loss style, fake doctor endorsements." value={brandForm.competitorCliches} onChange={set("competitorCliches")} />
            <LabelTA label="Founder / Brand Origin Story" placeholder="e.g. Founded by a nurse who struggled with her own skin. Made in Denmark. Family business since 2018." value={brandForm.founderStory} onChange={set("founderStory")} />
          </div>
          <SD title="🔗 Reference Links" subtitle="— fetched automatically during generation" />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <LabelInput label="🌐 Website / Product URL" placeholder="https://yourbrand.com"                         value={brandForm.websiteUrl}    onChange={set("websiteUrl")} />
            <LabelInput label="⭐ Trustpilot URL"         placeholder="https://trustpilot.com/review/yourbrand.com"  value={brandForm.trustpilotUrl} onChange={set("trustpilotUrl")} />
          </div>
          <SD title="📝 Account Manager Notes" subtitle="— winning hooks, platform observations, what to avoid" />
          <LabelTA label="Notes" placeholder="e.g. Best performing ad uses before/after hook. Customers love fast delivery. Avoid aggressive discount angles — brand is premium." value={brandForm.notes} onChange={set("notes")} />
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:"1px solid #ebebeb"}}>
            <button className="bs" style={BS} onClick={onCancel}>Cancel</button>
            <button className="bp" style={BP} onClick={onSave}>Save Brand</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {brands.map(brand=>(
          <div key={brand.id} className="bc" style={{background:"#fff",border:"1.5px solid #ebebeb",borderRadius:12,overflow:"hidden",transition:"all 0.2s"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,padding:"18px 22px"}}>
              <div style={{width:40,height:40,background:"#ff5757",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,color:"#fff",flexShrink:0}}>{brand.name[0].toUpperCase()}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:800,color:"#222",marginBottom:2}}>{brand.name}</div>
                <div style={{fontSize:12,color:"#838383",fontWeight:500}}>{brand.audience||"No audience set"}</div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button className="ib" style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#838383",fontFamily:"inherit",fontWeight:700,padding:"4px 8px",transition:"color 0.15s"}} onClick={()=>onEdit(brand)}>Edit</button>
                <button className="ib" style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#fd7b7b",fontFamily:"inherit",fontWeight:700,padding:"4px 8px",transition:"color 0.15s"}} onClick={()=>onDelete(brand.id)}>Delete</button>
              </div>
            </div>
            <div style={{borderTop:"1px solid #f4f4f4",padding:"14px 22px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:(brand.websiteUrl||brand.trustpilotUrl)?12:0}}>
                {[{l:"Product",v:brand.product},{l:"Tone",v:brand.tone}].map(({l,v})=>(
                  <div key={l} style={{fontSize:13,color:"#5c5c5c",lineHeight:1.5}}>
                    <span style={{fontWeight:700,color:"#414141",marginRight:6}}>{l}:</span>
                    {v||<span style={{color:"#bcbcbc"}}>Not set</span>}
                  </div>
                ))}
              </div>
              {(brand.websiteUrl||brand.trustpilotUrl) && (
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {[{url:brand.websiteUrl,label:"🌐 Website"},{url:brand.trustpilotUrl,label:"⭐ Trustpilot"}].filter(l=>l.url).map(l=>(
                    <a key={l.label} className="bl" href={l.url} target="_blank" rel="noreferrer"
                      style={{display:"inline-flex",padding:"4px 12px",background:"#f4f4f4",border:"1px solid #ebebeb",borderRadius:20,fontSize:11,fontWeight:700,color:"#5c5c5c",textDecoration:"none",transition:"all 0.15s"}}>
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Small shared components ──────────────────────────────────────────────────
function Field({ label, optional, children }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      <label style={{fontSize:11,fontWeight:800,color:"#414141",textTransform:"uppercase",letterSpacing:"0.08em"}}>
        {label}{optional&&<span style={{fontWeight:500,color:"#bcbcbc",textTransform:"none",letterSpacing:0}}> · optional</span>}
      </label>
      {children}
    </div>
  );
}
function Pills({ items, value, onChange }) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
      {items.map(item=>(
        <button key={item} className={`pill${value===item?" pa":""}`}
          style={{padding:"7px 12px",borderRadius:7,border:"1.5px solid #dbdbdb",background:"#fff",color:"#5c5c5c",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,transition:"all 0.15s"}}
          onClick={()=>onChange(value===item?"":item)}>{item}</button>
      ))}
    </div>
  );
}
function FetchBadge({ label, status }) {
  const ok = status.startsWith("✓");
  return (
    <div style={{fontSize:11,fontWeight:700,color:ok?"#16a34a":"#d97706",background:ok?"#f0fdf4":"#fffbeb",border:`1px solid ${ok?"#bbf7d0":"#fde68a"}`,borderRadius:20,padding:"3px 10px"}}>
      {label} {status}
    </div>
  );
}
function SD({ title, subtitle }) {
  return (
    <div style={{fontSize:11,fontWeight:800,color:"#414141",textTransform:"uppercase",letterSpacing:"0.08em",padding:"16px 0 12px",borderTop:"1px solid #ebebeb",marginTop:12}}>
      {title}{subtitle&&<span style={{fontWeight:500,color:"#838383",textTransform:"none",letterSpacing:0}}> {subtitle}</span>}
    </div>
  );
}
function LabelInput({ label, placeholder, value, onChange }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      <label style={{fontSize:11,fontWeight:800,color:"#414141",textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</label>
      <input style={IN} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
}
function LabelTA({ label, placeholder, value, onChange }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      <label style={{fontSize:11,fontWeight:800,color:"#414141",textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</label>
      <textarea style={{...TA,minHeight:70}} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
}

// ── Shared style tokens ───────────────────────────────────────────────────────
const BP = {padding:"10px 20px",background:"#ff5757",border:"none",borderRadius:8,color:"#fff",fontWeight:800,fontSize:13,fontFamily:"inherit",cursor:"pointer",transition:"background 0.15s"};
const BS = {padding:"10px 20px",background:"#fff",border:"1.5px solid #dbdbdb",borderRadius:8,color:"#5c5c5c",fontWeight:700,fontSize:13,fontFamily:"inherit",cursor:"pointer",transition:"background 0.15s"};
const TA = {width:"100%",padding:"10px 12px",background:"#f4f4f4",border:"1.5px solid #ebebeb",borderRadius:8,color:"#222",fontSize:13,fontFamily:"inherit",resize:"vertical",lineHeight:1.5,transition:"border-color 0.15s,box-shadow 0.15s"};
const IN = {width:"100%",padding:"10px 12px",background:"#f4f4f4",border:"1.5px solid #ebebeb",borderRadius:8,color:"#222",fontSize:13,fontFamily:"inherit",transition:"border-color 0.15s,box-shadow 0.15s"};
