# CME Application Tools — Master Specification
## Michigan Medicine · Office of CME & Lifelong Learning

**Version:** 2.0 · March 2026  
**Status:** Production-ready (runs inside Claude.ai Project)  
**Files:** `cme-content-helper.html` · `cme-navigator.html`

---

## 1. SUITE OVERVIEW

Two standalone single-page HTML tools forming a complete CME application planning suite. Both live inside a Claude.ai Project and run via the Anthropic artifact API proxy — no separate hosting or API keys required for Project members.

| Tool | File | Purpose | When to use |
|---|---|---|---|
| Navigator | `cme-navigator.html` | Wizard that determines application type, credit categories, MOC eligibility, commendation criteria | Before starting a MiCME application |
| Content Helper | `cme-content-helper.html` | AI-generates all narrative application language — practice gap, educational needs, objectives, eligibility analysis | When writing the application content |

**Design principle:** Both tools must feel like the same product — same branding, same interaction language, same selection patterns, different function.

---

## 2. SHARED DESIGN SYSTEM

Both tools implement this design system identically. Any change to one must be reflected in the other.

### 2a. Colours (CSS variables — Content Helper uses `:root`, Navigator uses inline values)

```css
--michigan-blue:   #00274C   /* header background, primary buttons, text */
--michigan-maize:  #FFCB05   /* header stripe, selection accent, maize rule */
--arboretum-blue:  #2F65A7   /* section labels, borders, active state */
--text-primary:    #00274C
--text-secondary:  #4a6785
--text-muted:      #7a96b0
--border-light:    #d0d9e3
--border-mid:      #a8bdd4
--bg-main:         #f0f2f5
--bg-card:         #ffffff
--bg-blue-tint:    #eef2f7
```

### 2b. Typography

```css
font-family: 'Nunito Sans', Arial, sans-serif;
/* Google Fonts: ital,wght@0,400;0,600;0,700;0,800;1,400 */
```

### 2c. Header (identical two-stripe pattern)

```
[Maize stripe] "Michigan Medicine · University of Michigan" — 11px, 700, right-aligned
[Michigan Blue bar] "[Tool name]" left · "OCME&LL" right in Maize
```

### 2d. Card style

```css
background: #fff;
border-radius: 14px;
padding: 20px;
box-shadow: 0 1px 4px rgba(0,0,0,0.07);
```

### 2e. Selection interaction pattern (CRITICAL — must be identical in both tools)

When a user selects an option, three visual signals fire together:
1. **Arboretum blue border** — `border-color: var(--arboretum-blue)`
2. **Blue-tint background** — `background: var(--bg-blue-tint)` (`#eef2f7`)
3. **Maize accent** — left-border `4px solid var(--michigan-maize)` (full-width tiles) or `3px solid var(--michigan-maize)` (pills/chips)

This pattern applies to: Navigator option tiles · Content Helper check-tiles · Content Helper format chips · Content Helper gap source chips · Content Helper IPCE yes/no chips.

The option pill (practice gap A/B/C) uses `border-bottom: 3px solid var(--michigan-maize)` because it is a horizontal pill, not a tile.

### 2f. Buttons

| Type | Style | Usage |
|---|---|---|
| Primary action | `background:#00274C; color:#fff; border-radius:10px; font-weight:800` | Generate, Next, See Results |
| Secondary | `background:#fff; color:var(--arboretum-blue); border:1.5px solid var(--border-mid); border-radius:8px` | Back, New AI Draft |
| Danger/action | `background:var(--michigan-blue); color:#fff; border-radius:8px` | Print / Save PDF |
| Copy | `background:#fff; border:1.5px solid var(--border-mid); border-radius:8px` | Copy all sections, individual copy |

### 2g. Animation

```css
@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
.fade-up { animation: fadeUp 0.2s ease both }  /* 0.2s in both tools */
```

### 2h. Tooltips

Dark navy popup: `background:#1e293b; color:#f0f2f5; border-radius:10px; padding:13px 15px; font-size:12px`.  
Triggered by a small circular `i` button (`background:var(--arboretum-blue); color:#fff`).  
Content Helper uses fixed-position tooltips with JS repositioning. Navigator uses absolute-position tooltips.

### 2i. Section labels

```css
font-size: 9px; font-weight: 800; text-transform: uppercase;
letter-spacing: 0.5px; color: var(--arboretum-blue);
```

---

## 3. CME CONTENT HELPER

### 3a. Purpose

Generates all narrative content needed for a MiCME/CloudCME application via a single AI call. Output maps directly to CloudCME fields and is copy-paste ready after planner review.

### 3b. Layout

Two-panel layout: input panel (35% width, left) + output panel (65% width, right). Stacks vertically on mobile (≤820px breakpoint).

### 3c. Input panel — what planners provide

**Required fields (all textarea):**
- `id="topic"` — What is the topic?
- `id="content"` — What will be covered?
- Audience — two check-tile grids: `id="profGrid"` (professions) and `id="specGrid"` (physician specialties) + `id="audienceOther"` free-text

**Optional fields:**
- `id="formatGrid"` — Activity format (chip multi-select)
- `name="gapSource"` — How was the gap identified? (radio chips, 6 options, always visible — not hidden in expander)
- `name="ipce"` — Is the planning committee interprofessional? (Yes/No radio chips)

**Generate button:** `id="generateBtn"` / `id="btnText"` — calls `handleGenerate()`.

### 3d. Output sections generated

All sections are directly editable inline. Every textarea syncs to `state.selected` via `oninput`.

| # | Section | CloudCME field path | Notes |
|---|---|---|---|
| 1 | Practice Gap | Gap and Needs → Practice Gap | 3 options (Version A/B/C), radio pill selection, editable textarea |
| 2 | Educational Need | Gap and Needs → Educational Needs | Primary type (Knowledge/Competence/Performance) with reasoning box; optional secondary type |
| 3 | Expected Results | Gap and Needs → Expected Results | Editable textarea |
| 4 | Format Justification | Gap and Needs → Educational Format | Editable textarea |
| 5 | Learning Objectives | Learning Outcomes & Competencies → Learning Objectives | 3–4 objectives; each is checkbox + editable textarea; unchecked = dimmed + excluded from print |
| 6 | Competency Frameworks | Learning Outcomes → Competencies | ACGME/ABMS · IOM · IPEC chips; only shown if AI returns competencies |
| 7 | Needs Assessment Summary | Gap and Needs → Needs Assessment → Summary of findings | Editable textarea |
| 8 | Eligibility Review | Various — see MOC section | Generated automatically; MOC, Michigan topics, IPCE, commendation, other credits |

**Barriers to Learning** — deliberately excluded. Not required by CloudCME for standard applications.

### 3e. Action bars

Two identical action bars (top and bottom of output panel) each containing three buttons:
1. **New AI Draft** (`btn-regen`) — re-runs AI with same inputs, replaces all AI-generated output, preserves form fields
2. **Copy all sections** (`btn-copy-all`) — copies full plain-text document to clipboard with CloudCME field paths as headers
3. **Print / Save PDF** (`btn-print`) — opens print preview window

### 3f. Copy all sections

Reads live DOM values (not state) so all user edits are captured. Assembles plain text with CloudCME field path headers above each section. Includes clipboard fallback (`execCommand`) for sandboxed environments.

### 3g. Print / Save PDF

Opens a new window with a full preview of the formatted document before any print dialog appears. The window includes:
- Sticky preview toolbar (Michigan Blue): "Print preview" label + Close + Print/Save PDF buttons
- Michigan Blue document header with Maize stripe, OCME&LL eyebrow, title, generation date
- Activity summary box (topic, audience, format)
- All 8 output sections in CloudCME field order with Maize-underlined section headings
- Eligibility section if present
- Footer disclaimer
- `@media print` hides toolbar; produces clean document

**Deployment note:** The print preview opens via `window.open()`. This works correctly when the tool is hosted as a real web page. Inside the Claude.ai artifact sandbox, the browser may show a download warning — this is a sandbox limitation, not a code issue.

---

## 4. AI LAYER — CONTENT HELPER

### 4a. API call

```javascript
fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-5",   // canonical model string
    max_tokens: 5000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt() }]
  })
})
```

### 4b. Error handling

Robust sequence before JSON.parse:
1. HTTP error check (`!resp.ok`)
2. Empty response check (`!data.content || !data.content.length`)
3. Content type check (`firstBlock.type !== "text"`)
4. `stop_reason === "max_tokens"` guard — throws before attempting parse
5. JSON.parse in try/catch — error message includes first 300 chars of raw response

### 4c. JSON schema (what the AI returns)

```json
{
  "practiceGap": ["option A", "option B", "option C"],
  "educationalNeeds": {
    "primaryType": "Knowledge | Competence | Performance",
    "reasoning": "one sentence",
    "primaryText": "2-3 sentences, max 80 words",
    "secondaryType": "Knowledge | Competence | Performance | null",
    "secondaryText": "2-3 sentences or null"
  },
  "expectedResults": "2-3 sentences, max 80 words",
  "formatJustification": "2-3 sentences, max 70 words",
  "learningObjectives": ["obj 1", "obj 2", "obj 3"],
  "competencies": {
    "acgme": ["..."],
    "iom": ["..."],
    "ipec": ["..."]
  },
  "needsAssessmentSummary": "3-4 sentences, max 110 words",
  "eligibility": {
    "moc": [{ "board": "...", "applies": true, "rationale": "...", "requirements": ["..."], "flag": "..." }],
    "michiganTopics": [{ "topic": "...", "code": "...", "applies": true, "rationale": "...", "requirement": "...", "flag": "..." }],
    "commendation": [{ "code": "C23-C38", "title": "...", "confidence": "high|possible", "rationale": "...", "steps": ["..."] }],
    "ipce": { "applies": true, "rationale": "...", "steps": ["..."] },
    "otherCredits": [{ "name": "...", "applies": true, "rationale": "...", "flag": "..." }]
  }
}
```

### 4d. Key system prompt rules

**Conciseness:** "Every sentence must earn its place. Never pad, never restate, never add caveats."

**Educational needs diagnosis:**
- Diagnose PRIMARY root cause only (Knowledge / Competence / Performance)
- Secondary need: `null` by default. Only add if activity has structurally distinct components targeting two different root causes
- Never add Knowledge as secondary when primary is Performance
- When in doubt: null

**Practice gap:** 3 meaningfully different options (2-3 sentences, max 75 words each). Must name audience, describe current vs ideal practice. Never generic.

**Learning objectives:** 3-4 objectives. Action verb only — no "participants will be able to" prefix (added by UI). Never "understand" or "appreciate".

**MOC (PARS-reportable boards):** ABA, ABIM, ABOS, ABOHNS, ABPath, ABP, ABS, ABTS  
**Non-PARS boards (self-report):** ABEM, ABFM, ABPN, ABOG, ABR — tool flags these for physician self-reporting

**Board-specific accuracy:**
- ABA: standard accredited CME, NO pre/post test required; must tag to ABA content outline area
- ABIM: requires evaluation WITH learner feedback (not satisfaction survey alone)
- ABP: evaluation with feedback required; December 1 annual reporting deadline
- ABOS: Self-Assessment credit requires pre-approval from ABOS

---

## 5. STATE OBJECT — CONTENT HELPER

```javascript
var state = {
  status: "idle",     // idle | loading | done | error
  results: null,      // raw parsed JSON from API
  selected: {
    practiceGapOption: 0,         // 0|1|2 — which version is active
    practiceGapText: "",          // editable text (may differ from results)
    needsPrimaryType: "",         // "Knowledge"|"Competence"|"Performance"
    needsReasoning: "",           // AI's plain-language explanation
    needsPrimaryText: "",
    needsSecondaryType: null,
    needsSecondaryText: "",
    expectedResults: "",
    formatJustification: "",
    objectives: [],               // [{text, checked}]
    competencies: null,           // {acgme:[], iom:[], ipec:[]}
    summaryText: "",
    eligibility: null
  },
  errorMessage: null
};
```

`renderOutput()` is the single render function — called after every state change. Handles all four statuses (idle, loading, error, done).

---

## 6. CME CREDIT APPLICATION NAVIGATOR

### 6a. Purpose

A guided wizard (9 questions) that analyses an activity description and produces:
- Application type recommendation (Live Course, RSS, Enduring Material, etc.)
- Additional credit types available (ANCC, ACPE, AAPA, IPCE)
- MOC board credit guidance (PARS-reported vs self-report)
- ACCME Commendation criteria flagged
- Michigan mandatory licensing topic designations
- Two printable documents: Planner Preparation Guide and OCME Staff Build Brief

### 6b. Questions (in order)

1. `activity_structure` — One-time / Repeated / RSS
2. `delivery_format` — Live / Virtual / Hybrid / Enduring (conditional on #1)
3. `learning_environment` — Simulation, standard, etc. (conditional on live formats)
4. `hybrid_components` — Recording options (conditional on hybrid)
5. `audience_professions` — Multi-select professions
6. `content_focus` — Multi-select content topics
7. `evaluation_plan` — Single-select evaluation method
8. `planning_process` — Multi-select planning details
9. `follow_up` — Multi-select post-activity plans
10. `michigan_topics` — Multi-select Michigan licensing topics

Questions 3 and 4 are conditional (`showIf`). All others always appear.

### 6c. Results tabs

`application` · `credits` · `board` · `commendation` · `michigan` · `export`

### 6d. Export tab

Generates two documents via `generatePlannerGuide()` and `generateStaffBrief()`:
- **Planner Preparation Guide** — what the educational planner needs to gather
- **OCME Staff Build Brief** — MiCME/CloudCME setup reference for OCME&LL staff

Both rendered with `printDocument()` (same pattern as Content Helper — popup preview window, not auto-print).

### 6e. MOC data — SPECIALTY_MOC object

Two tiers with distinct planner guidance:

**PARS-reportable (OCME&LL reports via ACCME PARS):**
- `internal_med` → ABIM (evaluation with feedback required)
- `anesthesiology` → ABA (no pre/post test; tag to content outline)
- `pediatrics` → ABP (evaluation with feedback; December 1 deadline)
- `surgery` → ABS / ABOS / ABTS (ABOS Self-Assessment requires ABOS pre-approval)
- Plus ABOHNS, ABPath (handled in Content Helper MOC; not in Navigator specialty list)

**Non-PARS (physician self-reports directly to board):**
- `family_med` → ABFM
- `psychiatry_neuro` → ABPN
- `ob_gyn` → ABOG
- `radiology` → ABR
- `emergency_med` → ABEM

`multi_specialty` entry explains both pathways.

---

## 7. TECHNICAL ARCHITECTURE — BOTH TOOLS

### 7a. Common

- Single HTML file — pure vanilla JS, no frameworks, no build step
- All CSS in `<style>` tag, all JS in `<script>` tag
- Google Fonts loaded via `<link>` (only external dependency)
- Anthropic API key: not embedded — provided by Claude.ai Project artifact proxy
- No `localStorage`, `sessionStorage`, or persistent state

### 7b. Deployment

**Current:** Runs inside Claude.ai Project (add users by their Claude.ai email address) OR as a standalone web page via the Cloudflare Worker proxy.

**Cloudflare Worker proxy:** `https://anthropic-proxy.doctorhealy.workers.dev`  
The Content Helper calls this endpoint directly. The Worker holds the Anthropic API key server-side — no key is embedded in the HTML. This makes the HTML files safe to publish to GitHub and deploy anywhere.

**GitHub Pages (live):** `https://doctorhealy.github.io/cme-navigator/`  
Both tools are hosted here. Open the URL in any browser — no login, no install.

**Future (Track B):** Full standalone hosting with institutional domain. The `window.open()` print preview and full functionality work correctly in a hosted environment outside the Claude.ai sandbox.

### 7c. Content Helper — key function list

| Function | Purpose |
|---|---|
| `handleGenerate()` | Validates inputs, calls API, populates state, calls renderOutput |
| `handleRegenerate()` | Re-runs API with same inputs, replaces AI output, preserves form |
| `buildUserPrompt()` | Assembles user message from all form inputs |
| `renderOutput()` | Single render function for all output states (idle/loading/error/done) |
| `handlePrint()` | Reads live DOM, builds print HTML, calls printDocument |
| `printDocument()` | Opens preview window with branded document |
| `copyAllSections()` | Reads live DOM, assembles plain text, writes to clipboard |
| `renderEligibility()` | Renders MOC, Michigan topics, IPCE, commendation, other credits |
| `selectGapOption(idx)` | Updates practice gap selection and textarea |
| `selectGapChip(id)` | Updates gap source radio chip visual state |
| `toggleObjective(idx, checked)` | Updates objective checked state |
| `tip(id, html)` | Returns tooltip HTML for inline insertion |
| `toggleTip(id, event)` | Shows/hides tooltip with fixed-position calculation |
| `escHtml(str)` | HTML-escapes all user and AI content before rendering |
| `copyWrap(taId, taHtml)` | Wraps a textarea with a copy button |

---

## 8. MOC ACCURACY REFERENCE

Source: ACCME CME for MOC Program Guide, Version 3.3 (April 2025)  
URL: https://accme.org/wp-content/uploads/2025/03/840_20250408_cme_for_moc_program_guide.pdf

### Boards in ACCME PARS collaboration (8 boards)

| Board | Program name | Credit type | Key requirements |
|---|---|---|---|
| ABA | MOCA 2.0® | Lifelong Learning | Standard accredited CME; NO pre/post test; must tag to ABA content outline area |
| ABIM | MOC Assessment Recognition | Medical Knowledge | Requires evaluation WITH learner feedback — inform learners of participation threshold |
| ABOHNS | Continuing Certification | Self-Assessment | Evaluation with feedback required |
| ABPath | Continuing Certification | Lifelong Learning | Standard accredited CME |
| ABP | Maintenance of Certification | Lifelong Learning & Self-Assessment | Evaluation with feedback; December 1 annual deadline |
| ABS | Continuous Certification | Accredited CME | Standard accredited CME accepted |
| ABOS | Maintenance of Certification | Accredited CME | Self-Assessment requires ABOS pre-approval |
| ABTS | Continuing Certification | Accredited CME | Standard accredited CME accepted |

### Boards NOT in PARS (physician self-reports)

ABEM · ABFM · ABPN · ABOG · ABR  
These boards are not in the ACCME PARS collaboration. OCME&LL cannot report on behalf of physicians. Planners must advise physician attendees to self-report using their certificate of completion.

---

## 9. KNOWN LIMITATIONS & DEPLOYMENT NOTES

### Running inside Claude.ai Project (current state)
- Fully functional for Project members
- Print/Save PDF: `window.open()` may show a browser download warning in the artifact sandbox — this is a sandbox limitation, not a code bug; works correctly when hosted
- Sharing: add colleagues by Claude.ai email address; file cannot be used standalone

### Future standalone hosting (Track B)
- Requires server-side Anthropic API key (not embedded in HTML)
- `window.open()` print preview works cleanly
- No other changes needed to the HTML/CSS/JS

### HealthStream/CloudCME API
- HealthStream has a developer portal with enterprise REST APIs
- Whether a "create CME activity application" endpoint exists is unconfirmed
- A conversation with the Michigan Medicine HealthStream account rep is needed to determine Track B integration vs standalone approach

---

## 10. FILES IN THIS PROJECT

| File | Status | Description |
|---|---|---|
| `cme-content-helper.html` | Production | AI content generation tool |
| `cme-navigator.html` | Production | Application type and credit wizard |
| `cme-content-helper-spec.md` | This file | Master specification (both tools) |

---

*Michigan Medicine · Office of CME & Lifelong Learning · OCME&LL*  
*Specification v2.0 · March 2026*
