# SEED: quiz

> seed-format: 1

> **You are an AI agent reading this seed.** This file is a *spec*, not a script and
> not a README. Your job: run `## Steps` Step 0 (the Interview), then **generate** the
> software the spec describes, then run `## Verify` and report the verdict. When every
> `## Verify` check passes, print `SEED_RESULT=DONE`; on a blocker print
> `BLOCKED_REASON=<short reason>` and stop. Do not ask the human anything outside the
> single Interview turn.
>
> **This seed contains NO application code on purpose.** There is no HTML, CSS, or
> JavaScript to copy. You GENERATE the app from the intent + contracts below. That is
> what makes this a *seed* and not an install flow. The question bank in `## Contracts` is
> *spec data* (like a formula), not app code — embed it, but write the quiz engine, UI,
> navigation, and scoring yourself from the contracts.

---

## Goal

Produce **one self-contained file, `quiz.html`**, that a person opens by double-clicking it
(a `file://` URL — **no web server, no build step, no install, no network**). It is a
multiple-choice quiz over a fixed bank of **5 questions**, each with **4 options** and one
correct answer. The user reads the current question, picks one option, moves **Next** /
**Previous** between questions (their picks are remembered), then **Submits** to see a
**score** (how many correct out of 5) and can **Restart**. It must work fully offline in
any modern browser, forever, with nothing else installed.

This is a *seed* in the seedlab sense: an intent expressed as a spec, generated into
working software by a blind agent, and verified deterministically. The questions and
correct answers are FIXED in the contract, so "the score is right" is a hard, checkable
fact — the generativity is in the quiz engine you build around them.

---

## Done

All of these are observable and are proven by `## Verify`:

- **One file, no dependencies.** A single file `quiz.html` exists with no reference to any
  external resource — no `<script src=…>`, no `<link href=…>` to a CDN, no remote font, no
  analytics, no `fetch`/`XMLHttpRequest`. Opening it with the network fully disconnected
  behaves identically. (Inline `<style>` and inline `<script>` are expected.)
- **The five FIXED questions, in order.** The bank in `## Contracts` is used verbatim and
  in the given order (index 0 → 4). One question shows at a time.
- **Stable hooks for the current question.** A question element `id="question"` shows the
  current question text and carries `data-index="<0-based int>"` and `data-total="5"`. An
  options container `id="options"` holds exactly **4** option elements; each option's
  `class` contains `option`, it carries `data-key="a"|"b"|"c"|"d"`, shows the option text,
  and carries `aria-selected="true"|"false"` (exactly one `"true"` once the user has picked
  for this question, else all `"false"`).
- **Single-select, remembered.** Clicking an option selects it for the current question
  (and deselects any other for that question). Navigating away and back shows the same
  selection — answers are remembered per question.
- **Navigation with clamping.** Buttons `id="next"` and `id="prev"` move the current index
  by ±1, clamped to `[0, 4]` (Next at index 4 stays 4; Prev at index 0 stays 0).
- **Submit + score.** A button `id="submit"` finishes the quiz: a result element
  `id="result"` becomes visible and a score element `id="score"` carries
  `data-score="<int correct>"` and `data-total="5"`. Score = the number of questions whose
  selected option `data-key` equals the FIXED correct key. **Unanswered questions count as
  wrong.**
- **Restart.** A button `id="restart"` clears all selections, hides the result, and returns
  to question index 0.
- **`## Verify` exits 0.** The acceptance harness drives the real rendered page in a
  headless browser and every scenario passes.

---

## Contracts (build to these — they are the spec)

These are FIXED. They are the seed's contract with reality; `## Verify` enforces them.

### Element hooks (spelled EXACTLY)

| role | hook |
|---|---|
| Current question | `id="question"`, attrs `data-index="<0..4>"`, `data-total="5"`, text = question |
| Options container | `id="options"` — exactly 4 child option elements for the current question |
| One option | `class` contains `option`; `data-key="a"\|"b"\|"c"\|"d"`; `aria-selected="true"\|"false"`; text = option |
| Next / Prev | `id="next"` / `id="prev"` (buttons) |
| Submit | `id="submit"` (button) |
| Result panel | `id="result"` — hidden until submit, shown after |
| Score | `id="score"`, attrs `data-score="<int>"`, `data-total="5"` (set on submit) |
| Restart | `id="restart"` (button) |

### The question bank (FIXED — use verbatim, in this order)

Each question has options keyed `a`, `b`, `c`, `d`. The **correct** column is the answer
key `## Verify` selects to score.

| index | question | a | b | c | d | correct |
|---|---|---|---|---|---|---|
| 0 | What is 2 + 2? | 3 | 4 | 5 | 22 | `b` |
| 1 | Which planet is closest to the Sun? | Earth | Venus | Mercury | Mars | `c` |
| 2 | How many sides does a triangle have? | 2 | 3 | 4 | 5 | `b` |
| 3 | What is the capital of France? | Berlin | Madrid | Rome | Paris | `d` |
| 4 | What is 10 ÷ 2? | 2 | 4 | 5 | 20 | `c` |

Correct keys, in order: **`b, c, b, d, c`**.

### Behavior rules (FIXED)

- **Start state (load and after `restart`):** show index 0, `#result` hidden, no option
  selected on any question (`#score` has no committed value yet).
- **Select:** clicking an option in `#options` sets that option's `aria-selected="true"` and
  the other three to `"false"`, and records the chosen `data-key` as this question's answer.
  Re-clicking selects (single-select); a question has at most one selected option.
- **Navigation:** `#next` → `min(index+1, 4)`; `#prev` → `max(index-1, 0)`. On navigation,
  re-render `#question` (text + `data-index`) and `#options` (the 4 options for that index,
  with `aria-selected` reflecting the remembered pick, all `"false"` if none yet).
- **Submit:** compute `score = count of questions where the remembered answer key === the
  FIXED correct key`. Unanswered → counts as wrong. Set `#score` `data-score` and
  `data-total="5"`, and reveal `#result`.
- **Restart:** clear all remembered answers, hide `#result`, go to index 0.

### Non-negotiables (forbids)

- **No external requests of any kind.** The file is the whole app.
- **No build step / no framework install required.** Plain HTML + inline CSS + inline
  vanilla JS.
- **Do not change, reorder, or add to the question bank** — `## Verify` depends on the exact
  questions, option keys, and correct answers above.
- **`data-index`, `data-key`, `aria-selected`, `data-score`, `data-total` must always
  reflect true state** — they are how `## Verify` reads the app independent of styling.

### Design (intent, not pixels)

Make it look clean and usable — the question prominent, the four options as clearly
clickable choices, Next/Prev/Submit obvious, and a friendly result screen ("You scored 4 /
5"). Readable on a phone. Aesthetics are yours; the contracts above are not.

---

## Inputs

This seed needs **no secrets, no accounts, no external services** — that is deliberate.
The only input is where to write the file.

| name | required | default | detect | ask |
|---|---|---|---|---|
| `OUTPUT_PATH` | no | `./quiz.html` | Is a target path already given or implied by the working directory? | "Where should I write the generated app? (default `./quiz.html` in the current directory)" |

There is **no `WIRE_SAMPLE`** row: this seed crosses no system boundary. All behavior is
local and deterministic given the FIXED bank.

---

## Components

- **A modern web browser** (Chrome/Edge/Firefox/Safari) — to open and run the file.
- **The generated file** `quiz.html` — authored by you from the contracts.
- **For `## Verify` only:** a headless browser driver. Preferred: Playwright
  (`npx -y playwright@^1.6` + `npx playwright install chromium`, no project setup needed).
  Any equivalent headless-DOM tool that can load the file, click options/buttons, and read
  element attributes is acceptable — the harness drives the **real rendered page**.

---

## Steps

> Intent first, commands second. You have reasoning — adapt commands to your OS, but do not
> change the **contracts**.

### Step 0 — Interview (mandatory, the only interactive turn)

Read `## Inputs`, run each `detect`. Send the user ONE message listing what's already
satisfied and anything you need. In practice the only question is the output path, and it
has a sensible default — if the user gave you a directory or said "just build it," skip
straight to building. After this turn, run to completion or to a `BLOCKED_REASON` block.

### Step 1 — Generate the app

Author `quiz.html` at `OUTPUT_PATH` as a single self-contained file that satisfies
`## Contracts` and `## Done`:
- embed the FIXED bank (questions, options a–d, correct keys) as data;
- a render routine that, for the current index, fills `#question` (text + `data-index` +
  `data-total`) and rebuilds `#options` with 4 option elements (`data-key`, text,
  `aria-selected` from the remembered answer);
- click handlers: selecting an option records the answer and updates `aria-selected`;
  `#next`/`#prev` move the clamped index and re-render; `#submit` scores and reveals
  `#result`/`#score`; `#restart` clears answers and returns to index 0;
- render once on load (index 0, nothing selected, result hidden).

Keep it small, plain, and dependency-free. Inline the CSS and JS.

### Step 2 — Self-check against the contracts

Before running `## Verify`, sanity-read your own file: are all ids present and spelled
exactly? Do options carry `data-key` a–d and `aria-selected`? Does `#question` carry
`data-index` and `data-total="5"`? Are the 5 questions and the correct keys (`b,c,b,d,c`)
exactly as specified? Does navigation clamp? Does an unanswered question count as wrong?
Fix before verifying.

### Step 3 — Verify

Run `## Verify`. If a scenario fails, fix the generated file (never weaken the test) and
re-run until all pass. Then report `SEED_RESULT=DONE` with the verdict.

---

## Verify

**The acceptance harness drives the real rendered page in a headless browser and asserts
every scenario below. Exit code is the truth: `0` = Done, non-zero = not Done.** This is an
agent-driven check over real running state — you reason over what the actual page renders,
not over your own source.

The harness loads `quiz.html` via `file://`. To answer a question it navigates to that
index (via `#next`/`#prev` or `#restart`) and clicks the option in `#options` whose
`data-key` it wants. It reads `#question`'s `data-index`, options' `aria-selected`, and —
after clicking `#submit` — `#score`'s `data-score`/`data-total`.

Helpful primitives (write your own; this is the test contract, not the app):
- `index()`: `#question` `data-index` as an integer.
- `optionKeys()`: the `data-key`s of the 4 children of `#options` (expect `["a","b","c","d"]`).
- `selectedKey()`: the `data-key` of the option whose `aria-selected==="true"` (or null).
- `pick(key)`: click the option in `#options` with that `data-key`.
- `goto(i)`: from index 0 (restart), click `#next` until `index()===i`.
- `answerAll(keys)`: from a restart, for each i in 0..4 `goto(i)`, `pick(keys[i])`.
- `submit()` / `restart()`: click `#submit` / `#restart`.
- `score()`: `#score` `data-score` as an integer (read after submit).

### Acceptance scenarios (must ALL pass — these are the gate)

1. **Initial render.** Fresh load. `index()===0`, `#question` `data-total==="5"`,
   `optionKeys()` deep-equals `["a","b","c","d"]`, `selectedKey()===null` (nothing picked),
   and `#result` is not visible.
2. **Navigation + clamp.** From index 0: `#next` four times → `index()===4`; `#next` again →
   still `4` (clamp). `#prev` → `3`; `#prev` down to `0`; `#prev` again → still `0` (clamp).
3. **Selection persists.** Restart. At index 0 `pick("b")` → `selectedKey()==="b"`. `#next`
   to index 1, then `#prev` back to index 0 → `selectedKey()` is still `"b"`.
4. **Perfect score.** `answerAll(["b","c","b","d","c"])` (all correct), `submit()` →
   `score()===5` and `#score` `data-total==="5"`, `#result` visible.
5. **Mixed score.** Restart. `answerAll(["b","a","b","d","a"])` (Q0✓ Q1✗ Q2✓ Q3✓ Q4✗),
   `submit()` → `score()===3`.
6. **Unanswered counts wrong.** Restart. `goto(0); pick("b")` (only Q0 answered, correctly),
   leave Q1–Q4 blank, `submit()` → `score()===1`.
7. **Restart resets.** After scenario 6, `restart()` → `index()===0`, `selectedKey()===null`
   (no selection), and `#result` not visible.

A passing run prints a short line per scenario (e.g. `[4] perfect → score 5/5 ✓`) and a
final line such as `VERIFY: 7/7 scenarios passed`, then exits `0`. Any failure prints the
scenario, expected vs observed, and exits non-zero.

### Also confirm (offline / single-file, cheap greps over the generated file)

- No external resource references: the file contains no `http://`/`https://` URL in a
  `src`/`href`, no `fetch(`, no `XMLHttpRequest`, no CDN/font link.

---

## Failure modes

**Symptom: scenario 3 fails — selection forgotten after navigation.**
- Detect: `selectedKey()` is null after returning to a question you answered.
- Fix: store answers in a per-question array/map keyed by index; on render set
  `aria-selected` from the remembered key. Don't reset selections on navigation.

**Symptom: scenario 4/5/6 fails — wrong score.**
- Detect: score doesn't match the expected count.
- Fix: score = count of indices where the remembered key === the FIXED correct key
  (`b,c,b,d,c`). Unanswered indices must NOT match anything (count as wrong). Don't give
  partial credit or count blanks as correct.

**Symptom: scenario 2 fails — index runs past the ends.**
- Detect: `index()` becomes 5 or −1.
- Fix: clamp — Next is `min(index+1,4)`, Prev is `max(index-1,0)`.

**Symptom: scenario 1 fails — options not in `a,b,c,d` order or wrong count.**
- Detect: `optionKeys()` isn't `["a","b","c","d"]`.
- Fix: render exactly the 4 options for the current question in key order a→d, each with its
  `data-key`.

**Symptom: `## Verify` can't find an element / reads `null`.**
- Detect: harness throws on a selector.
- Fix: an id or attribute is misspelled. The hooks are FIXED — see `## Contracts`. Match
  `data-index`, `data-total`, `data-key`, `aria-selected`, `data-score` exactly.

---

## Cleanup

This seed writes exactly one file. To reset: delete `quiz.html` (and any throwaway
harness/`node_modules` you created for `## Verify`). Re-running the seed regenerates the app
from scratch.
