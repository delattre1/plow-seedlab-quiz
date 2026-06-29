# plow-seedlab-quiz — a multiple-choice SEED

A small **example of a seed**: a single Markdown file
([`quiz.seed.md`](quiz.seed.md)) that your AI coding agent reads and turns into a working
app — an offline 5-question multiple-choice quiz with Next/Previous navigation, remembered
answers, scoring, and restart.

There is **no app code in this repo to copy.** The seed is a *spec* (intent + contracts +
acceptance tests). You hand it to an agent, the agent **generates** the `quiz.html` from
scratch, and it self-verifies the result. That "idea → prompt → working software" round-trip
*is* the point.

This one shows a seed where part of the spec is **fixed data** — the five questions and
their correct answers live in the contract (like a formula), so the score is a hard,
checkable fact. The generativity is in the quiz **engine** the agent builds around them:
rendering, single-select, navigation, remembered answers, and scoring.

> **What's a seed?** A portable, agent-readable spec for "what a system should be." A
> capable agent on a fresh machine reads it and is responsible for reaching the **Done**
> state. The seed is the artifact; the running app is the proof. (Full method:
> [seedlab](https://github.com/plow-pbc/seedlab).)

---

## Run this yourself (≈3 minutes)

You need: a coding agent (Claude Code, Codex, Cursor, or any agent that can read a file,
write a file, and run a command) and a web browser. No accounts, no API keys, no services.

1. **Get the seed.**
   ```bash
   git clone https://github.com/delattre1/plow-seedlab-quiz.git
   cd plow-seedlab-quiz
   ```

2. **Point your agent at it.** Start your agent in that folder and give it one instruction:
   > Read `quiz.seed.md` and execute it to its `## Done`, then run its `## Verify` and report
   > the result.

   The agent generates `quiz.html` and runs the acceptance tests. When it finishes it prints
   `SEED_RESULT=DONE`.

3. **Open the app.** Double-click the generated `quiz.html` (or `open quiz.html` on macOS).
   It runs entirely offline.

4. **See it work.** Answer the five questions, move back and forth (your picks are
   remembered), hit **Submit**, and see your score out of 5. **Restart** clears it.

That's the whole loop: you gave an idea-as-spec to *your* agent, on *your* machine, and it
brought working software into reality — and proved it.

---

## What "it works" means (the deterministic gate)

The seed ships its own acceptance test. The agent isn't trusted to *say* it's done — the
`## Verify` harness drives the real rendered page and checks the engine against the fixed
question bank:

| # | scenario | check |
|---|---|---|
| 1 | initial render | question 0, 5 total, options a–d, nothing selected, result hidden |
| 2 | navigation | Next/Prev clamp to `[0, 4]` |
| 3 | selection persists | a pick survives navigating away and back |
| 4 | all correct | submit → score **5 / 5** |
| 5 | mixed answers | submit → exact score (e.g. **3**) |
| 6 | unanswered | blanks count as wrong → score reflects only correct picks |
| 7 | restart | back to question 0, selections cleared, result hidden |

If all seven pass, the seed is proven for your agent.

---

## Why this is a *seed*, not a code template

- **Zero pre-baked engine.** Open the seed — there's no HTML/CSS/JS to paste. The questions
  are fixed *data*; the agent writes the quiz engine (render, select, navigate, remember,
  score) from the contracts. A paste-artifact reproduces one frozen build; a seed
  *regenerates* the software.
- **Self-verifying.** "Done" is a passing acceptance test over the real running page,
  including the exact score for a known set of answers.
- **Portable.** No server, no framework, no network. One file that runs by double-clicking,
  offline, forever.

## Proof

This seed was proven the seedlab way before publishing: a **fresh, blind agent** (clean
context, given only the seed) generated the app from zero and passed `## Verify`. See
[`proof/`](proof/).

---

*Part of the [seedlab](https://github.com/plow-pbc/seedlab) method. License: MIT.*
