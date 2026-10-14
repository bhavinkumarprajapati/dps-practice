# DPS Technical Interview Prep: 15-Day Plan (React + Python)

**Goal:** Pass the Digital Product School (Batch #28) Software Engineer technical interview.

**Interview format** (from the invitation email):
1. The day before, you get read access to a small React + Python app. Clone it and get it running.
   AI is allowed for this step.
2. In the call, you implement a small change to that app together with the interviewers.
   **Minimal AI**: looking up syntax is fine, generating the solution is not.
3. They are checking **how you think and solve problems**, not just whether the code is finished.

**Strategy:** Do 20 practice projects, each one a small, working React + Python app with change
requests written in its README. They get harder as you go: first single-file edits, then full-stack
features, then unfamiliar codebases worked on a timer, the same way the interview runs.

---

## 1. Repository layout

```
dps-practice/
├── README.md              # overview + progress tracker (tick projects off here)
├── PLAN.md                # this file
├── SETUP.md               # one-time setup: Python venv, Node, VS Code, common errors
├── CHEATSHEET.md          # React + FastAPI + Flask syntax you can look up during the interview
├── INTERVIEW_PLAYBOOK.md  # step-by-step routine for the live session + think-aloud phrases
├── projects/
│   ├── 01-click-counter/
│   │   ├── README.md      # what the app does, how to run it, TASKS, time boxes, hints
│   │   ├── backend/       # Python API (FastAPI by default, Flask in some projects)
│   │   │   ├── app/
│   │   │   ├── tests/     # pytest: existing tests pass; you add tests for your change
│   │   │   └── requirements.txt
│   │   └── frontend/      # React + Vite
│   ├── 02-todo-list/
│   └── ...
└── solutions/
    ├── 01-click-counter.md   # reference solution + explanation (open only AFTER trying)
    └── ...
```

**Each project README contains:**
- **App overview**: what it does and how the code is organised (like the interview repo you'll get).
- **Run it**: backend and frontend commands.
- **Tasks 1–4**, getting harder. Each has a user story, acceptance criteria and a time box
  (for example 10 / 20 / 30 / 45 min).
- **Hints**, folded away so you only open them if you're stuck.
- **Concepts practised**: what to revise if you struggled.
- **Bonus**: write a test, handle the error case, improve the UX.

**Workflow per project:**
1. Create a branch, e.g. `git checkout -b practice/01`, so `main` stays clean and you can redo a project later.
2. Read the code **without AI** for about 5 minutes and write down how the data flows (UI → API → data).
3. Start the timer, **talk aloud** and implement each task. Look up syntax only (CHEATSHEET / docs).
4. Check your work manually in the browser and in Swagger (`/docs`), then run `pytest`.
5. Compare with `solutions/NN-*.md` and note what you'd do differently.
6. Tick the project off in `README.md`.

---

## 2. Tech stack used in the practice projects

We don't know exactly which Python framework the DPS repo uses, so you'll practise both.

| Layer | Main | Also covered |
|---|---|---|
| Backend | **FastAPI** + Pydantic v2 + Uvicorn | **Flask** (projects 11 & 19) |
| Data | In-memory lists, then JSON files, then **SQLite + SQLAlchemy 2.0** | raw `sqlite3` |
| Frontend | **React 18 + Vite, JavaScript** | **TypeScript** (projects 14, 16, 20), React Router |
| Requests | `fetch` + `async/await`, Vite proxy `/api` | CORS configured by hand (project 3) |
| Tests | **pytest** + FastAPI `TestClient` | Vitest + React Testing Library (project 18) |
| Styling | Plain CSS | (deliberately no UI library, to keep focus on logic) |

---

## 3. The 20 projects

Legend: 🟢 Easy · 🟡 Medium · 🟠 Hard · 🔴 Interview simulation
FE = frontend change, BE = backend change, FS = full-stack (both)

### Level 1: Warm-up (small, mostly single-layer changes)

| # | Project | Tasks you implement | Key concepts |
|---|---|---|---|
| 01 🟢 | **Click Counter** (counter stored in backend) | FE: decrement button · BE+FE: reset endpoint + button · rule: never below 0 (both sides) · show "last updated" time | Running both servers, `useState`, `useEffect`, `fetch` GET/POST, FastAPI routes |
| 02 🟢 | **Todo List** (in-memory) | Delete todo (DELETE) · toggle done (PATCH) · "3 open tasks" counter · filter All/Open/Done | List rendering + `key`, controlled inputs, REST verbs, status codes 200/201/204/404 |
| 03 🟢 | **Bug Hunt: Notes App** | Fix 5 planted bugs: CORS, wrong JSON key, missing `await`, stale state, 404 that should be 422 | Debugging: browser DevTools (Network/Console), reading tracebacks, `print`/breakpoints |
| 04 🟢 | **Book Library** (read-only list) | BE: `?q=` search query param · BE: `?sort=year` · FE: search box · "No books found" empty state | Query params, Pydantic response models, conditional rendering |
| 05 🟢 | **Weather Board** (mock data from JSON) | Add `humidity` end-to-end · °C/°F toggle (FE only) · 404 for unknown city shown nicely in UI | Adding a field end-to-end, derived state, error handling with `HTTPException` |

### Level 2: Full-stack features (the most likely type of interview task)

| # | Project | Tasks you implement | Key concepts |
|---|---|---|---|
| 06 🟡 | **Recipe Box** | New field `cooking_time` (model → API → form → display) · validation (positive int) and show the 422 message in the UI · filter "under 30 min" | Pydantic `Field` validation, forms, showing backend errors |
| 07 🟡 | **Expense Tracker** (SQLite) | Add `category` column · `GET /summary` totals per category · edit expense (PUT) · monthly filter | SQLAlchemy models/sessions, aggregation, PUT vs PATCH |
| 08 🟡 | **Movie Watchlist** | 1–5 star rating component · sort by rating · pagination (`limit`/`offset`) BE + "Load more" FE | Reusable components + props, pagination patterns |
| 09 🟡 | **Event Booking** | Book a seat · prevent overbooking (409 Conflict) · cancel booking · "x seats left" badge · pytest for the rules | Business rules on the server, status codes, writing tests |
| 10 🟡 | **Kanban Board** | Move card between columns · add a "Review" column · WIP limit per column · split a big component in two | Enums, component decomposition, lifting state up |
| 11 🟡 | **Poll App (Flask)** | Vote endpoint · one vote per name · results as % bars · close poll | Flask routes, `request.get_json()`, `jsonify`, comparing Flask with FastAPI |

### Level 3: Harder changes (several files, data modelling, tests)

| # | Project | Tasks you implement | Key concepts |
|---|---|---|---|
| 12 🟠 | **Inventory Manager** | Low-stock warning · restock endpoint · stock history (new table + relationship) · tests | 1-to-many relationships, migrations by hand, transactions |
| 13 🟠 | **Habit Tracker** | Mark today done · streak calculation (pure function + unit tests) · last-7-days view | Dates & time zones, pure functions, test-first |
| 14 🟠 | **Mini Shop + Cart** (TypeScript) | Cart with React Context · server-side total · discount code · stock check at checkout | TS types/interfaces, Context, never trusting client prices (security) |
| 15 🟠 | **Private Notes with Login** | Login → token · protect endpoints (`Depends`) · users only see their own notes · 401 → back to login | Auth basics, dependencies, security thinking (DPS covers cybersecurity) |
| 16 🟠 | **Job Board** (TypeScript + React Router) | Detail page `/jobs/:id` · filters kept in the URL query string · apply form with validation | Routing, `useParams`, `useSearchParams`, form validation |
| 17 🟠 | **Message Board** | Polling for new messages · "5 minutes ago" timestamps · edit only within 5 min · delete own message | `setInterval` + cleanup in `useEffect`, time-based rules |
| 18 🟠 | **Refactor & Test: Legacy App** | Pull duplicated fetch calls into an `api.js` module + custom hook · add pytest and Vitest tests · fix a hidden bug the tests reveal | Clean code, custom hooks, test strategy |

### Level 4: Interview simulations (unfamiliar codebase, timed, think-aloud)

| # | Project | Format |
|---|---|---|
| 19 🔴 | **Mock Interview #1: Library Loans (Flask + React)** | Bigger, "realistic" codebase. 15 min to explore, then **45 min** on one vague request ("Members say they lose track of when books are due"). You ask clarifying questions, plan, implement and explain. |
| 20 🔴 | **Mock Interview #2: Dress Rehearsal** | A codebase you haven't seen (TypeScript frontend + FastAPI). **Live session with me (Claude) as interviewer**: I reveal the task in chat only, ask follow-up questions and give feedback at the end on code, communication and process. |

---

## 4. 15-day schedule (≈ 3–4 h/day)

| Day | Date | Work |
|---|---|---|
| 1 | Thu 15 Oct | SETUP.md (both stacks running) · **P01** · **P02** |
| 2 | Fri 16 Oct | **P03** (debugging) · **P04** · read INTERVIEW_PLAYBOOK |
| 3 | Sat 17 Oct | **P05** · **P06** |
| 4 | Sun 18 Oct | **P07** (SQLite day) · revise CHEATSHEET SQLAlchemy part |
| 5 | Mon 19 Oct | **P08** · **P09** |
| 6 | Tue 20 Oct | **P10** · redo the slowest task so far, without hints |
| 7 | Wed 21 Oct | **P11** (Flask) · **review day**: list your weak spots |
| 8 | Thu 22 Oct | **P12** |
| 9 | Fri 23 Oct | **P13** |
| 10 | Sat 24 Oct | **P14** (TypeScript) |
| 11 | Sun 25 Oct | **P15** (auth/security) |
| 12 | Mon 26 Oct | **P16** · **P17** |
| 13 | Tue 27 Oct | **P18** · **P19 mock** (record yourself, rewatch) |
| 14 | Wed 28 Oct | **P20 live mock with Claude** · fix weak spots |
| 15 | Day before interview | **Real repo arrives**: clone, run, understand (AI allowed here). Write a 1-page architecture note, guess 5 likely changes and try 2 of them on a throw-away branch, then `git reset`. Sleep well. |

> The interview date is set when you book. If it's earlier or later than ~28 Oct, we compress or stretch Level 3.

**Practising each concept more than once:** adding a field end-to-end shows up in projects 5, 6, 7, 12 and 16; error handling in 3, 5, 6, 9 and 15; tests in 9, 12, 13 and 18. Repetition is what makes you fast under time pressure.

---

## 5. Habits to practise in every project

These are what the interviewers watch, so treat them as part of every task:
1. **Restate the task and ask clarifying questions** before coding ("Should the filter be case-insensitive?").
2. **Explore first**: find the entry points (`main.py`, `App.jsx`) and trace one request end to end.
3. **Plan out loud**: "First the backend model, then the endpoint, test it in `/docs`, then the UI."
4. **Small steps, check often**: run it after every change, don't write 50 lines blind.
5. **Handle the unhappy path**: empty input, not found, server down.
6. **Say what you would do with more time**: tests, validation, accessibility, security.
7. **When stuck**: say what you're thinking, read the error message aloud, look up syntax.

---

## 6. How I'll build it

- I'll build in **batches of ~5 projects**: Batch 1 (setup docs + P01–P05) first so you can start
  tomorrow, then P06–P11, then P12–P18, then the mocks.
- Before pushing, every project is checked: `pip install` + `pytest` pass, `npm install` + `npm run build` succeed,
  and the starter app runs. The tasks are **not** implemented in the starter code; they're for you.
- Solutions go in `solutions/`, separate from the projects, so you aren't tempted to peek.
- P20's codebase is pushed but its task is **never written in the repo**, so the live mock is a real surprise.
