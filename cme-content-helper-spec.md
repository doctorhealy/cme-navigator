# CME Application Tools — Master Specification
## Michigan Medicine · Office of CME & Lifelong Learning (OCME&LL)

**Version:** 3.0 · March 2026
**Status:** Production — deployed on GitHub Pages via Cloudflare Worker proxy
**Live URL:** https://doctorhealy.github.io/cme-navigator/
**Files:** `cme-navigator.html` · `cme-content-helper.html` · `cloudflare-worker.js`

---

## 1. SUITE OVERVIEW

Three tools planned as a coordinated suite covering the full CME application workflow at Michigan Medicine. Two are in production; the third is in planning.

| # | Tool | Purpose | When to use | Status |
|---|---|---|---|---|
| 1 | **CME Application Navigator** | Wizard that determines application type, all credit categories, MOC board eligibility, commendation criteria, Michigan licensing topics, commercial support compliance, and IPCE opportunity | Before or during planning — run first | Production |
| 2 | **CME Content Helper** | AI generates all narrative application content — practice gap, educational needs, learning objectives, expected results, format justification, competency mapping, eligibility analysis | When writing the MiCME/CloudCME application | Production |
| 3 | **CME Submission Assistant** | Planned — guides final review and submission steps before entering MiCME/CloudCME | Before submitting | Planned |

**Design principle:** All tools in the suite share identical branding, design tokens, interaction patterns, and clinical/regulatory knowledge. Different function; shared understanding.

**Strategic context:** Michigan Medicine OCME&LL is working toward Joint Accreditation for Interprofessional Continuing Education, which requires 25% of activities to qualify as interprofessional. Both tools actively surface IPCE opportunities and explain their value to planners.

---

## 2. DEPLOYMENT ARCHITECTURE

### 2a. Hosting

- **GitHub Pages:** `https://doctorhealy.github.io/cme-navigator/`
- **Cloudflare Worker proxy:** `https://anthropic-proxy.doctorhealy.workers.dev`
- The Content Helper calls this Worker URL. The Worker holds the Anthropic API key server-side and forwards requests to `api.anthropic.com`. No API key appears in any HTML file.

### 2b. Cloudflare Worker (`cloudflare-worker.js`)

```javascript
const ALLOWED_ORIGIN = "https://doctorhealy.github.io";
// Accepts POST from GitHub Pages origin only (403 for all others)
// Adds x-api-key and anthropic-version headers server-side
// Returns Anthropic API response with CORS headers
```

**Setup:** Deploy to Cloudflare Workers. Add `ANTHROPIC_API_KEY` as an encrypted secret in Settings → Variables and Secrets.

### 2c. Claude.ai Project (internal use)

Both tools also run inside the Michigan Medicine Claude.ai Project, where the artifact API proxy handles authentication. Add colleagues by their Claude.ai email address to share access.

---

## 3. SHARED DESIGN SYSTEM

Both tools implement this design system identically. Any change to one must be reflected in the other.

### 3a. Colours

```css
/* Content Helper uses CSS custom properties; Navigator uses inline JS values */
--michigan-blue:   #00274C   /* header background, primary buttons */
--michigan-maize:  #FFCB05   /* header stripe, selection accent */
--arboretum-blue:  #2F65A7   /* section labels, active borders */
--text-primary:    #00274C
--text-secondary:  #4a6785
--text-muted:      #7a96b0
--border-light:    #d0d9e3
--border-mid:      #a8bdd4
--bg-main:         #f0f2f5
--bg-card:         #ffffff
--bg-blue-tint:    #eef2f7
```

### 3b. Typography

```css
font-family: 'Nunito Sans', Arial, sans-serif;
/* Google Fonts: ital,wght@0,400;0,600;0,700;0,800;1,400 */
```

### 3c. Header — identical two-stripe pattern

```
[Maize stripe]      "Michigan Medicine · University of Michigan" — 11px, 700, right-aligned
[Michigan Blue bar] "[Tool name]" left · "OCME&LL" right in Maize
```

### 3d. Cards

```css
background: #fff; border-radius: 14px; padding: 20px;
box-shadow: 0 1px 4px rgba(0,0,0,0.07);
```

### 3e. Selection interaction — three signals fire together

When a user selects any option (tile, chip, pill), all three apply:

1. **Arboretum blue border** `border-color: #2F65A7`
2. **Blue-tint background** `background: #eef2f7`
3. **Maize left-border accent** `border-left: 4px solid #FFCB05` (tiles) or `border-left: 3px solid #FFCB05` (chips)

The A/B/C practice gap pills use `border-bottom: 3px solid #FFCB05`.

### 3f. Buttons

| Type | Style |
|---|---|
| Primary | `background:#00274C; color:#fff; border-radius:10px; font-weight:800` |
| Secondary | `background:#fff; color:#2F65A7; border:1.5px solid #a8bdd4; border-radius:8px` |
| Print/action | `background:#00274C; color:#fff; border-radius:8px` |
| Copy | `background:#fff; border:1.5px solid #a8bdd4; border-radius:8px` |

### 3g. Animation

```css
@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
.fade-up { animation: fadeUp 0.2s ease both }
```

### 3h. Tooltips

Dark navy popup: `background:#1e293b; color:#f0f2f5; border-radius:10px; font-size:13px; white-space:pre-wrap`. Triggered by `ⓘ` button. Navigator uses absolute-position; Content Helper uses fixed-position with JS repositioning.

### 3i. Section labels

```css
font-size: 9px; font-weight: 800; text-transform: uppercase;
letter-spacing: 0.5px; color: #2F65A7;
```

---

## 4. CME APPLICATION NAVIGATOR

### 4a. Purpose

An 11-question guided wizard producing: application type recommendation · additional credit types · MOC board credit guidance · IPCE opportunity identification · ACCME Commendation criteria · Michigan mandatory topic designations · commercial support compliance flags · two printable planning documents.

### 4b. Questions (11 total, 2 conditional)

| # | ID | Type | Conditional on |
|---|---|---|---|
| 1 | `activity_structure` | single | — |
| 2 | `delivery_format` | single | — |
| 3 | `hybrid_components` | multi | delivery_format = "hybrid" |
| 4 | `learning_environment` | multi | delivery_format is live/virtual/hybrid |
| 5 | `audience_professions` | multi | — |
| 6 | `physician_specialties` | multi | — |
| 7 | `content_focus` | multi | — |
| 8 | `evaluation_plan` | single | — |
| 9 | `planning_process` | multi | — |
| 10 | `funding` | multi | — |
| 11 | `follow_up` | multi | — |

`state.step` is always an index into `getVisibleQuestions()` (filtered array). Question counter is fixed at "X of 11" regardless of path.

**Next button:** Disabled until a selection is made; shows "Select at least one option to continue" when disabled.

**Mutual exclusion on funding:** Selecting `no_external` clears all other funding options. Selecting any other funding option clears `no_external`.

### 4c. Physician specialties (12 values — identical in both tools)

`internal_med` · `anesthesiology` · `pediatrics` · `emergency_med` · `surgery` · `psychiatry_neuro` · `ob_gyn` · `radiology` · `family_med` · `ent` · `pathology` · `other_spec`

MOC results are generated for **all selected specialties simultaneously** — not just a single primary specialty.

### 4d. Content focus — 14 options across 5 divider groups

Clinical knowledge · Procedural — **High-value:** Patient safety · QI — **Audience:** Communication · Mental health — **Population health:** Population health · Health equity/SDOH — **Michigan mandatory:** Ethics (1hr/cycle) · Pain management (3hrs/cycle) · Opioid prescribing (every renewal) · Implicit bias (1hr/year) · Human trafficking (one-time) — **Other:** Research · Technology

Michigan mandatory topic results are derived directly from `content_focus` selections — no separate Michigan question exists.

### 4e. Funding question

**Commercial support** (ACCME Standard 4 — LOA required before activity):
- `commercial_support_money` — financial contribution (badge: "📄 LOA required")
- `commercial_support_inkind` — equipment, food, materials, venue (badge: "📄 LOA required")

**Associated promotion** (Michigan Medicine policy / ACCME Standard 5 — outside CME framework):
- `exhibits` — exhibit booths or display tables (badge: "MM policy")
- `advertising` — advertising in materials or signage (badge: "MM policy")

`no_external` — neither applies (mutually exclusive with all above).

### 4f. Results tabs — shown only when populated

| Tab | Shows when | Count badge |
|---|---|---|
| 📋 Application | Always | — |
| ➕ Additional Credits | `additionalCredits.length > 0` | Yes (if >1) |
| 🏥 Board Credit | `boardCredit && boardCredit.length > 0` | Yes (if >1) |
| ⭐ Commendation | `commendation.length > 0` | Yes (if >1) |
| 🔵 Michigan | `michigan.length > 0` | Yes (if >1) |
| 📄 Generate Docs | Always | — |

If the active tab becomes hidden (e.g. user edits answers), state resets to Application tab.

### 4g. Results header

Shows: compact activity summary (format · specialties · non-physician professions), contextual message (urgent if commercial support or JP detected), and two buttons: "← Start Over" (clears all answers) and "✏ Edit answers" (returns to wizard with answers preserved).

### 4h. Application tab card types (in render order)

1. **Commercial Support card** (red) — "ACTION — CONTACT OCME&LL NOW" — LOA required before anything else
2. **Joint Providership card** (red) — "ACTION — BEFORE ANYTHING ELSE" — agreement required before planning
3. **Co-Organisation card** (blue) — informational, accredited partner
4. **Standard application type card** — RSS / Live Course / Enduring Material / Hybrid
5. **Hybrid notes card** (amber) — conditional on hybrid format
6. **AMA PRA Category 1 Credit** (green) — always present
7. **Flags** (amber) — miscellaneous planning flags including associated promotion notice
8. **Application Checklist** — standard prep items

### 4i. Board Credit tab

- Green summary banner: PARS-reported boards
- Amber summary banner: self-report boards (if any)
- One card per selected specialty (colour-coded: purple for PARS, amber for self-report)
- ABIM evaluation warning if survey-only evaluation selected
- Shared numbered action steps at bottom

### 4j. IPCE opportunity logic

| Scenario | Output |
|---|---|
| Multi-profession audience + `multi_prof` planning | IPCE credit card in Additional Credits (purple) |
| Multi-profession audience + `solo_planner` | "IPCE Opportunity — One Step Away" amber card with "HOW TO UNLOCK THIS" |
| Multi-profession audience + no planning declared | Same amber opportunity card |
| During wizard: `multi_prof` tooltip | Explains 25% Joint Accreditation threshold; offers OCME&LL matchmaking |

### 4k. Commendation criteria

15 criteria (C23–C38) across 5 categories. Triggered by `allTriggers` array combining `content_focus`, `planning_process`, `follow_up`, `learning_environment`, `delivery_format`, and `evaluation_plan` values. Category "Demonstrating Real-World Impact ★" is marked as most important.

### 4l. Export tab — two documents

**Planner Preparation Checklist** (`generatePlannerGuide`): Urgent items first (commercial support LOA, Joint Providership, hybrid recording), checklist of what to gather, credits to flag, Michigan topics, commendation, after-activity steps.

**OCME Staff Build Brief** (`generateStaffBrief`): CloudCME setup reference — application type, providership, commercial support, MOC registration, IPCE, commendation evidence, post-activity workflow.

Both use hidden iframe print (direct to dialog, no preview).

### 4m. State and caching

```javascript
var state = {
  answers: {},        // keyed by question id
  step: 0,            // index into getVisibleQuestions()
  done: false,
  activeTab: "application",
  openTooltip: null,
  docPlannerOpen: false, docStaffOpen: false,
  docPlannerHtml: null,  // cleared on every answer change (toggle())
  docStaffHtml: null
};
```

### 4n. Cross-tool footer

A footer beneath all navigator views references the Content Helper and describes what it generates.

---

## 5. CME CONTENT HELPER

### 5a. Layout

Two-panel: input (35%, left) + output (65%, right). Stacks at ≤820px.

### 5b. Input panel

**Required text areas:** `id="topic"` · `id="content"`

**Audience grids:**
- `id="profGrid"` — professions (9 options: Physicians, Nurses, Pharmacists, PAs, Psychologists, Social Workers, Residents/Fellows, Students, Other HCPs)
- `id="specGrid"` — physician specialties (12 values — identical to Navigator)
- `id="audienceOther"` — free text

**Optional:**
- `id="formatGrid"` — activity format chips
- `id="gapSourceGrid"` — how gap was identified (6 radio chips)
- `name="ipce"` — interprofessional planning? (Yes/No radio chips)
- `id="generateBtn"` — triggers `handleGenerate()`

**How-to-use card:** 3-step workflow (Generate → Review/Edit → Copy or Print), links to Navigator.

### 5c. Output sections (8)

| # | Section | CloudCME field path |
|---|---|---|
| 1 | Practice Gap | Gap and Needs → Practice Gap |
| 2 | Educational Need | Gap and Needs → Educational Needs |
| 3 | Expected Results | Gap and Needs → Expected Results |
| 4 | Format Justification | Gap and Needs → Educational Format |
| 5 | Learning Objectives | Learning Outcomes & Competencies → Learning Objectives |
| 6 | Competency Frameworks | Learning Outcomes → Competencies |
| 7 | Needs Assessment Summary | Gap and Needs → Needs Assessment → Summary |
| 8 | Eligibility Review | Various |

All text boxes directly editable. Each has an individual copy button. Eligibility Review has five sub-sections (MOC, Michigan, IPCE, Commendation, Other credits) — each conditional.

**IPCE opportunity nudge:** Amber card in eligibility panel when IPCE doesn't apply but audience includes non-physician professions — names count of non-physician professions and explains what one change unlocks.

### 5d. Action bars (top and bottom)

1. **New AI Draft** — checks if gap textarea has been edited; confirms before replacing
2. **Copy all sections** — reads live DOM (captures user edits), assembles with CloudCME path headers, clipboard fallback
3. **Print / Save PDF** — `window.open()` preview window with branded document

### 5e. Key functions

| Function | Purpose |
|---|---|
| `handleGenerate()` | Validates, calls API, populates state, calls `renderOutput()` |
| `handleRegenerate()` | Checks for edits, re-runs API with same inputs, preserves form |
| `buildUserPrompt()` | Assembles user message from all form inputs |
| `renderOutput()` | Single render function for all statuses (idle/loading/error/done) |
| `renderEligibility(el)` | Renders all 5 eligibility sub-sections |
| `handlePrint()` | Reads live DOM, builds HTML, calls `printDocument()` |
| `printDocument()` | Opens preview window |
| `copyAllSections()` | Reads live DOM, assembles plain text, writes to clipboard |
| `escHtml(str)` | HTML-escapes all user and AI content before rendering |
| `copyWrap(taId, taHtml)` | Wraps textarea with individual copy button |

---

## 6. AI LAYER — CONTENT HELPER

### 6a. API call

```javascript
fetch("https://anthropic-proxy.doctorhealy.workers.dev", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-5",
    max_tokens: 5000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt() }]
  })
})
```

### 6b. Error handling sequence

1. HTTP error (`!resp.ok`)
2. Empty response (`!data.content || !data.content.length`)
3. Content type (`firstBlock.type !== "text"`)
4. `stop_reason === "max_tokens"` — throws before parse
5. JSON.parse in try/catch — includes raw response excerpt in error message

### 6c. JSON schema

```json
{
  "practiceGap": ["A", "B", "C"],
  "educationalNeeds": {
    "primaryType": "Knowledge | Competence | Performance",
    "reasoning": "one sentence",
    "primaryText": "max 80 words",
    "secondaryType": "... | null",
    "secondaryText": "max 70 words or null"
  },
  "expectedResults": "max 80 words",
  "formatJustification": "max 70 words",
  "learningObjectives": ["obj 1", "obj 2", "obj 3"],
  "competencies": { "acgme": [], "iom": [], "ipec": [] },
  "needsAssessmentSummary": "max 110 words",
  "eligibility": {
    "moc": [{ "board": "...", "applies": true, "rationale": "...", "requirements": [], "flag": "..." }],
    "michiganTopics": [{ "topic": "...", "code": "ethics|pain_management|implicit_bias|opioid_prescribing|human_trafficking", "applies": true, "rationale": "...", "requirement": "...", "flag": "..." }],
    "commendation": [{ "code": "C23–C38", "title": "...", "confidence": "high|possible", "rationale": "...", "steps": [] }],
    "ipce": { "applies": true|false, "rationale": "...", "steps": [] },
    "otherCredits": [{ "name": "ANCC|ACPE|AAPA", "applies": true, "rationale": "...", "flag": "..." }]
  }
}
```

### 6d. Key system prompt rules

- **Conciseness:** every sentence must earn its place
- **Educational needs:** PRIMARY root cause only; secondary defaults to null; never Knowledge secondary when primary is Performance
- **Practice gap:** 3 meaningfully different options, max 75 words each, must name audience and describe current vs ideal
- **Objectives:** 3–4; action verb clauses only (UI adds stem); never "understand" or "appreciate"
- **Barriers to learning:** deliberately excluded — not required by CloudCME for standard applications
- **MOC:** 8 PARS boards (ABA, ABIM, ABP, ABS, ABOS, ABTS, ABOHNS, ABPath); 5 non-PARS self-report boards (ABEM, ABFM, ABPN, ABOG, ABR)

---

## 7. MOC ACCURACY REFERENCE

**Source:** ACCME CME for MOC Program Guide v3.3, April 2025

### PARS-reportable (OCME&LL reports via ACCME PARS)

| Key | Board | Requirements |
|---|---|---|
| `internal_med` | ABIM — Medical Knowledge | Evaluation with learner feedback required; satisfaction survey alone insufficient |
| `anesthesiology` | ABA — MOCA 2.0® | NO pre/post test; must tag to ABA content outline area; Patient Safety credit also available |
| `pediatrics` | ABP — Lifelong Learning & Self-Assessment | Evaluation with feedback; December 1 annual deadline |
| `surgery` | ABS / ABOS / ABTS | ABS and ABTS accept standard CME; ABOS Self-Assessment requires ABOS pre-approval |
| `ent` | ABOHNS — Continuing Certification | Evaluation with feedback; Patient Safety credit also available |
| `pathology` | ABPath — Lifelong Learning | Standard CME; QI activities may qualify for Improvement in Health and Healthcare |

### Non-PARS (physician self-reports directly)

`family_med` → ABFM · `psychiatry_neuro` → ABPN · `ob_gyn` → ABOG · `radiology` → ABR · `emergency_med` → ABEM

---

## 8. COMMERCIAL SUPPORT & ASSOCIATED PROMOTION

**Source:** ACCME Standards for Integrity and Independence (effective January 2022, Standards 4 and 5)

### Commercial support (Standard 4)

Financial or in-kind support from an ineligible company (pharmaceutical, device, or healthcare product company) to pay costs of the CME activity.

- LOA signed by both company AND OCME&LL **before activity begins**
- OCME&LL is the signatory — not the department, not the planner
- OCME&LL controls how funds are spent
- Company cannot pay speakers, faculty, or learners directly
- Company name disclosed to learners before activity; no logos in educational materials
- PARS reporting required
- In-kind: company logos obscured on equipment; employees are technicians only

### Associated promotion (Standard 5 + Michigan Medicine policy)

Exhibit booths, advertising — outside the CME accreditation framework. Money paid is not commercial support.

- Cannot influence planning, content, or speaker selection
- Cannot be a condition of receiving commercial support
- Must be physically (separate room) or temporally (30+ min) separated from CME
- No promotional materials or company branding in educational materials
- Acknowledgement by name only — no logos or product branding

---

## 9. JOINT ACCREDITATION STRATEGY

**Threshold:** 25% of activities must be interprofessional (IPCE) for eligibility  
**Also required:** Functional IP education structures in place for 18+ months  
**Current baseline:** ~10% of activities  
**Benefit of achieving:** Up to 6-year accreditation term (vs standard shorter term)

IPCE definition: members of two or more health professions involved in both planning AND presenting, designing education to improve interprofessional collaborative practice.

Both tools surface the 25% target and OCME&LL matchmaking offer at every relevant touchpoint.

---

## 10. USABILITY DECISIONS

The following usability improvements were implemented as of March 2026:

| Issue | Solution |
|---|---|
| Empty result tabs confused planners | Tabs hidden when no content; shown only when populated |
| Credits tab label was vague | Renamed to "Additional Credits" |
| No activity summary on results page | Compact format · specialties · professions summary in results header |
| No way to edit answers without restarting | "✏ Edit answers" button returns to wizard with answers preserved |
| Funding "Neither" could co-exist with other selections | Mutual exclusion enforced — selecting either clears the other |
| Audience professions appeared after specialties | Reordered: professions → then specialties |
| Next button gave no reason when disabled | "Select at least one option to continue" hint added |
| Tools didn't reference each other | Cross-tool footer on Navigator; expanded Navigator link in Helper |
| Regenerate overwrote edits silently | Confirmation dialog added when gap textarea has been edited |
| Tabs had no indication of content volume | Count badges added (shown when >1 item in tab) |

---

## 11. FILE INVENTORY

| File | Lines | Purpose | Status |
|---|---|---|---|
| `cme-navigator.html` | ~1,490 | CME Application Navigator (Tool 1) | Production |
| `cme-content-helper.html` | ~1,379 | CME Content Helper (Tool 2) | Production |
| `cloudflare-worker.js` | ~65 | Anthropic API proxy (Content Helper backend) | Production |
| `cme-content-helper-spec.md` | this file | Master specification | Current |
| *(planned)* | — | CME Submission Assistant (Tool 3) | Planned |

**Stack:** Pure vanilla JS, no frameworks, no build step. CSS and JS inline. Google Fonts (Nunito Sans) is the only external dependency beyond the Anthropic API.

---

## 12. KNOWN LIMITATIONS & FUTURE WORK

### Current
- **Content Helper print in Claude.ai sandbox:** `window.open()` may trigger download warning — works correctly from GitHub Pages
- **Navigator print:** Hidden iframe (no preview). Content Helper uses preview-first. Alignment is deferred
- **Tooltip tap targets:** Small on mobile (~13px) — primarily desktop-deployed tools

### Future (Track B)
- **HealthStream/CloudCME API:** Investigate programmatic pre-population of CE activity applications
- **Institutional hosting:** Migrate to Maizey or equivalent with institutional API key
- **IP committee roster:** Simple opt-in/directory for OCME&LL to reduce IP planning friction
- **Regenerate confirmation:** Extend beyond gap textarea to cover all edited fields

---

*Michigan Medicine · Office of CME & Lifelong Learning · OCME&LL*  
*Specification v3.0 · March 2026*
