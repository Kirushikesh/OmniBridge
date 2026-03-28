# OmniBridge — Hackathon Improvement Plan (v2)

## Current State After Round 2

### What Was Done Since First Submission

| Area | Status |
|---|---|
| **Testing — Vitest setup** | ✅ Done — `vitest.config.ts`, `setup.ts`, scripts all wired up |
| **Testing — Service tests** (`gemini.test.ts`) | ✅ Done — 31 tests, **29 passing**, 2 failing (see below) |
| **Testing — Component tests** (`App.test.tsx`) | ✅ Done — 32 tests, **all passing** |
| **GCloud Deployment** | ✅ Done — Dockerfile, `nginx.conf`, `cloudbuild.yaml`, Cloud Run |
| **Package rename** | ✅ Done — `name: "omnibridge"` |

### 2 Failing Tests to Fix Immediately

These are **real bugs** in `gemini.ts` — `JSON.parse(null || "{}")` returns `{}` instead of throwing.

```
processIntent - error handling > throws a descriptive error when response text is null
processIntent - error handling > throws a descriptive error when response text is undefined
```

**Fix required in `src/services/gemini.ts`** (line 86):
```ts
// Current (broken guard):
const result = JSON.parse(response.text || "{}");

// Fixed (throws on null/undefined):
const rawText = response.text;
if (!rawText) throw new Error("Failed to process intent. Please try again.");
const result = JSON.parse(rawText);
```

---

## Score Scorecard

### First Submission Scores (69.1% overall)

| Category | Score | Status |
|---|---|---|
| **Problem Statement Alignment** | 92% ✅ | Strong — core concept is well-aligned |
| **Code Quality** | 83.75% ✅ | Good — well-structured React code |
| **Efficiency** | 80% ✅ | Good — efficient build pipeline, fast client-side |
| **Security** | 72.5% ⚠️ | API key exposed client-side, no input sanitization |
| **Accessibility** | 45% ❌ | No ARIA labels, no keyboard nav, no skip links |
| **Google Services** | 25% ❌ | Only Gemini API — no Maps, no Firebase, no Cloud services |
| **Testing** | 0% ❌ | Zero tests of any kind |

### Expected After Round 2

| Category | Before | Expected Now | Notes |
|---|---|---|---|
| **Testing** | 0% | **~70-80%** | 63 tests written, 61 passing. Coverage appears strong but the 2 bugs must be fixed. |
| **Google Services** | 25% | **~40-50%** | GCloud deployment is Google infra — partially credited |
| **Security** | 72.5% | **~72.5%** | No changes yet |
| **Accessibility** | 45% | **~45%** | No changes yet |
| **Code Quality** | 83.75% | **~83.75%** | No refactoring done yet |

---

## Priority-Ordered Remaining Work

### 🔴 CRITICAL: Fix 2 Failing Tests (5 min)

**File**: `src/services/gemini.ts` line 86

The `null | undefined` response guard is broken. `JSON.parse(null || "{}")` silently returns `{}` instead of throwing. This makes the test assertions fail, and worse: it silently swallows a real API failure state.

---

### 🔴 P0-A: Accessibility (45% → 80%+) — Biggest Remaining Gap

> [!IMPORTANT]
> This is the highest remaining scoring gap. The current App.tsx has NO ARIA attributes.

#### [MODIFY] `index.html`
- Change title from `"My Google AI Studio App"` → `"OmniBridge — Universal Intent Engine"`
- Add `<meta name="description">` tag
- Add `<link rel="preconnect">` for Google Fonts (Inter already used via CSS)
- Add skip-to-content link: `<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>`

#### [MODIFY] `src/App.tsx`
- Add `id="main"` to the `<main>` tag
- Add `aria-label` to all buttons (mic button has NO label at all)
- Add `aria-live="polite"` to the results section (dynamic content)
- Add `role="alert"` to the error message div
- Add `aria-busy={isProcessing}` to the main container
- Ensure all Lucide icons have `aria-hidden="true"` (they render as SVG)
- Add keyboard shortcut: `onKeyDown` on the form to submit on `Ctrl+Enter`

#### [MODIFY] `src/index.css`
- Add `focus-visible` styles for keyboard navigation ring
- Add `prefers-reduced-motion` media query to disable animations

---

### 🔴 P0-B: Google Services (25% → 75%+)

> [!IMPORTANT]
> GCloud deployment helps, but the evaluator specifically mentioned "Firebase, Cloud APIs". More integrations needed.

#### Strategy: 3-pronged approach (all free/minimal cost)

**1. Google Search Grounding in Gemini** ← Highest impact, zero new dependencies

**[MODIFY] `src/services/gemini.ts`**
- Add `tools: [{ googleSearch: {} }]` to the Gemini API call config
- This enables real-time grounding: emergency numbers, hospital locations become **verified facts**
- Show a "Verified via Google Search" badge in the UI when grounding returns sources

**2. Google Maps Deep Links** ← UX impact, no API key needed

**[NEW] `src/services/google-maps.ts`**
- When action type is `"map"` and payload contains an address or location, generate:
  - Navigation link: `https://www.google.com/maps/dir/?api=1&destination=<encoded>`
- The map action cards in `App.tsx` should become clickable href links to Google Maps

**3. Firebase Analytics (optional but impactful)**

**[NEW] `src/services/firebase.ts`**
- Initialize Firebase with Analytics
- Log events: `intent_processed`, `category_detected`, `action_taken`
- This directly demonstrates Firebase integration — a strong signal for the "Google Services" criterion

---

### 🟡 P1: Security (72.5% → 85%+)

#### [MODIFY] `src/services/gemini.ts`
- Add input length validation (max 5000 chars) before sending to Gemini

#### [MODIFY] `index.html`
- Add Content Security Policy meta tag:
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src https://*.googleapis.com https://*.google.com">
  ```

#### [NEW] `src/utils/sanitize.ts`
- `sanitizeInput(text: string): string` — trim, enforce max length, strip HTML tags

#### [MODIFY] `src/App.tsx`
- Use `sanitizeInput` on the textarea value before calling `processIntent`

---

### 🟢 P2: Code Quality (83.75% → 90%+)

`App.tsx` is still 333 lines (monolithic). The plan items from v1 still apply:

#### [NEW] `src/components/`
- `Header.tsx` — extract header section
- `InputPanel.tsx` — extract textarea + dropzone + buttons
- `ResultView.tsx` — extract result display

#### [NEW] `src/types/index.ts`
- Move `BridgeResult`, `BridgeAction`, `BridgeCategory` out of `gemini.ts` into a shared types file/folder.

#### [MODIFY] `package.json`
- Add `"lint": "eslint src --ext .ts,.tsx"` script
- Add `eslint` + `eslint-plugin-jsx-a11y` dev dependencies

---

### 🟢 P2: Problem Statement Alignment (92% → 95%+)

#### Make the mic button functional

The mic button is currently decorative. Implement Web Speech API:
```ts
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.onresult = (e) => setInput(e.results[0][0].transcript);
recognition.start();
```

This directly addresses the **"voice input"** requirement of the problem statement.

---

## Implementation Order (Updated)

1. **🔴 Fix 2 failing tests** (5 min)
2. **🔴 Accessibility** - ARIA + keyboard (45 min)
3. **🔴 Google Services** - Search Grounding + Maps (30 min)
4. **🟡 Security** - Input validation + CSP (20 min)
5. **🟢 Voice Input** - Web Speech API (15 min)
6. **🟢 Code Quality** - Component split (60 min)
