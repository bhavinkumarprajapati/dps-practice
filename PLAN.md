# DPS Technical Interview Prep: Plan (React + Python)

**Goal:** Pass the Digital Product School (Batch #28) Software Engineer technical interview
on **Friday 30 October 2026, 9:00**.
**Time budget:** about **4 hours per day**, 15 days (Thu 15 Oct → Thu 29 Oct).
**Machine:** Windows (PowerShell); see [SETUP.md](SETUP.md).

**Interview format** (from the invitation email):
1. The day before, you get read access to a small React + Python app. Clone it and get it running.
   AI is allowed for this step.
2. In the call, you implement a small change to that app together with the interviewers.
   **Minimal AI**: looking up syntax is fine, generating the solution is not.
3. They are checking **how you think and solve problems**, not just whether the code is finished.

**Strategy:**
1. **Basics course first** (Days 1–3) so React, FastAPI, Flask and how they connect are clear.
2. Then **20 interview-style practice apps**. Each is a small, working app with change requests in its README,
   from easy single-file edits up to timed simulations of the real interview.

---

## 1. Repository layout

```
dps-practice/
├── README.md              # progress tracker: tick things off here
├── PLAN.md                # this file
├── SETUP.md               # Windows setup: Python venv, Node, VS Code, common errors
├── CHEATSHEET.md          # FastAPI / Flask / SQLAlchemy / React / TS / fetch / pytest syntax
├── INTERVIEW_PLAYBOOK.md  # step-by-step routine for the live session + think-aloud phrases
├── basics/                # ✅ the basics course (L1–L6)
│   ├── L1-web-fundamentals.md
│   ├── L2-fastapi/
│   ├── L3-flask/
│   ├── L4-react/
│   ├── L5-typescript/
│   └── L6-fullstack/      # React + (FastAPI OR Flask) + SQLite
├── projects/
│   ├── 01-click-counter/
│   │   ├── README.md      # app overview, how to run, TASKS with time limits, hints
│   │   ├── backend/       # FastAPI or Flask, with tests/
│   │   └── frontend/      # React + Vite (JS or TS)
│   └── ...
```

Reference solutions are **not** on `main`. They are kept on the separate `solutions` branch,
and the mentor shares them after a project is finished.

**Workflow per project:**
1. `git checkout -b practice/01` keeps `main` clean, so you can redo the project later.
2. **5 min exploring without AI**: run the app, read the README, trace one request UI → API → DB.
3. Start a timer, **talk out loud**, do the tasks one by one. Look up syntax only (CHEATSHEET / docs).
4. Check each task: in the browser, in `/docs` (FastAPI) and with `pytest`.
5. Ask your mentor for the review / reference solution. Write down 1 thing you'll do differently.
6. Tick the project off in `README.md`.

---

## 2. Basics course (✅ ready now): Days 1–3

| Lesson | Content | Time |
|---|---|---|
| L1 | How web apps work: HTTP, REST, JSON, status codes, ports, Vite proxy, CORS, DevTools | 1 h |
| L2 | FastAPI: routes, path/query/body, Pydantic validation, HTTPException, Swagger, pytest | 2 h |
| L3 | Flask: the **same** API, with a FastAPI ↔ Flask translation table | 1.5 h |
| L4 | React (JS): JSX, props, state, lists, forms, useEffect + fetch, lifting state up | 3 h |
| L5 | TypeScript + React: types, typed props/state/events/fetch | 1.5 h |
| L6 | Full-stack Shopping list: React + FastAPI **or** Flask + SQLite. Trace one click, then add a field end-to-end | 3 h |

---

## 3. Tech stack in the practice projects

Your choices: **60% FastAPI / 40% Flask** and **60% JavaScript / 40% TypeScript**.

| Layer | Used |
|---|---|
| Backend | **FastAPI** + Pydantic v2 (12 projects) · **Flask** (8 projects) |
| Data | in-memory lists → JSON files → **SQLite** (SQLAlchemy 2.0 with FastAPI; sqlite3 / Flask-SQLAlchemy with Flask) |
| Frontend | **React 18 + Vite**: JavaScript (12) · TypeScript (8) · React Router in P16 |
| Requests | `fetch` + `async/await`, Vite proxy `/api` → port 8000 (CORS set up by hand in P03) |
| Tests | **pytest** (FastAPI TestClient / Flask test client) · Vitest in P18 |
| Styling | plain CSS (no UI library, to keep the focus on logic) |

---

## 4. The 20 projects

Legend: 🟢 Easy · 🟡 Medium · 🟠 Hard · 🔴 Interview simulation · **FA** = FastAPI · **FL** = Flask

### Level 1: Warm-up (small, mostly single-layer changes)

| # | Project | Stack | Tasks you implement | Key concepts |
|---|---|---|---|---|
| 01 🟢 | **Click Counter** | FA + JS | decrement button · reset endpoint + button · never below 0 (both sides) · "last updated" time | running both servers, useState, useEffect, fetch GET/POST |
| 02 🟢 | **Todo List** | FL + JS | delete (DELETE) · toggle done (PATCH) · "3 open" counter · filter All/Open/Done | list rendering + key, REST verbs, 200/201/204/404 |
| 03 🟢 | **Bug Hunt: Notes App** | FA + JS | fix 5 planted bugs: CORS, wrong JSON key, missing `await`, stale state, wrong status code | debugging with DevTools Network/Console + tracebacks |
| 04 🟢 | **Book Library** | FL + JS | `?q=` search · `?sort=year` · search box · "No books found" | query params, conditional rendering |
| 05 🟢 | **Weather Board** | FA + TS | add `humidity` end-to-end · °C/°F toggle · 404 for unknown city shown nicely | adding a field, derived state, typed API |

### Level 2: Full-stack features (the most likely type of interview task)

| # | Project | Stack | Tasks you implement | Key concepts |
|---|---|---|---|---|
| 06 🟡 | **Recipe Box** | FL + JS | new field `cooking_time` (model → API → form → display) · validation → show error in UI · "under 30 min" filter | manual validation in Flask, forms, error display |
| 07 🟡 | **Expense Tracker** | FA + JS (SQLite) | add `category` column · `GET /summary` per category · edit expense (PUT) · month filter | SQLAlchemy, aggregation, PUT vs PATCH |
| 08 🟡 | **Movie Watchlist** | FL + TS (sqlite3) | 1–5 star rating component · sort by rating · pagination (limit/offset) + "Load more" | reusable typed components, SQL ORDER BY / LIMIT |
| 09 🟡 | **Event Booking** | FA + JS | book a seat · no overbooking (409) · cancel · "x seats left" · pytest for rules | business rules on the server, writing tests |
| 10 🟡 | **Kanban Board** | FL + TS | move card between columns · add "Review" column · WIP limit · split a big component | enums/unions, component decomposition |
| 11 🟡 | **Poll App** | FA + JS | vote endpoint · one vote per name · results as % bars · close poll | state updates, percentages, 409 vs 400 |

### Level 3: Harder changes (several files, data modelling, tests)

| # | Project | Stack | Tasks you implement | Key concepts |
|---|---|---|---|---|
| 12 🟠 | **Inventory Manager** | FL + JS (Flask-SQLAlchemy) | low-stock warning · restock endpoint · stock history (new table + relationship) · tests | 1-to-many relations, transactions |
| 13 🟠 | **Habit Tracker** | FA + TS | mark today done · streak calculation (pure function + unit tests) · last-7-days view | dates, pure functions, test-first |
| 14 🟠 | **Mini Shop + Cart** | FA + TS | cart with React Context · server-side total · discount code · stock check at checkout | Context, never trust client prices (security) |
| 15 🟠 | **Private Notes with Login** | FL + JS | login → token · protect endpoints · own notes only · 401 → back to login | auth basics, security thinking |
| 16 🟠 | **Job Board** | FA + TS + Router | detail page `/jobs/:id` · filters in URL query string · apply form with validation | React Router, useParams, useSearchParams |
| 17 🟠 | **Message Board** | FA + JS | polling for new messages · "5 minutes ago" · edit only within 5 min · delete own | setInterval + cleanup, time-based rules |
| 18 🟠 | **Refactor & Test: Legacy App** | FA + TS | pull fetch calls into `api.ts` + custom hook · add pytest + Vitest tests · fix a bug the tests reveal | clean code, custom hooks, testing strategy |

### Level 4: Interview simulations (unfamiliar codebase, timed, think-aloud)

| # | Project | Stack | Format |
|---|---|---|---|
| 19 🔴 | **Mock #1: Library Loans** | FL + JS | Bigger "realistic" codebase. 15 min to explore, then **45 min** on a vague request ("Members say they lose track of when books are due"). Ask clarifying questions, plan, implement, explain. Record yourself. |
| 20 🔴 | **Mock #2: Dress Rehearsal** | FA + TS | A codebase you haven't seen. **Live session with Claude as interviewer**: the task is revealed only in chat, with follow-up questions and feedback on code, communication and process. |

Practising each concept more than once: **add a field end-to-end** in L6, 05, 06, 07, 12, 16 · **error handling** in 03, 05, 06, 09, 15 · **tests** in 09, 12, 13, 18 · **Flask** in L3, L6, 02, 04, 06, 08, 10, 12, 15, 19.

---

## 5. Schedule (4 h/day)

| Day | Date | Work (≈ 4 h) |
|---|---|---|
| 1 | Thu 15 Oct | SETUP.md · **L1** · **L2** (FastAPI) · **L3** (Flask) |
| 2 | Fri 16 Oct | **L4** (React) · **L5** (TypeScript) |
| 3 | Sat 17 Oct | **L6** (full-stack) · basics self-check list |
| 4 | Sun 18 Oct | **P01** · **P02** · **P03** (Level 1 projects are short) |
| 5 | Mon 19 Oct | **P04** · **P05** · read INTERVIEW_PLAYBOOK |
| 6 | Tue 20 Oct | **P06** · **P07** |
| 7 | Wed 21 Oct | **P08** · **P09** |
| 8 | Thu 22 Oct | **P10** · **P11** · list your weak spots |
| 9 | Fri 23 Oct | **P12** · **P13** |
| 10 | Sat 24 Oct | **P14** · **P15** |
| 11 | Sun 25 Oct | **P16** · **P17** |
| 12 | Mon 26 Oct | **P18** · redo your 2 slowest tasks without hints |
| 13 | Tue 27 Oct | **P19 mock** (timed, recorded) · review the recording |
| 14 | Wed 28 Oct | **P20 live mock with Claude** · fix weak spots |
| 15 | Thu 29 Oct | **The real repo arrives.** Clone, run, understand (AI allowed). Write a 1-page architecture note, guess 5 likely changes, try 2 on a throw-away branch, then `git checkout main`. Stop early and sleep well. |
| 🎯 | **Fri 30 Oct, 9:00** | **Interview** |

---

## 6. Habits to practise in every project

1. **Restate the task + ask clarifying questions** before coding ("Should the search be case-insensitive?").
2. **Explore first**: find the entry points (`main.py` / `app.py`, `App.jsx`) and trace one request end to end.
3. **Plan out loud**: "First the model, then the endpoint, test it in `/docs`, then the UI."
4. **Small steps**: run after every change; don't write 50 lines blind.
5. **Handle the unhappy path**: empty input, not found, server down.
6. **Say what you'd do with more time**: tests, validation, accessibility, security.
7. **When stuck**: say what you're thinking, read the error out loud, look up syntax.

---

## 7. Delivery

| Batch | Content | Status |
|---|---|---|
| 0 | SETUP, CHEATSHEET, basics L1–L6 | ✅ done |
| 1 | INTERVIEW_PLAYBOOK + P01–P05 (solutions on `solutions` branch) | ✅ done |
| 2 | P06–P11 (solutions on `solutions` branch) | needed by Tue 20 Oct |
| 3 | P12–P18 (solutions on `solutions` branch) | needed by Fri 23 Oct |
| 4 | P19 (solution on `solutions` branch), P20 codebase (task stays secret) | needed by Tue 27 Oct |

Every project is checked before it's pushed: `pip install` + `pytest` pass, `npm install` + `npm run build` succeed,
and the starter app runs in a browser. The tasks are **not** implemented in the starter code; they're for you.
