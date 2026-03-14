# CME Tools Reference Document
## Michigan Medicine · Office of CME & Lifelong Learning
**Last updated:** March 2026  
**Covers:** CME Credit Application Navigator · CME Content Helper  
**Status:** Both tools in active testing  

---

## 1. What These Tools Are

Two companion HTML files that together support the complete CME application workflow at Michigan Medicine. Both run as artifacts inside Claude.ai — they require no installation, no server, and no technical setup. Each planner downloads the file, attaches it to a Claude.ai chat, and the tool opens immediately.

### CME Credit Application Navigator (`cme-navigator.html`)
A **pre-application decision tool**. The planner answers a structured sequence of questions about their activity and receives a complete picture of: which application type to submit, every credit type the activity qualifies for, board certification (MOC) requirements, Michigan mandatory licensing topics, and which ACCME Commendation criteria apply. Produces two printable supporting documents — a Planner Preparation Checklist and an OCME Staff Build Brief.

**When to use it:** Before submitting a MiCME application. Typically 5–10 minutes to complete.

### CME Content Helper (`cme-content-helper.html`)
An **in-application content generation tool**. The planner describes their topic, content, and audience; the AI suggests professional, ACCME-compliant language for every required section of the CloudCME application. Also performs a holistic eligibility review covering MOC, Michigan mandatory topics, IPCE, ACCME Commendation criteria, and additional credit types.

**When to use it:** While completing the MiCME/CloudCME application. Generates content the planner reviews, edits, and pastes directly into CloudCME.

### How they relate
The Navigator answers *"what do I need to do and apply for?"*  
The Content Helper answers *"how do I write it?"*  

They share the same design system, terminology, and understanding of ACCME requirements. A planner would typically use the Navigator first, then the Content Helper while completing the application.

---

## 2. What We Learned — Key Design Decisions

These are decisions that emerged from building the tools and reviewing real applications. They are not obvious from the ACCME documentation and are worth preserving explicitly.

### 2a. Educational needs: diagnostic, not checklist
ACCME requires that the educational need underlying the practice gap be identified — but does not require all three types (knowledge, competence, performance) to be described. The knowledge/competence/performance framework is a **diagnostic tool**, not a taxonomy to be populated.

**The right question is:** Why does this gap exist?
- Gap exists because evidence is new or learners are unaware → **Knowledge need** (primary type for most knowledge-update activities: symposia, grand rounds, lectures on new guidelines)
- Gap exists because learners know the evidence but struggle to apply it → **Competence need** (typical for simulation, case-based workshops, procedural skills)
- Gap exists because learners can do it but don't do it consistently → **Performance need** (typical for QI-linked activities, audit-driven, bundle adherence)

Most activities have one dominant need type. Only surface a secondary need if the activity genuinely spans two domains. **Never generate all three** — that is always an error and was a major problem in real applications reviewed during development.

### 2b. Barriers to learning: not required
Barriers appear as an optional field in CloudCME and were historically encouraged as good educational design practice, but **ACCME's Standards for Integrity and Independence do not require them**. Including barriers in generated output adds length and complexity without adding compliance value. The Content Helper does not generate barriers. The Navigator does not reference them in the application checklist.

### 2c. Expected results: must extend beyond knowledge
ACCME requires that expected results (what the activity is designed to change) go beyond simply imparting knowledge. Every activity must describe change in at least **competence** (what learners will be able to do). Performance (what they will do in practice) and patient outcomes should only be included if genuinely plausible for the activity. Be conservative and specific — no vague aspirational language.

### 2d. MOC: a single activity can offer multiple board credits simultaneously
A single CME activity can be registered for MOC credit with multiple certifying boards at once. If physicians from multiple specialties attend, each relevant board credit can be designated. This is standard practice — the ACR, for example, routinely offers both ABIM and ABP MOC credit on the same activity.

**Implication for tools:** Both tools use multi-select for physician specialties, not a single "primary specialty" dropdown. The Navigator and Content Helper both surface MOC credit for all selected specialties.

### 2e. IPCE: three requirements, all mandatory
For an activity to qualify as Interprofessional Continuing Education (IPCE), all three of the following must be true — not just one or two:

1. **Planning committee** includes members from two or more health professions (representative of the target audience)
2. **Faculty presenters** include members from two or more professions (representative of the target audience)
3. **Activity is designed** to change the competence and/or performance of the healthcare team — not just individual clinicians

Planning collaboration alone does not satisfy this criterion. The interprofessional involvement must extend to who delivers the content on the day.

Source: ACCME "Engages Teams" criterion, Critical Elements. Verified at accme.org/rule/engages-teams/

### 2f. ACCME Commendation is institutional, not activity-level
ACCME Accreditation with Commendation is awarded to the **institution** (Michigan Medicine's Office of CME & Lifelong Learning) at reaccreditation — not to individual activities. Individual activities are never "commended." What they do is **contribute evidence** to the institutional portfolio.

To qualify, the institution must demonstrate compliance with 8 of 16 commendation criteria (C23–C38), including at least one from the Achieves Outcomes category (C36, C37, or C38).

**Implication for language:** Never say an activity "qualifies for Commendation" or "earns Commendation." Say it "contributes to Michigan Medicine's Accreditation with Commendation portfolio" or "flags opportunities that contribute to the institutional Commendation evidence base."

### 2g. Objectives: verb level must match the need type
Learning objectives must use action verbs calibrated to the primary educational need type:
- **Knowledge need** → identify, describe, explain, define, discuss, summarise
- **Competence need** → apply, demonstrate, select, interpret, use, calculate
- **Performance need** → implement, manage, conduct, evaluate, integrate

**Never use** "understand" or "appreciate" — these are not measurable and are explicitly discouraged by ACCME. Objectives must be specific and observable.

Generate 3–4 objectives for most activities, not 5. Quality over quantity.

### 2h. Competencies: selective, not comprehensive
ACGME/ABMS, IOM, and IPEC competency frameworks must be applied selectively — only competencies the activity **genuinely addresses**. Listing all competencies is always incorrect. Typical selections:
- Knowledge-update lecture: Medical Knowledge (ACGME), Employ Evidence-Based Practice (IOM)
- QI/performance improvement: Practice-Based Learning and Improvement (ACGME), Apply Quality Improvement (IOM)
- Interprofessional activity: add IPEC competencies (Values and Ethics, Teams and Teamwork, etc.)
- Procedural/simulation: add Patient Care (ACGME)

2–4 per framework is usually right.

---

## 3. Design Principles

These principles apply to both tools and should guide any future modifications.

### Plain English first, ACCME terms in brackets
Every label, section heading, and explanation leads with plain language. ACCME terminology appears in smaller secondary text or in parentheses. A planner unfamiliar with ACCME should be able to use the tool without a glossary.

Examples:
- ✓ "Why this activity is needed *(practice gap)*"
- ✗ "Practice Gap"
- ✓ "What learners are missing *(educational need)*"
- ✗ "Educational Needs"

### The AI suggests, not writes
All AI-generated content is explicitly presented as a starting point requiring planner review and editing. The phrase "AI suggests" is used consistently — not "AI writes" or "AI generates." This sets appropriate expectations and emphasises planner ownership.

The disclaimer in the Content Helper: *"AI-generated content requires review. All text is a starting point only. Educational planners must review, verify, and edit all sections before submission."*

### Faculty presenters, not faculty
"Faculty" is ambiguous in an academic medical centre context — faculty have many roles. The term "faculty presenters" is used consistently in both tools to mean people who present or facilitate educational content in the activity.

### Required vs optional: be explicit
ACCME-required fields are marked with a REQUIRED badge. Optional sections that add value are offered but not foregrounded. The tool should help planners complete what is needed without creating the impression that optional enhancements are mandatory.

### Tooltips everywhere unfamiliar language appears
Any term a planner unfamiliar with medical education or ACCME standards might not know gets a ⓘ tooltip. This includes: practice gap, educational need types, expected results, educational format justification, learning objectives, competency frameworks, needs assessment summary, MOC, Michigan mandatory topics, IPCE, ACCME Commendation criteria, ANCC, ACPE, AAPA.

Tooltip content:
- Opens on click, closes on click elsewhere or on another tooltip
- Uses `position:fixed` in the Content Helper (prevents clipping by cards below)
- Dark background (#1e293b), white text, Michigan Maize accent headings
- Always includes a plain-English explanation, not just a definition

### Copy buttons on all generated text
Every editable text section in the Content Helper has a copy-to-clipboard button that:
- Is invisible until hover (unobtrusive)
- Appears as a small clipboard icon in the top-right corner of the text area
- Turns green with a checkmark for 2 seconds on successful copy
- Falls back to `execCommand("copy")` if clipboard API is unavailable

Learning objectives use a single "Copy all" button that copies all checked objectives as a numbered list with the standard preamble.

The Navigator has copy buttons on "FLAG TO OCME&LL" sections in the Credits and Board tabs.

### Michigan Medicine branding — identical across both tools
```
Header top stripe:  background #FFCB05 (Michigan Maize), right-aligned
                    "Michigan Medicine · University of Michigan"
                    11px, weight 700, color #00274C

Header main bar:    background #00274C (Michigan Blue)
                    Tool name: 15px, weight 800, white, left
                    "OCME&LL": 12px, weight 700, Michigan Maize, right
                    Purpose subtitle: 12px, rgba(255,255,255,0.7), below title
```

CSS variables (identical in both files):
```css
--michigan-blue:   #00274C
--michigan-maize:  #FFCB05
--arboretum-blue:  #2F65A7
--text-primary:    #00274C
--text-secondary:  #4a6785
--text-muted:      #7a96b0
--border-light:    #d0d9e3
--border-mid:      #a8bdd4
--bg-main:         #f0f2f5
--bg-card:         #ffffff
--bg-blue-tint:    #eef2f7
```

Font: Nunito Sans, loaded via Google Fonts (wght 400, 600, 700, 800)

---

## 4. Content Helper — Current Sections

The Content Helper generates the following sections from a single Anthropic API call (claude-sonnet-4-20250514, max_tokens 3500).

### Input fields
| Field | Type | Required |
|---|---|---|
| Topic | Free text | Yes |
| Content and sessions | Free text | Yes |
| Professions attending | Multi-select checklist | Yes (at least one) |
| Physician specialties | Multi-select checklist | Optional (drives MOC) |
| Audience specifics | Free text | Optional |
| Activity format | Chip multi-select | Optional (improves output) |
| Interprofessional planning? | Yes/No radio | Optional (drives IPCE) |
| How was the gap identified? | Dropdown | Optional (improves needs assessment) |

### Generated application content sections
1. **Why this activity is needed** *(practice gap)* — three meaningfully different versions (A/B/C), planner selects one and edits
2. **What learners are missing** *(educational need)* — AI diagnoses primary type (Knowledge/Competence/Performance), generates primary text with reasoning, adds secondary only if genuinely needed
3. **What will change after this activity** *(expected results)* — competence always; performance and patient outcomes only if plausible
4. **Why this format works** *(educational format justification)* — names the format(s) and explains the fit to the learning goal
5. **What learners will be able to do** *(learning objectives)* — 3–4 objectives with checkboxes; "Copy all" button
6. **Competency frameworks addressed** *(ACGME/ABMS, IOM, IPEC)* — AI selects only genuinely applicable competencies
7. **One-paragraph summary** *(needs assessment summary)* — ready to paste into CloudCME

### Eligibility review section
Separately generated by the AI from holistic reading of the entire activity description:

- **Board Certification Credit (MOC)** — all applicable boards for selected specialties, with specific requirements per board (e.g. ABIM requires pre/post assessment, not satisfaction survey alone)
- **Michigan Mandatory Licensing Topics** — ethics, pain/symptom management, implicit bias, opioid prescribing, human trafficking — only flagged when content genuinely covers the topic
- **IPCE** — applied only when multi-profession audience AND interprofessional planning confirmed
- **ACCME Commendation Criteria** — AI identifies applicable criteria (C23–C38) with rationale tied to specific activity content and concrete steps for the planner
- **Additional credits** — ANCC Contact Hours (nurses), ACPE (pharmacists), AAPA Category 1 (PAs)

### CloudCME field mapping
| Tool section | CloudCME location |
|---|---|
| Practice gap | Gap and Needs → Practice Gap |
| Educational need | Gap and Needs → Educational Needs |
| Expected results | Gap and Needs → Expected Results |
| Format justification | Gap and Needs → Educational Format |
| Learning objectives | Learning Outcomes & Competencies → Learning Objectives |
| Competencies | Learning Outcomes & Competencies → Competencies |
| Needs assessment summary | Gap and Needs → Needs Assessment → Summary of findings |

---

## 5. Navigator — Current Structure

The Navigator uses a sequential wizard (one question per screen, progress bar) followed by a tabbed results view.

### Questions (in order)
1. What kind of activity is this? (single / repeated / RSS)
2. How will people attend? (in person / virtual / hybrid / enduring)
3. Which hybrid components apply? (shown only if hybrid)
4. What kind of learning environment? (multi-select: lecture, workshop, simulation, PI, self-assessment)
5. Which physician specialties will attend? (multi-select — drives MOC)
6. Which professional groups will attend? (multi-select — drives IPCE, ANCC, ACPE, AAPA)
7. What will this activity cover? (multi-select — drives commendation, Michigan topics, PI CME)
8. What is the activity planning context? (multi-select — drives IPCE, joint providership, commendation)
9. What evaluation is planned? (single — drives MOC eval warning, commendation)
10. Does it cover any Michigan mandatory topics? (multi-select)
11. Will there be follow-up support? (single)

### Results tabs
- **Application** — application type, hybrid notes, flags, application checklist
- **Credits** — IPCE, ANCC, ACPE, AAPA, joint providership, AMA PRA Category 1
- **Board** — MOC credit(s) for all selected specialties with specific requirements
- **Commendation** — matched C23–C38 criteria
- **Michigan** — mandatory licensing topics
- **Export** — two printable supporting documents (Planner Preparation Checklist, OCME Staff Build Brief)

---

## 6. Technical Architecture

### Deployment model
Both tools run as **Claude.ai artifacts**. The Anthropic API key is injected automatically by the Claude.ai environment — no key is embedded in the HTML files. This is the only deployment model that currently works without a backend server.

### How to share with planners (current testing workflow)
1. Download the `.html` file
2. Attach the file to a Claude.ai chat
3. Ask Claude to "open this as an artifact"
4. The tool opens and functions fully

### Why the tool cannot currently live on a public website
The Content Helper makes live calls to `api.anthropic.com/v1/messages`. This requires an API key. Outside Claude.ai, there is no key injected, so all API calls fail. The Navigator does not make API calls (it is purely client-side logic) and **can** be hosted publicly with no changes.

### Path to public web hosting for the Content Helper
A thin backend proxy is required — a small server that:
1. Receives the planner's inputs from the browser
2. Adds the Anthropic API key (stored securely on the server)
3. Forwards the request to Anthropic
4. Returns the response to the browser

This is approximately 30 lines of Node.js or Python. The frontend HTML changes only the API call URL (from `api.anthropic.com` to your own endpoint). Options:
- Vercel or AWS Lambda serverless function (low cost, ~$20–50/month at typical CME office volume)
- Michigan Medicine IT-hosted endpoint if an enterprise Anthropic agreement exists

### File structure
Both tools are single HTML files — all CSS, JavaScript, and content inline. No external dependencies except Google Fonts (loaded via `<link>` tag). No build step, no framework, no package manager.

### AI model and parameters
```javascript
model: "claude-sonnet-4-20250514"
max_tokens: 3500  // Content Helper (larger due to eligibility review)
// Navigator makes no API calls
```

### Print / PDF generation
Both tools use `window.open()` to open a new tab containing a formatted print document, which auto-triggers `window.print()`. A Close and Print button are provided. Falls back to Blob URL if popups are blocked.

---

## 7. ACCME Requirements Reference

Key facts confirmed during development for use in both tools.

### What ACCME core accreditation requires for each activity
- Identified professional practice gap
- Educational need underlying the gap (at least one type: knowledge, competence, or performance)
- Expected results (must extend beyond knowledge — competence change at minimum)
- Learning objectives with measurable action verbs
- Appropriate educational format with justification
- Evaluation plan
- Independent from commercial influence (disclosure, conflict of interest management)

### What ACCME does NOT require
- All three need types (knowledge, competence, performance)
- Barriers to learning (optional CloudCME field)
- Five learning objectives (3–4 is appropriate for most activities)

### Michigan mandatory licensing topics (as of 2026)
| Topic | Requirement |
|---|---|
| Medical ethics | Min 1 hour per 3-year cycle |
| Pain & symptom management | Min 3 hours per cycle (incl. 1 hour on controlled substances) |
| Implicit bias training | 1 hour per year of license cycle (required since June 2021) |
| Opioid / controlled substance prescribing | Every renewal period for prescribers (required since May 2024) |
| Human trafficking identification | One-time requirement for Michigan physicians |

### MOC boards and special requirements
| Board | Requirement note |
|---|---|
| ABIM MOC Part II | Pre/post knowledge assessment required — satisfaction survey alone is not sufficient |
| ABA MOCA 2.0® | Patient Safety CME designation available separately if patient safety content included |
| ABP MOC Part II | Credits transfer automatically within 30 days of reporting |
| ABFM, ABOG, ABR, ABEM | OCME&LL handles registration; standard reporting applies |
| ABPN | Self-assessment component has additional value if included |
| ABOS / ABS / ABTS | Specify surgical subspecialties so correct board(s) are registered |

### ACCME Commendation criteria summary (C23–C38)
**Promotes Team-Based Education:** C23 (interprofessional teams plan and deliver), C24 (patient/community voice), C25 (health professions students)  
**Addresses Public Health Priorities:** C26 (uses health/practice data), C27 (population health strategies), C28 (cross-organisation collaboration)  
**Enhances Skills:** C29 (communication skills with observed feedback), C30 (procedural skills with observed feedback), C31 (individualised learning plans), C32 (post-activity support strategies)  
**Demonstrates Educational Leadership:** C33 (linked to research/scholarship), C35 (innovative educational approach)  
**Achieves Outcomes ★:** C36 (demonstrates improvement in learner performance), C37 (demonstrates healthcare quality improvement), C38 (demonstrates impact on patients/community)

At least one Achieves Outcomes criterion (C36, C37, or C38) is required as part of the institution's Commendation portfolio. This is the highest-value category.

---

## 8. Known Limitations and Next Steps

### Limitations
- **Content Helper requires Claude.ai** — cannot be shared as a public URL that works standalone; planners need a Claude.ai account
- **Navigator can be hosted publicly** — it makes no API calls and is pure client-side logic; can go on any web server as-is
- **No memory between sessions** — the Content Helper starts blank each time; planners must re-enter activity details for each session
- **Eligibility review quality depends on content description** — vague content descriptions produce generic eligibility analysis; specific descriptions produce specific, useful analysis
- **No readiness check** — the tool does not currently validate whether the generated application content meets ACCME minimum standards before printing; this was identified as a high-value next feature

### Identified next features (in priority order)
1. **Application readiness check** — a panel showing whether the generated content meets ACCME minimum standards (practice gap names audience, at least one objective at competence/performance level, expected results go beyond knowledge, etc.) before the planner prints. Reduces back-and-forth with OCME&LL staff.

2. **Backend proxy for web hosting** — enables the Content Helper to live on the Michigan Medicine website accessible to all planners without needing a Claude.ai account. ~30 lines of server code.

3. **Activity description save/restore** — browser localStorage or a shareable URL with inputs encoded, so planners don't re-enter details for recurring activities (grand rounds series, repeated courses).

4. **Navigator + Content Helper linking** — a button in the Navigator results that pre-populates the Content Helper inputs based on Navigator answers, reducing double-entry.

---

## 9. Files

| File | Description | Status |
|---|---|---|
| `cme-navigator.html` | CME Credit Application Navigator | Active — in testing |
| `cme-content-helper.html` | CME Content Helper | Active — in testing |
| `cme-tools-reference.md` | This document | Current |

Both HTML files are hosted in the Michigan Medicine OCME&LL GitHub repository and shared with planners as email attachments for testing.

---

*Michigan Medicine · Office of CME & Lifelong Learning · OCME&LL*  
*Document maintained in the CME Tools Claude Project*
