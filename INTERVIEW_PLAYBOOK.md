# Interview Playbook: DPS live coding session

Read this on Day 5, again on Day 13, and once more the evening before the interview.
Practise the **routine** in every project until it's automatic.

---

## 1. The day before (Thu 29 Oct): you get the repo, AI is allowed

**Goal:** the app runs, you understand it, and nothing technical can surprise you tomorrow.

- [ ] Clone it, then follow its README to run the backend **and** the frontend. Fix any setup problems **today**.
- [ ] Run the tests (`pytest`, maybe `npm test`). Note which ones exist.
- [ ] Click through every screen. Open DevTools → Network and watch which API calls each action makes.
- [ ] Use AI to explain the codebase, and write your own **1-page architecture note** (paper or a text file):
  - frontend: entry file, main components, where the state lives, where fetch calls are (`api.js`?)
  - backend: framework (FastAPI or Flask?), where the routes are, the models/schemas, the database (in-memory, JSON, SQLite?)
  - the list of API endpoints (method + URL + what they return)
  - how the frontend reaches the backend (Vite proxy? `VITE_API_URL`? CORS?)
- [ ] **Predict 5 likely changes** and try 2 of them on a throw-away branch (`git checkout -b tryout`, then `git checkout main`
  and `git branch -D tryout`). Typical ones:
  - add a field to an entity (DB → API → UI)
  - add a filter / search / sort
  - add a new endpoint + button (delete, mark as done, …)
  - add validation + show the error in the UI
  - show a derived value (count, total, average)
  - fix a small bug
- [ ] Check your setup: stable internet, screen sharing works, VS Code font size large (`Ctrl +`), notifications off,
  a terminal for the backend and one for the frontend, the browser with the app + DevTools ready.
- [ ] `git status` clean on `main`, servers start with one command each. Stop early and sleep.

---

## 2. The first 5 minutes of the call

1. **Listen to the whole task.** Don't touch the keyboard yet.
2. **Restate it in your own words:** "So users should be able to …, and it should appear …, right?"
3. **Ask clarifying questions** (pick 2–3 that matter):
   - "Where in the UI should this appear?"
   - "Should it be stored in the backend/database, or is it only frontend state?"
   - "What should happen with invalid input, e.g. empty or negative values?"
   - "Should existing data get a default value?"
   - "Is case-insensitive matching OK for the search?"
   - "Do you want me to add tests for it, or focus on the feature first?"
4. **Say your plan out loud** in 3–5 steps, *before* coding:
   > "I'll start in the backend: add the field to the model and the schema, check it in `/docs`.
   > Then the API call in the frontend, then the form, then the display. Then I'll test the error case."
5. Ask: **"Does that sound good?"** That gives them the chance to steer you early.

---

## 3. The working loop: small steps, think aloud

```
 ┌─► 1. Say what you're about to do        "Now I'm adding the column to the model…"
 │   2. Make ONE small change
 │   3. Check it immediately               (/docs, browser, Network tab, pytest)
 │   4. Say what you see                   "It returns 201 with the new field, good."
 └── 5. Next step
```

- **Backend first, then frontend.** A backend change can be checked on its own in `/docs` (FastAPI)
  or with the browser / a test (Flask). Then the frontend only needs to "consume" it.
- **Follow the existing patterns.** Copy how the codebase already does things (naming, error handling, file
  structure), even if you'd do it differently. Mention it: *"I'll follow the pattern used in `createItem`."*
- **Keep it running.** Backend with `--reload` / `--debug`, frontend with `npm run dev`. Save → check.
- **Commit at milestones** (optional, but it looks professional): `git commit -m "Add quantity to item API"`.

### Order for the most common task: "add a field X"
1. DB model (+ reset the DB / migration if needed)
2. Request/response schema (Pydantic) or validation + dict building (Flask)
3. Route logic, if it copies fields by hand
4. ✔ check in `/docs` or with a test
5. Frontend type (TypeScript) / `api.js` call
6. Form input (state + `onChange` + send it)
7. Display
8. ✔ check the happy path + the error case in the browser
9. Test (if time allows)

---

## 4. Useful phrases (they want to hear your thinking)

| Situation | Say |
|---|---|
| Exploring | "Let me first find where the items are loaded… here in `App.jsx`, it calls `getItems` from `api.js`." |
| Choosing | "I could filter in the frontend or the backend. Backend scales better with lots of data, but frontend is quicker here. Which do you prefer?" |
| Following patterns | "The other endpoints raise `HTTPException` for not-found, so I'll do the same." |
| Looking up syntax | "I don't remember the exact syntax for a Pydantic validator, so I'll check the docs." ✅ allowed |
| Error appears | "422. Let me read the detail… it says `quantity` is missing, so the frontend isn't sending it yet." |
| Stuck | "I'm not sure why the list doesn't update. My hypothesis is that the state isn't being replaced. Let me log it." |
| Trade-off | "For now I'll keep it simple. In production I'd add a migration instead of deleting the DB." |
| Finishing | "It works for the happy path and for invalid input. With more time I'd add a test and handle loading states." |

---

## 5. When you're stuck (it WILL happen, and that's fine)

1. **Don't go silent.** Say what you're checking.
2. **Locate the layer** (see L1 §7): is there a request in the Network tab? What status? Is there an error in the backend terminal? In the browser console?
3. **Read the error message out loud**, especially the last line of a Python traceback and the first line of a JS error.
4. **Add a log:** `print(data)` in Python, `console.log(items)` in React.
5. **Shrink the problem:** test the endpoint alone in `/docs`. Hardcode a value in React.
6. After about 3 minutes stuck, **ask a targeted question**: "Is there a reason the API uses `item_name` instead of `name`?"
   Asking is not failing. Collaboration is literally part of what they are evaluating.

---

## 6. Typical bugs to check first

| Symptom | Usual cause |
|---|---|
| UI doesn't update after a change | state mutated (`push`, `splice`, `obj.x = …`) instead of replaced with a new array/object |
| Data shows `undefined` / is empty | wrong key name (`text` vs `content`, `snake_case` vs `camelCase`) |
| `[object Promise]` or weird empty rows | missing `await` before `response.json()` or an API call |
| Page reloads on submit | missing `e.preventDefault()` |
| Infinite requests in the Network tab | `useEffect` without a dependency array, or setting state that's in its own dependencies |
| CORS error in console | calling `http://localhost:8000` directly while CORS isn't allowed for `5173` |
| 422 from FastAPI | body doesn't match the Pydantic model; read `detail[].loc` and `msg` |
| 405 Method Not Allowed | wrong HTTP method or missing route for that method |
| 404 on a route that exists | typo, missing `/api` prefix, or route order (`/items/{id}` before `/items/stats`) |
| 500 | backend crash: read the traceback in the backend terminal |
| New DB column "doesn't exist" | `create_all` doesn't add columns to existing tables: delete the `.db` file / migrate |
| Flask returns HTML error page | no JSON error handler; frontend `response.json()` then fails |
| Number compared wrong / string concatenation `"1"+"1"="11"` | input values are strings: `Number(...)` / `int(...)` |

---

## 7. Last 5 minutes

- Demo it: click through the happy path **and** one error case.
- Summarise: what you built, which files you touched, what you'd do next (tests, edge cases, UX, security).
- If something is unfinished, say exactly what's missing and how you'd finish it.
- Have **1–2 questions** ready for them, e.g.:
  - "What does a typical week look like for an engineer in a DPS team?"
  - "How do teams decide on the tech stack for a product?"
  - "How is feedback given during the program?"

---

## 8. Self-review after each practice project (2 min, write it down)

1. Did I restate the task and ask at least one question?
2. Did I say my plan before coding?
3. Did I check after every small step?
4. Where did I lose the most time, and why?
5. Which syntax did I have to look up? (add it to your own notes)

---

## 9. Questions about YOU, your projects and your decisions

A DPS alumna's tip: they ask a lot about **previous projects, the technologies you used, and the technical decisions
behind them**, and how you approach problems. Prepare this as seriously as the coding part.

### A structure for every project answer (≈ 2 minutes)
1. **Context**: who was it for, and what problem did it solve? (1–2 sentences)
2. **Your role**: what did *you* build? (say "I", not "we", for your part)
3. **One key technical decision**: what you chose, **what the alternative was**, and **why** you chose it.
4. **Result**: what worked? Use a number if you have one.
5. **What you'd do differently / learned**: shows reflection, which DPS values highly.

### Prepare these from your CV (write 3–4 bullet points for each, then say them out loud)

| Project | Likely questions |
|---|---|
| **JobFitAI** (Chrome Extension → FastAPI → LLM → SQLite) | Why FastAPI? Why SQLite and not Postgres? How does Pydantic validation protect the database from bad LLM output? How does the extension talk to the backend (CORS, API key)? What does your CI pipeline check, and why? |
| **Cleo** (Qhack-26, team of 5, React + FastAPI) | How did you split the work in the team? How did frontend and backend agree on the API? What would you do differently with more time? What did you personally build? |
| **Message pipeline** (fully local, PII masking) | Why no external APIs? What trade-offs did "data must never leave the company" create? How did you test the PII detection? |
| **SEC MCP server** (in progress) | What is MCP, in simple words? Why citations? What's the hardest part so far, and how are you approaching it? |
| **Thesis** (RAG vs RAFT) | Explain it to a non-expert in 30 seconds. How did you make sure your results were reliable? |

### General questions to prepare
- *"Walk me through how you would build \<a simple product\> from scratch."* → users & problem first, then a small
  first version (MVP), the API, the data model, the UI, testing, deployment.
- *"How do you approach a problem you've never seen before?"* → understand → break it down → small experiment → check → iterate. Give one real example.
- *"Tell me about a bug that took you long to find."* → symptom, how you narrowed it down (layers!), the root cause, what you learned.
- *"How do you make sure your code works?"* → tests (pytest), manual checks, CI, code review, validating input.
- *"Why DPS, and why the Software Engineer track?"* → your motivation letter: build products **with** designers and PMs,
  user-centred, learn agile properly, grow beyond Python into React (and Spring).
- *"How would you use AI in a product for \<use case\>?"* → your strength. Keep it practical: the user problem first,
  then where AI helps, how you validate the output, privacy, cost, and a fallback when the AI is wrong.

> 💡 Rehearse with a timer: 2 minutes per project. Record yourself once, or practise with a friend.
