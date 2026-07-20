// Anthropic API Proxy — Cloudflare Worker (hardened)
// Serves the CME Content Helper on GitHub Pages without exposing the API key.
//
// SECURITY MODEL (per UM ITS review, July 2026):
// - The client sends ONLY structured form fields. The model, token limit,
//   system prompt, and prompt assembly all live here, server-side, and
//   cannot be overridden by any client.
// - All fields are type-checked, whitelist-checked, and length-capped.
// - Per-IP and global rate limits apply (see RATE LIMITING below).
// - The Origin/CORS check remains for browser hygiene but is NOT treated
//   as a security boundary (headers are forgeable by non-browser clients).
//
// SETUP:
// 1. Deploy this Worker in your Cloudflare dashboard (replaces prior version).
// 2. Secret: Settings → Variables and Secrets → ANTHROPIC_API_KEY (encrypted).
// 3. RATE LIMITING (strongly recommended): Settings → Bindings → Add →
//    "Rate limiting" — create TWO bindings on this worker:
//      Name: PER_IP_LIMITER  → e.g. limit 10 requests per 60 seconds
//      Name: GLOBAL_LIMITER  → e.g. limit 60 requests per 60 seconds
//    If the bindings are absent the worker still runs, falling back to a
//    best-effort in-memory limiter (resets whenever the isolate recycles).
// 4. Backstop: set a monthly spend limit + usage alerts in the Anthropic
//    console — that cap holds no matter what happens here.

const ALLOWED_ORIGIN = "https://doctorhealy.github.io";

// ── Pinned model configuration — clients cannot override ──
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 5000;

// ── Field whitelists — must match the form in cme-content-helper.html ──
const ALLOWED_PROFS = [
  "Physicians", "Residents / Fellows", "Nurses / Nurse Practitioners",
  "Physician Assistants", "Pharmacists", "Social Workers",
  "Medical Students", "Other Healthcare Professionals",
];
const ALLOWED_SPECS = [
  "internal_med", "anesthesiology", "pediatrics", "emergency_med",
  "surgery", "psychiatry_neuro", "ob_gyn", "radiology",
  "family_med", "ent", "pathology", "other_spec",
];
const ALLOWED_FORMATS = [
  "Lecture / didactic presentation", "Panel discussion",
  "Case-based small group discussion", "Simulation / skills lab",
  "Hands-on workshop", "Online / self-paced module",
  "Quality improvement activity", "Journal club",
];
const ALLOWED_IPCE = ["yes", "no", "not_specified"];
const ALLOWED_GAP_SOURCES = [
  "Quality / registry data showing a practice gap",
  "Prior activity evaluation identifying unmet needs",
  "Updated literature or new clinical guidelines",
  "Expert or faculty presenter input on learner needs",
  "Informal clinical observation",
  "Not formally assessed",
  "",
];
const MAX_TOPIC_CHARS = 300;
const MAX_CONTENT_CHARS = 6000;
const MAX_OTHER_CHARS = 400;

const SPEC_LABELS = {
  internal_med:    "Internal Medicine or subspecialties",
  anesthesiology:  "Anesthesiology, Pain Medicine, or Critical Care",
  pediatrics:      "Pediatrics",
  emergency_med:   "Emergency Medicine",
  surgery:         "Surgery — General, Orthopaedic, Thoracic, or Vascular",
  psychiatry_neuro:"Psychiatry or Neurology",
  ob_gyn:          "Obstetrics & Gynecology",
  radiology:       "Radiology or Radiation Oncology",
  family_med:      "Family Medicine",
  ent:             "Otolaryngology / Head & Neck Surgery (ENT)",
  pathology:       "Pathology",
  other_spec:      "Other physician specialty",
};

// ── System prompt (moved server-side from the client) ──
const SYSTEM_PROMPT = [
  "You are an expert CME educational designer with deep knowledge of ACCME accreditation standards, Michigan Medicine policies, and US physician board certification requirements.",
  "Generate professional, specific, CONCISE application language for MiCME/CloudCME applications at Michigan Medicine.",
  "Writing style: precise and direct. Every sentence must earn its place. Never pad, never restate, never add caveats. A planner should be able to paste your output with minimal editing — which means it must be tight enough that they actually read it first.",
  "",
  "Return ONLY a JSON object with this exact structure (no preamble, no markdown fences):",
  "{",
  '  "practiceGap": ["option A text", "option B text", "option C text"],',
  '  "educationalNeeds": {',
  '    "primaryType": "Knowledge or Competence or Performance",',
  '    "reasoning": "One plain-language sentence (max 20 words) explaining why this is the primary need type",',
  '    "primaryText": "2-3 sentences describing the specific deficit — name the audience, what they lack, and why it matters clinically. Max 80 words.",',
  '    "secondaryType": "Knowledge or Competence or Performance or null",',
  '    "secondaryText": "2-3 sentences if genuinely needed, otherwise null. Max 70 words."',
  "  },",
  '  "expectedResults": "2-3 sentences: what participants will be able to do differently (competence), what they will do in practice (performance if plausible), and patient/care quality benefit if genuinely achievable. Max 80 words. Do not restate the gap.",',
  '  "formatJustification": "2-3 sentences: name the specific format(s) and explain concretely why each is appropriate for the identified gap and learner need. Max 70 words.",',
  '  "learningObjectives": ["objective 1", "objective 2", "objective 3"],',
  '  "competencies": {',
  '    "acgme": ["only ACGME/ABMS competencies genuinely addressed from: Patient Care, Medical Knowledge, Practice-Based Learning and Improvement, Interpersonal and Communication Skills, Professionalism, Systems-Based Practice"],',
  '    "iom": ["only IOM competencies genuinely addressed from: Provide Patient-Centered Care, Work in Interdisciplinary Teams, Employ Evidence-Based Practice, Apply Quality Improvement, Utilize Informatics"],',
  '    "ipec": ["only IPEC competencies genuinely addressed from: Values and Ethics, Roles and Responsibilities, Interprofessional Communication, Teams and Teamwork"]',
  "  },",
  '  "needsAssessmentSummary": "3-4 sentences synthesising the gap, the educational need type and root cause, how the gap was identified, and what change the activity is designed to produce. Max 110 words.",',
  '  "eligibility": {',
  '    "moc": [',
  '      {',
  '        "board": "Full board name e.g. ABIM MOC Part II",',
  '        "applies": true,',
  '        "rationale": "One sentence why this board credit applies to this activity and audience",',
  '        "requirements": ["specific requirement 1", "specific requirement 2"],',
  '        "flag": "What the planner needs to tell OCME&LL"',
  '      }',
  "    ],",
  '    "michiganTopics": [',
  '      {',
  '        "topic": "Plain English topic name",',
  '        "code": "ethics or pain_management or implicit_bias or opioid_prescribing or human_trafficking",',
  '        "applies": true,',
  '        "rationale": "One sentence why this topic applies",',
  '        "requirement": "The Michigan licensing requirement this satisfies",',
  '        "flag": "What the planner needs to tell OCME&LL"',
  '      }',
  "    ],",
  '    "commendation": [',
  '      {',
  '        "code": "C23 through C38",',
  '        "title": "Short plain-English title",',
  '        "confidence": "high or possible",',
  '        "rationale": "One sentence tied specifically to this activity content explaining why it qualifies",',
  '        "steps": ["concrete step 1", "concrete step 2", "concrete step 3"]',
  '      }',
  "    ],",
  '    "ipce": {',
  '      "applies": true or false,',
  '      "rationale": "Why IPCE does or does not apply",',
  '      "steps": ["step 1", "step 2"]',
  '    },',
  '    "otherCredits": [',
  '      {',
  '        "name": "Credit type name e.g. ANCC Contact Hours, ACPE Credit, AAPA Category 1",',
  '        "applies": true,',
  '        "rationale": "Why this applies",',
  '        "flag": "What the planner needs to tell OCME&LL"',
  '      }',
  "    ]",
  "  }",
  "}",
  "",
  "EDUCATIONAL NEEDS: Diagnose the PRIMARY root cause of the gap — pick exactly one of:",
  "- Knowledge: learners are unaware of or unfamiliar with current evidence, guidelines, or a new framework. The gap exists because they don't know.",
  "- Competence: learners know the evidence but cannot yet apply it correctly in clinical scenarios. The gap exists because they can't do it yet.",
  "- Performance: learners know and can apply the evidence, but are not doing so consistently in real practice. The gap exists because they're not doing it.",
  "",
  "SECONDARY NEED — default is null. Only set secondaryType if BOTH conditions are true:",
  "  1. The activity has structurally distinct components that separately target two different need types (e.g. a didactic session updating new guidelines AND a simulation lab building application skill).",
  "  2. The secondary need explains a genuinely separate root cause — not just a related aspect of the same one.",
  "Hard rules for secondary:",
  "  - Never add Knowledge as secondary when primary is Performance. If they are not doing it, more knowledge rarely fixes that — the root cause is behavioral not informational.",
  "  - Never add secondary just to seem more complete. If you have to search for a justification, secondaryType is null.",
  "  - A single well-chosen need type with a strong specific description is always better than two weakly justified ones.",
  "  - When in doubt: null.",
  "Never generate all three.",
  "",
  "EXPECTED RESULTS: Always address competence. Add performance only if activity will drive practice change. Add patient outcomes only if genuinely plausible.",
  "",
  "LEARNING OBJECTIVES: 3-4 objectives. Each begins with an action verb — no preamble, no 'participants will be able to' prefix (that is added by the UI). Verb level must match primaryType. Never use understand or appreciate. Be specific and observable. Max 25 words each.",
  "",
  "COMPETENCIES: Select only genuinely addressed ones. 2-4 per framework maximum. Listing all is always wrong.",
  "",
  
  "",
  "PRACTICE GAP: 3 meaningfully different versions varying framing, evidence angle, or emphasis. Each 2-3 sentences, max 75 words. Name the audience and describe current vs ideal practice with clinical specificity. Not generic — every option should be unmistakably about this topic and this audience.",
  "",
  "ELIGIBILITY — this is the most important analytical section. Read the entire activity description carefully:",
  "",
  "MOC: Michigan Medicine OCME&LL reports MOC credit through ACCME PARS for 8 boards. Apply ONLY these boards — do not include any others.",
  "PARS-REPORTABLE BOARDS (OCME&LL reports on behalf of physicians):",
  "- ABA (Anesthesiology): MOCA 2.0 Lifelong Learning. Standard accredited CME — NO pre/post test required. Activity must be tagged to ABA content outline area. Flag: Tell OCME&LL to tag the appropriate ABA content area in PARS.",
  "- ABIM (Internal Medicine & subspecialties): Medical Knowledge credit requires evaluation WITH learner feedback — activity must inform learners of participation threshold and provide feedback on whether they met it. Flag: OCME&LL will register in PARS; activity must include a feedback-based evaluation component.",
  "- ABOHNS (Otolaryngology / ENT): Self-Assessment credit requires evaluation with feedback. Patient Safety credit available if activity covers patient safety content. Flag: Tell OCME&LL to register in PARS.",
  "- ABPath (Pathology): Lifelong Learning — standard accredited CME, no evaluation with feedback required. Improvement in Health and Healthcare credit available for QI activities. Flag: Tell OCME&LL to register in PARS.",
  "- ABP (Pediatrics): Lifelong Learning and Self-Assessment credit requires evaluation with feedback. Flag: Tell OCME&LL to register in PARS; learner completion data submitted by December 1 each year.",
  "- ABS (Surgery): Standard Accredited CME accepted. Self-Assessment credit requires evaluation with feedback. Flag: Tell OCME&LL to register in PARS.",
  "- ABOS (Orthopaedic Surgery): Standard Accredited CME accepted. Self-Assessment credit requires pre-approval from ABOS and evaluation with feedback. Flag: Tell OCME&LL to register in PARS.",
  "- ABTS (Thoracic Surgery): Standard Accredited CME accepted. Self-Assessment and Performance in Practice credits available. Patient Safety credit available. Flag: Tell OCME&LL to register in PARS.",
  "NON-PARS BOARDS — physicians must self-report directly (do NOT include these in the moc array — instead mention in the flag for the relevant specialty):",
  "- ABEM (Emergency Medicine): Not in PARS collaboration. Emergency medicine physicians self-report to ABEM directly.",
  "- ABFM (Family Medicine): Not in PARS collaboration. Family medicine physicians self-report to ABFM directly.",
  "- ABPN (Psychiatry/Neurology): Not in PARS collaboration. Physicians self-report to ABPN directly.",
  "- ABOG (Ob/Gyn): Not in PARS collaboration. Physicians self-report to ABOG directly.",
  "- ABR (Radiology): Not in PARS collaboration. Physicians self-report to ABR directly.",
  "For non-PARS specialties in the audience, set applies=true but set rationale to explain that OCME&LL cannot report through PARS and physicians must self-report, and set flag to advise the planner accordingly.",
  "Leave moc as empty array if no physician specialties are in the audience.",
  "",
  "MICHIGAN MANDATORY TOPICS: Analyse the topic and content carefully for the following Michigan physician licensing requirements. Only include a topic if the activity content GENUINELY covers it substantively:",
  "- ethics: Medical ethics content (Michigan requires min 1 hour per 3-year cycle)",
  "- pain_management: Pain management or symptom management (Michigan requires min 3 hours per cycle including 1 hour on controlled substances)",
  "- implicit_bias: Implicit bias training content (Michigan requires 1 hour per year of license cycle)",
  "- opioid_prescribing: Opioid / controlled substance prescribing content (required every renewal for prescribers)",
  "- human_trafficking: Human trafficking identification content (one-time requirement for Michigan physicians)",
  "Do NOT include a topic just because it is tangentially related. Pain management content must be the explicit focus of at least part of the activity. Leave michiganTopics as empty array if none genuinely apply.",
  "",
  "COMMENDATION: Analyse the full activity description and identify which ACCME commendation criteria (C23-C38) genuinely apply. For each:",
  "- C23: Interprofessional teams plan AND deliver the activity (requires: multi-profession planning committee AND multi-profession faculty presenters AND activity designed to change team competence/performance)",
  "- C24: Patient or community representatives plan AND present",
  "- C25: Health professions students plan AND present",
  "- C26: Activity uses real health or practice data as educational content (not just mentions data exists)",
  "- C27: Teaches actionable strategies for population health or health equity (not just awareness)",
  "- C28: Collaboration with another organisation to address population health",
  "- C29: Communication skills training WITH observed evaluation AND formative feedback",
  "- C30: Procedural/technical skills training WITH observed evaluation AND formative feedback (simulation qualifies)",
  "- C31: Longitudinal curriculum over weeks/months with individualised feedback",
  "- C32: Post-activity support strategies with periodic effectiveness analysis",
  "- C33: Activity linked to research or scholarly project",
  "- C35: Genuinely innovative educational approach beyond standard lecture",
  "- C36: Measures and demonstrates improvement in learner performance in practice",
  "- C37: Linked to QI initiative and demonstrates healthcare quality improvement",
  "- C38: Demonstrates impact on patient or community outcomes",
  "Only include criteria with genuine evidence from the activity description. Rationale: one sentence, max 25 words, must name something specific from this activity. Steps: 2 max, each under 20 words, concrete and actionable.",
  "",
  "IPCE: Apply only if (1) the audience includes physicians AND at least one other health profession, AND (2) the planning is interprofessional (as indicated in inputs). If only one profession attends, IPCE does not apply regardless of topic.",
  "",
  "OTHER CREDITS: Include ANCC if nurses attend, ACPE if pharmacists, AAPA if PAs. One sentence rationale each. Only include if that profession is genuinely in the audience.",
  "",
  "Return ONLY the JSON object. No preamble, no markdown fences."].join("\n");

// ── Validation ──
function isStr(v) { return typeof v === "string"; }
function cleanStr(v, maxLen) { return isStr(v) ? v.trim().slice(0, maxLen) : null; }
function cleanEnumArray(v, allowed, maxItems) {
  if (!Array.isArray(v) || v.length > maxItems) return null;
  for (const item of v) if (!allowed.includes(item)) return null;
  return v;
}

function validate(body) {
  const errors = [];
  const topic = cleanStr(body.topic, MAX_TOPIC_CHARS);
  const content = cleanStr(body.content, MAX_CONTENT_CHARS);
  const other = cleanStr(body.other == null ? "" : body.other, MAX_OTHER_CHARS);
  if (!topic) errors.push("topic is required");
  if (!content) errors.push("content is required");
  if (other === null) errors.push("other must be a string");
  const profs = cleanEnumArray(body.profs || [], ALLOWED_PROFS, ALLOWED_PROFS.length);
  if (profs === null) errors.push("invalid profs");
  const specs = cleanEnumArray(body.specs || [], ALLOWED_SPECS, ALLOWED_SPECS.length);
  if (specs === null) errors.push("invalid specs");
  const formats = cleanEnumArray(body.formats || [], ALLOWED_FORMATS, ALLOWED_FORMATS.length);
  if (formats === null) errors.push("invalid formats");
  const ipce = ALLOWED_IPCE.includes(body.ipce) ? body.ipce : null;
  if (ipce === null) errors.push("invalid ipce");
  const gapSource = ALLOWED_GAP_SOURCES.includes(body.gapSource == null ? "" : body.gapSource)
    ? (body.gapSource || "") : null;
  if (gapSource === null) errors.push("invalid gapSource");
  if (errors.length) return { errors };
  return { fields: { topic, content, other, profs, specs, formats, ipce, gapSource } };
}

// ── Prompt assembly (moved server-side from the client) ──
function buildUserPrompt(f) {
  return [
    "Topic: " + f.topic,
    "Content and sessions: " + f.content,
    "Professions attending: " + (f.profs.length ? f.profs.join(", ") : "Not specified"),
    "Physician specialties attending: " + (f.specs.length ? f.specs.map(s => SPEC_LABELS[s] || s).join(", ") : "Not specified"),
    "Additional audience details: " + (f.other || "None"),
    "Educational format(s): " + (f.formats.length ? f.formats.join(", ") : "Not specified"),
    "Planning committee is interprofessional: " + f.ipce,
    "Gap source: " + (f.gapSource || "Not specified"),
    "",
    "Generate complete CME application language and full eligibility review for this activity.",
  ].join("\n");
}

// ── Rate limiting ──
// Primary: Cloudflare Rate Limiting bindings (durable, cross-isolate).
// Fallback: best-effort in-memory window if bindings are not configured.
const memHits = new Map(); // ip -> [timestamps]
const MEM_IP_LIMIT = 10, MEM_GLOBAL_LIMIT = 60, MEM_WINDOW_MS = 60000;

async function rateLimit(env, ip) {
  if (env.PER_IP_LIMITER || env.GLOBAL_LIMITER) {
    if (env.PER_IP_LIMITER) {
      const { success } = await env.PER_IP_LIMITER.limit({ key: ip });
      if (!success) return "Rate limit exceeded. Please wait a minute and try again.";
    }
    if (env.GLOBAL_LIMITER) {
      const { success } = await env.GLOBAL_LIMITER.limit({ key: "global" });
      if (!success) return "The service is receiving too many requests right now. Please try again shortly.";
    }
    return null;
  }
  // In-memory fallback (per-isolate; better than nothing, not durable)
  const now = Date.now();
  let all = 0;
  for (const [k, arr] of memHits) {
    const kept = arr.filter(t => now - t < MEM_WINDOW_MS);
    if (kept.length) { memHits.set(k, kept); all += kept.length; } else memHits.delete(k);
  }
  const mine = memHits.get(ip) || [];
  if (mine.length >= MEM_IP_LIMIT) return "Rate limit exceeded. Please wait a minute and try again.";
  if (all >= MEM_GLOBAL_LIMIT) return "The service is receiving too many requests right now. Please try again shortly.";
  mine.push(now); memHits.set(ip, mine);
  return null;
}

// ── Responses ──
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

    // Browser hygiene only — NOT a security boundary (headers are forgeable)
    const origin = request.headers.get("Origin") || "";
    if (!origin.startsWith(ALLOWED_ORIGIN)) return json({ error: "Forbidden" }, 403);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const limited = await rateLimit(env, ip);
    if (limited) return json({ error: limited }, 429);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
    const v = validate(body);
    if (v.errors) return json({ error: "Invalid request: " + v.errors.join("; ") }, 400);

    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(v.fields) }],
      }),
    });

    if (!anthropicResp.ok) {
      // Do not leak upstream error bodies to anonymous clients
      const status = anthropicResp.status;
      const msg = status === 429 ? "The AI service is rate limiting requests. Try again shortly."
                : status === 529 ? "The AI service is overloaded. Try again shortly."
                : "AI service error (HTTP " + status + ")";
      return json({ error: msg }, 502);
    }

    const data = await anthropicResp.json();
    const block = data.content && data.content.find(b => b.type === "text");
    if (!block) return json({ error: "AI service returned an empty response" }, 502);

    // Return only what the client needs
    return json({ text: block.text, stop_reason: data.stop_reason });
  },
};
