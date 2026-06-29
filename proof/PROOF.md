# Proof — plow-seedlab-quiz

A **fresh, blind agent** (clean context, given **only** `quiz.seed.md` in an
otherwise-empty directory) generated the app from zero and passed the seed's own `## Verify`
over the real rendered page.

## Result

```
VERIFY: 7/7 scenarios passed   (exit 0)
SEED_RESULT=DONE
```

- Generativity (Rule 42): the seed contains zero pasteable engine code — the five questions
  are fixed spec *data*, and the agent authored the quiz engine (render, single-select,
  navigation, remembered answers, scoring) from the contracts alone.
- Deterministic scoring: a perfect answer set → 5/5, a known mixed set → exactly 3, and
  unanswered questions count as wrong.
- Offline / single-file confirmed: no `http(s)://` in `src`/`href`, no `fetch`/
  `XMLHttpRequest`/CDN.

## Files here

- `quiz.generated.html` — the app the blind agent generated (example output).
- `verify.mjs` — the Playwright acceptance harness written from the `## Verify` contract.
- `verify-output.txt` — per-scenario pass output from an independent re-run (7/7).
- `blind-hydrate-verdict.txt` — the blind agent's final verdict.
