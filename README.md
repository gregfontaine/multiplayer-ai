# Human × AI Sprint

A mini-game that helps students and teams learn **how to collaborate with AI**: what to delegate, and how much to stay in the loop.

**Play:** https://gregfontaine.github.io/multiplayer-ai/

1. Pick a team (insurance mobile app, image-processing R&D, B2B sales & marketing, HR & people).
2. Drag each backlog task into one of four ways of working:
   1. **People alone**
   2. **People draft, AI reviews**
   3. **AI drafts, a person approves**
   4. **AI alone**
3. Click **Run the Sprint** and see how the week went for each task: 🌟 Perfect! · ✅ Done (無事完了) · ⚠️ Minor issue · 🚨 Incident.
4. Rearrange the tasks and run the sprint again to compare.

The game is available in English and Japanese (button in the top-right corner, or `?lang=ja` / `?lang=en` in the URL).
Each team has its own link, for example `…/multiplayer-ai/#/people-team`.

## Project structure

```
index.html              page shell
css/style.css           styles
js/config.js            game rules: the 4 ways of working, outcomes & points, interface text (EN/JA)
js/app.js               game logic and rendering
js/dnd.js               drag & drop (mouse, touch, pen)
scenarios/index.json    list of scenarios shown on the home page (in this order)
scenarios/*.json        one file per team
```

It is a static site with no build step and no dependencies. GitHub Pages serves the `main` branch as is.

## Editing scenarios

Everything about a team is in its file in `scenarios/`. Each piece of visible text has an `en` and a `ja` version.

- **Edit a scenario:** open its JSON file, change the text, commit and push.
- **Remove a scenario:** delete its id from `scenarios/index.json` (you can keep the file).
- **Add a scenario:** copy `scenarios/_template.json` to `scenarios/my-team.json`, set `"id": "my-team"` (the same as the file name), fill it in, and add `"my-team"` to `scenarios/index.json`.

### Scenario format

```jsonc
{
  "id": "my-team",                     // must match the file name and the entry in index.json
  "icon": "🚀",                        // emoji shown on the team card
  "title":       { "en": "...", "ja": "..." },
  "description": { "en": "...", "ja": "..." },
  "members": [                         // 3 to 5 members
    {
      "id": "aiko",                    // used by tasks' "owner"
      "avatar": "👩‍💼",
      "name": { "en": "Aiko Tanaka", "ja": "田中 愛子" },
      "role": { "en": "Product Owner", "ja": "プロダクトオーナー" },
      "strengths": { "en": ["...", "..."], "ja": ["...", "..."] }
    }
  ],
  "tasks": [
    {
      "id": "reply-inquiries",          // unique within the scenario
      "owner": "aiko",                  // optional: a member id
      "title":       { "en": "...", "ja": "..." },
      "description": { "en": "...", "ja": "..." },   // optional
      "outcomes": {                     // one entry per way of working — all four are required
        "human":    { "result": "done",     "comment": { "en": "...", "ja": "..." } },
        "human_ai": { "result": "perfect",  "comment": { "en": "...", "ja": "..." } },
        "ai_human": { "result": "minor",    "comment": { "en": "...", "ja": "..." } },
        "ai":       { "result": "incident", "comment": { "en": "...", "ja": "..." } }
      }
    }
  ]
}
```

| Way of working key | Meaning |
|---|---|
| `human` | People alone |
| `human_ai` | People draft, AI reviews |
| `ai_human` | AI drafts, a person approves |
| `ai` | AI alone |

| Result | Label (EN / JA) | Points |
|---|---|---|
| `perfect` | Perfect! / 大成功！ | 3 |
| `done` | Done / 無事完了 | 2 |
| `minor` | Minor issue / 小さな問題あり | 1 |
| `incident` | Incident / インシデント | 0 |

Labels, points and the four ways of working are defined in `js/config.js`.

**Tip for authors:** vary which option is best from task to task. Some tasks are best done by people alone (sensitive, relational work), and some are best done by AI alone (repetitive, well-defined, easy-to-check work). That way players learn to judge each task, not to apply one rule everywhere.

If a scenario file has a mistake (missing outcome, unknown result, unknown owner), the browser console (F12) shows a warning. If the JSON itself is invalid, the page shows an error with the file name. You can check a file with any JSON validator.

## Running locally

The page loads the scenario files with `fetch`, so it must be served over HTTP (opening `index.html` directly from disk will not work):

```bash
python -m http.server 8000
```

Then open http://localhost:8000.
