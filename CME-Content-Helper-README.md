# CME Content Helper
## Michigan Medicine · Office of CME & Lifelong Learning (OCME&LL)

**Version:** 1.0 · March 2026
**Status:** Production — deployed on GitHub Pages via Cloudflare Worker proxy
**Live URL:** https://doctorhealy.github.io/cme-navigator/cme-content-helper.html
**Suite:** Tool 2 of 3 · CME Application Navigator · **CME Content Helper** · CME Submission Assistant *(planned)*
**Companion tool:** CME Application Navigator (`cme-navigator.html`) — run this first

---

## What This Tool Does

The **CME Content Helper** is an AI-powered, single-page web application that helps educational planners at Michigan Medicine write the most demanding narrative sections of a MiCME/CloudCME CME application.

A planner fills in three required fields — topic, content description, and audience — clicks **Generate Application Content**, and the tool calls the Anthropic Claude API to produce a complete set of ACCME-compliant draft content. Every output section is directly editable inline. When the planner is satisfied, a single click produces a clean, print-ready document with each section labelled by its exact CloudCME field destination.

The tool also runs a second-pass eligibility analysis that identifies MOC credit opportunities, Michigan mandatory licensing topics, IPCE recognition, ACCME Commendation criteria, and additional credit types (nursing, pharmacy, PA) — all surfaced automatically from the same inputs.

**This tool is not a submission portal.** It is a content-drafting and eligibility-identification assistant. All generated text should be reviewed and edited by the planner before submission.

---

## Project Context

This tool was built for the Michigan Medicine Office of CME & Lifelong Learning (OCME&LL) to reduce the time and uncertainty planners experience when completing the "Gap and Needs" and "Learning Outcomes" sections of a CloudCME application. It is the second tool in a planned suite of three, designed as a sibling to `cme-navigator.html` (the CME Application Navigator), sharing the same Michigan Medicine design system.

**Deployment:** The tool is hosted on GitHub Pages. The Anthropic API key is held server-side in a Cloudflare Worker proxy (`cloudflare-worker.js`) — no API key is embedded in the HTML. The tool can also run inside a Claude.ai Project, where the artifact proxy handles authentication automatically.

---

## Input Panel — What the Planner Provides

All five input areas appear on a single screen. No wizards, no multi-step flow.

### Required Fields

| Field | What to enter |
|---|---|
| **What is the topic?** | The specific clinical or educational focus (e.g., "Sepsis bundle adherence", "Acute pain management without opioids") |
| **What will be covered?** | Sessions, learning activities, format, faculty presenters, data or evidence being used |
| **Who will attend?** | See below |

**Audience selection** is structured in three layers:
- **Profession checkboxes** — Physicians, Residents/Fellows, Nurses/NPs, Physician Assistants, Pharmacists, Social Workers, Medical Students, Other HCPs
- **Physician specialty grid** — Internal Medicine, Family Medicine, Pediatrics, Emergency Medicine, Anesthesiology, Surgery, Psychiatry/Neurology, Ob/Gyn, Radiology, Other specialty. Multiple specialties can be selected simultaneously; each may independently qualify for its own board MOC credit
- **Free-text details** — for specifics like "PGY2–3 only", "mixed ED team", or "community health workers"

### Additional Input Fields

| Field | Purpose |
|---|---|
| **Activity format** | Chip-style multi-select: Lecture, Panel, Case-based discussion, Simulation/skills lab, Workshop, Online/self-paced, QI Activity, Journal Club. Drives the format justification section and informs commendation criteria analysis |
| **Is the planning committee interprofessional?** | Yes / No / Not sure. Cannot be inferred from content — determines IPCE eligibility |
| **How was the gap identified?** (optional, collapsible) | Dropdown: Quality/registry data · Prior activity evaluation · New literature/updated guidelines · Expert or faculty presenter input · Informal clinical observation · Not formally assessed. Enriches the needs assessment summary language |

### Input Panel Extras
- A **"Where each section pastes in CloudCME" reference card** is pinned below the input form so planners always know where the output goes without switching windows
- A **disclaimer banner** reminds planners that all AI-generated content is a starting point requiring review before submission
- A single **Generate Application Content** button triggers the API call

---

## Output Panel — What the AI Generates

Seven content sections are rendered in sequence after generation. Each has an inline editable text area, a copy-to-clipboard button, and a CloudCME field tag. All sections are also included in the printed output.

### Section 1 — Practice Gap *(REQUIRED in CloudCME)*
*"Why this activity is needed" → Gap and Needs → Practice Gap*

Three meaningfully different versions (A / B / C) of the practice gap statement are generated, each 2–4 sentences. The planner selects the preferred version using pill-style radio buttons; the selected text loads into an editable area below. Each version must name the target audience and frame the gap as a discrepancy between current and ideal practice. The three versions vary in framing, evidence angle, or emphasis — not just synonym swaps.

### Section 2 — Educational Need *(REQUIRED in CloudCME)*
*"What learners are missing" → Gap and Needs → Educational Needs*

The AI diagnoses the **primary need type** driving the gap — Knowledge, Competence, or Performance — and explains its reasoning in a plain-language "Why this need type?" box. A secondary need is only added if the activity genuinely spans two domains; three needs are never generated. Each need block is colour-coded and labelled with its CloudCME field mapping:

- **Knowledge** (blue) → CloudCME: Knowledge
- **Competence** (green) → CloudCME: Skill / Strategy
- **Performance** (amber) → CloudCME: Performance

The distinction matters for ACCME: Knowledge means learners are unaware of current evidence; Competence means they know but can't yet apply it; Performance means they can apply it but aren't doing so consistently in actual practice.

### Section 3 — Expected Results *(REQUIRED in CloudCME)*
*"What will change after this activity" → Gap and Needs → Expected Results*

A 2–3 sentence statement of what the activity is designed to produce. ACCME requires CME to extend beyond knowledge acquisition, so this section always addresses competence (what participants will be able to do), adds performance where plausible (what they will routinely do in practice), and patient outcomes only where genuinely achievable.

### Section 4 — Educational Format Justification
*"Why this format works" → Gap and Needs → Educational Format*

A 2–3 sentence explanation of why the chosen format(s) are appropriate for the identified gap and learner need. References the specific formats selected in the input panel (e.g., explains why simulation is appropriate for a procedural skills gap, or why case-based discussion suits a competence-level need).

### Section 5 — Learning Objectives *(REQUIRED in CloudCME)*
*"What learners will be able to do" → Learning Outcomes & Competencies → Learning Objectives*

3–4 measurable objectives, each beginning with a Bloom's taxonomy action verb matched to the diagnosed need type:
- Knowledge level: identify, describe, explain, define, discuss
- Competence level: apply, demonstrate, select, interpret, calculate
- Performance level: implement, manage, evaluate, integrate

Format: *"At the conclusion of this activity, participants will be able to: [verb] [specific observable behaviour]"*

"Understand" and "appreciate" are never used — they are not measurable. Each objective is a **checkbox row** — unchecked objectives are visually dimmed and excluded from the printed output. All objectives are inline-editable. A **Copy all** button copies the full formatted list (checked objectives only) to clipboard.

### Section 6 — Competency Frameworks Addressed
*"Competency frameworks addressed" → Learning Outcomes → Competencies*

Identifies which competencies the activity genuinely addresses across three nationally recognised frameworks, displayed as colour-coded chips:

- **ACGME / ABMS** (blue) — Patient Care, Medical Knowledge, Practice-Based Learning and Improvement, Interpersonal and Communication Skills, Professionalism, Systems-Based Practice
- **IOM** (green) — Provide Patient-Centered Care, Work in Interdisciplinary Teams, Employ Evidence-Based Practice, Apply Quality Improvement, Utilize Informatics
- **IPEC** (purple) — Values and Ethics, Roles and Responsibilities, Interprofessional Communication, Teams and Teamwork

The AI selects only genuinely applicable competencies (2–4 per framework). Selecting all is always marked as incorrect in the prompt. This section renders only when at least one competency is identified.

### Section 7 — Needs Assessment Summary
*"One-paragraph summary" → Gap and Needs → Needs Assessment → Summary of findings*

A single ready-to-paste paragraph (3–5 sentences) synthesising the gap, the primary educational need, how the gap was identified (using the optional gap source field if provided), and what change the activity is designed to produce. Satisfies ACCME's requirement that CME activities be based on documented identified needs.

---

## Eligibility Review Panel — AI Analysis of the Full Activity

A separate gold-bordered panel rendered below the content sections. This is not part of the CloudCME narrative fields — it is an advisory analysis to help planners identify everything the activity may additionally qualify for before submitting. Each item includes a rationale, specific requirements or next steps, and a flag to OCME&LL.

### Board Certification Credit (MOC)
Evaluates each physician specialty selected in the audience grid against their respective board's MOC requirements. A single activity can offer MOC credit for multiple specialties simultaneously. Includes board-specific requirements (e.g., ABIM's pre/post knowledge assessment requirement). Only boards where that specialty is genuinely in the audience are included.

### Michigan Mandatory Licensing Topics
Flags if the activity genuinely and substantively covers any of Michigan's physician licensing requirements:
- Medical ethics (min 1 hour per 3-year cycle)
- Pain & symptom management (min 3 hours per cycle, including 1 hour on controlled substances)
- Implicit bias training (1 hour per year of license cycle)
- Opioid / controlled substance prescribing (required every renewal for prescribers)
- Human trafficking identification (one-time requirement)

Topics are only flagged if the activity content explicitly covers them — tangential relevance does not qualify.

### Interprofessional Continuing Education (IPCE)
Applies when all three criteria are met: planning committee is interprofessional, faculty presenters are interprofessional, and the activity is designed to improve how the healthcare team works together. Michigan Medicine is building toward Joint Accreditation; qualifying activities are tracked and contribute to that portfolio.

### ACCME Commendation Criteria (C23–C38)
Identifies which of the 16 commendation criteria may apply, with confidence level (Likely / Possibly), a rationale tied to the specific activity content, and concrete steps for the planner to take. Criteria assessed include interprofessional team involvement, use of real health/practice data, health equity content, communication or procedural skills training with formative feedback, QI linkage, and demonstrated patient outcomes, among others. Each qualifying criterion contributes evidence to Michigan Medicine's Accreditation with Commendation portfolio.

### Additional Credit Types
Flags ANCC Contact Hours (if nurses attend), ACPE Credit (if pharmacists attend), and AAPA Category 1 (if PAs attend). Notes that these require Joint Accreditation status, which OCME&LL is actively pursuing.

---

## Contextual Tooltips

Every section heading in the output panel includes an **ⓘ tooltip button** that opens a brief, plain-English explanation of what the ACCME term means and what makes a strong response. Tooltips are positioned dynamically (above or below based on viewport space) and close on any outside click. Tooltips are also present on the interprofessional planning question and the gap source expander in the input panel.

---

## CloudCME Field Mapping

| Output Section | CloudCME Field Path |
|---|---|
| Practice Gap | Gap and Needs → Practice Gap |
| Educational Need (primary) | Gap and Needs → Educational Needs → Knowledge *or* Skill/Strategy *or* Performance |
| Educational Need (secondary) | Gap and Needs → Educational Needs → second type if applicable |
| Expected Results | Gap and Needs → Expected Results |
| Format Justification | Gap and Needs → Educational Format |
| Learning Objectives | Learning Outcomes & Competencies → Learning Objectives |
| Competency Frameworks | Learning Outcomes → Competencies |
| Needs Assessment Summary | Gap and Needs → Needs Assessment → Summary of findings |
| Eligibility Review | Advisory only — informs selections elsewhere in CloudCME; flag to OCME&LL at submission |

---

## Print / Save as PDF

Clicking **Print / Save PDF** (available at the top and bottom of the output panel) opens a print-formatted page in a new browser window with:

- Michigan Medicine / OCME&LL branding header and generation date
- Activity summary block (topic, audience, format) in Michigan Blue
- All seven content sections, each with its ACCME term and CloudCME field path in subtext
- Learning objectives as a numbered list (checked objectives only)
- Competency chips as labelled badge rows
- Eligibility review (MOC boards, Michigan licensing topics, Commendation criteria)
- Footer: *"Generated by CME Content Helper · Michigan Medicine OCME&LL · Review and edit before submitting to MiCME."*

The print window includes a **Print / Save as PDF** button and a **Close** button. Print styles suppress all UI chrome; section headings use Michigan Blue with a Maize rule.

---

## Regenerate & Workflow

- **Regenerate** button re-runs the full API call with the same inputs, producing a fresh set of variations across all sections
- The planner can edit inputs and regenerate as many times as needed
- Edits made to text areas are preserved in state until the next Regenerate
- There is no auto-save — the print/PDF output is the intended export mechanism

---

## Technical Architecture

| Attribute | Detail |
|---|---|
| **Delivery format** | Single self-contained `.html` file |
| **Framework** | Pure vanilla JavaScript — no build step, no npm, no bundler |
| **CSS** | Inline `<style>` tag using CSS custom properties (Michigan Medicine design tokens) |
| **JavaScript** | Inline `<script>` tag — all logic in one place |
| **External dependency** | Google Fonts: Nunito Sans `wght@400;600;700;800` (loaded via `<link>`) |
| **AI model** | `claude-sonnet-4-20250514` |
| **API endpoint** | `https://api.anthropic.com/v1/messages` |
| **API call pattern** | Single synchronous call per generation; structured JSON response |
| **Max tokens** | 3,500 |
| **API key** | Injected by Claude.ai artifact proxy — not embedded in HTML |
| **Data storage** | None — fully stateless, no server, no database |
| **Browser support** | Any modern browser (Chrome, Firefox, Safari, Edge) |

### API Response Structure

The system prompt requires Claude to return only a valid JSON object with no preamble or markdown fences:

```json
{
  "practiceGap": ["option A", "option B", "option C"],
  "educationalNeeds": {
    "primaryType": "Knowledge | Competence | Performance",
    "reasoning": "one plain-language sentence",
    "primaryText": "2-3 sentence description",
    "secondaryType": "Knowledge | Competence | Performance | null",
    "secondaryText": "2-3 sentences or null"
  },
  "expectedResults": "2-3 sentence paragraph",
  "formatJustification": "2-3 sentence paragraph",
  "learningObjectives": ["objective 1", "objective 2", "objective 3", "objective 4"],
  "competencies": {
    "acgme": ["selected competencies"],
    "iom": ["selected competencies"],
    "ipec": ["selected competencies"]
  },
  "needsAssessmentSummary": "3-5 sentence paragraph",
  "eligibility": {
    "moc": [{ "board": "...", "applies": true, "rationale": "...", "requirements": [], "flag": "..." }],
    "michiganTopics": [{ "topic": "...", "applies": true, "rationale": "...", "requirement": "...", "flag": "..." }],
    "commendation": [{ "code": "C##", "title": "...", "confidence": "high|possible", "rationale": "...", "steps": [] }],
    "ipce": { "applies": true, "rationale": "...", "steps": [] },
    "otherCredits": [{ "name": "...", "applies": true, "rationale": "...", "flag": "..." }]
  }
}
```

### Error Handling
- JSON parse failure → friendly error message with **Try Again** button
- Network/API error → error message with error detail and **Try Again** button
- Partial JSON → app attempts to use any sections that parsed successfully

### State Object
All application state is held in a single `var state` object in memory:
```javascript
var state = {
  status: "idle | loading | done | error",
  results: null,       // raw parsed JSON from API
  selected: { ... },  // planner's selections and edits
  errorMessage: null
};
```

---

## Design System

Inherits the Michigan Medicine design language from `cme-navigator.html`. The two tools are visual siblings and should feel like a matched set.

### Colour Tokens
```css
--michigan-blue:   #00274C;   /* primary brand, header, buttons */
--michigan-maize:  #FFCB05;   /* accent stripe, section rules */
--arboretum-blue:  #2F65A7;   /* interactive elements, links, labels */
--text-primary:    #00274C;
--text-secondary:  #4a6785;
--text-muted:      #7a96b0;
--border-light:    #d0d9e3;
--border-mid:      #a8bdd4;
--bg-main:         #f0f2f5;   /* page background */
--bg-card:         #ffffff;   /* card/panel background */
--bg-blue-tint:    #eef2f7;   /* subtle blue fill */
```

### Typography
- Font: **Nunito Sans** (Google Fonts) — weights 400, 600, 700, 800
- Fallback: Arial, sans-serif

### Layout
- **Desktop (>820px):** Two-column — input panel 35% / output panel 65%, max-width 1280px, centred
- **Mobile (≤820px):** Single column, input stacked above output
- **Header:** Two-stripe pattern — Maize strip ("Michigan Medicine · University of Michigan") above Michigan Blue bar ("CME Content Helper" left, "OCME&LL" right in Maize)

### Component Patterns
- Cards: `background:#fff; border-radius:14px; padding:20px; box-shadow:0 1px 4px rgba(0,0,0,0.07)`
- Section titles: 14px, weight 800, Michigan Blue, underlined with 2.5px Maize rule
- ACCME term tags: 10px, italic, muted — appear alongside section title
- CloudCME field tags: 10px, "Pastes into →" prefix, muted
- Editable areas: look like read-only text until clicked; focus state adds Arboretum Blue border
- Fade-up animation on content reveal: `opacity 0→1, translateY 8px→0, 0.25s ease`
- Check tiles and chips: border-toggle selection pattern consistent with navigator
- Eligibility panel: gold top border (`border-top: 4px solid var(--michigan-maize)`) to visually distinguish it from content sections

---

## Files in This Project

| File | Description | Status |
|---|---|---|
| `cme-content-helper.html` | **This tool** — fully functional single-file web app | Production |
| `cme-navigator.html` | CME Application Navigator (Tool 1) — source of truth for the shared design system, CSS patterns, print architecture, and Michigan Medicine branding | Production |
| `cloudflare-worker.js` | Anthropic API proxy — holds the API key server-side, restricts origin to GitHub Pages | Production |
| `CME-Content-Helper-README.md` | This document | Current |
| `cme-content-helper-spec.md` | Master specification (v3.0). The implemented app extends beyond the original spec in several areas: richer eligibility review, format justification section, competency framework mapping, educational need reasoning box. Use the HTML and this README as the source of truth for current behaviour |  Current |

---

## How to Run

### GitHub Pages (primary deployment)
Visit **https://doctorhealy.github.io/cme-navigator/cme-content-helper.html** — no installation or account required. API calls are routed through the Cloudflare Worker proxy; the Anthropic API key is held server-side.

### Inside Claude.ai (alternative)
1. Upload `cme-content-helper.html` to a Claude.ai Project
2. Open the file as an artifact — the Claude.ai proxy handles authentication automatically
3. No additional configuration required

### Local development
1. Open `cme-content-helper.html` in any modern browser — the UI renders fully
2. AI generation will fail without a proxy; either point the fetch URL at the Cloudflare Worker or add `"x-api-key": "sk-ant-..."` directly for local testing only (never commit a key)

---

## Scope & Intentional Limitations

**Generates content for:**
- Practice Gap (3 options)
- Educational Need (primary + optional secondary, with reasoning)
- Expected Results
- Educational Format Justification
- Learning Objectives (3–4, checkable)
- Competency Framework mapping (ACGME/ABMS, IOM, IPEC)
- Needs Assessment Summary
- Eligibility review (MOC, Michigan licensing, IPCE, Commendation, other credits)

**Does not:**
- Handle credit type selection, application routing, or submission (use `cme-navigator.html`)
- Submit anything to MiCME or CloudCME
- Store planner data — fully stateless, nothing is sent anywhere except the Anthropic API call
- Replace OCME&LL staff review — all applications are reviewed by OCME&LL on submission

---

## Content Quality Standards

The system prompt enforces specific quality requirements. The AI is instructed to generate content that would pass OCME&LL review — not generic boilerplate.

**Practice Gap**
- ✅ *"Internal medicine residents at Michigan Medicine frequently manage sepsis without consistent adherence to the 1-hour bundle, despite strong evidence that early intervention reduces mortality. Institutional audit data indicate bundle compliance rates below 60% in the ED. This activity seeks to close the gap between current practice and evidence-based sepsis management."*
- ❌ *"There is a gap in knowledge about this topic among healthcare professionals."*

**Learning Objectives**
- ✅ *"Apply the SEP-1 sepsis bundle protocol to correctly sequence interventions within the first hour of sepsis recognition"*
- ❌ *"Understand the importance of sepsis management"* (not measurable)

**Educational Need**
- Must diagnose the root cause of the gap, not restate it
- Must name the audience and topic explicitly
- Competence need: what specifically they cannot yet do in a clinical scenario
- Performance need: what specifically they are not doing consistently in actual practice

---

*Michigan Medicine · Office of CME & Lifelong Learning · OCME&LL*
*March 2026*
