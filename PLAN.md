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
2. Then **10 interview-style practice apps** (originally 20; reduced on 25 Oct to fit the remaining time, so the
   focus is on **fundamentals in JavaScript**, with no TypeScript). The last one is a timed simulation of the real interview.
3. Prepare to **talk about your own projects and decisions** (INTERVIEW_PLAYBOOK §9) and practise the **58 questions in
   [INTERVIEW_QA.md](INTERVIEW_QA.md)**. A DPS alumna said this is a big part of the interview.

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

| Layer | Used |
|---|---|
| Backend | **FastAPI** + Pydantic v2 (P01, 03, 05, 07, 08, 10) · **Flask** (P02, 04, 06, 09) |
| Data | in-memory lists → JSON files → **SQLite + SQLAlchemy 2.0** (P07, P10) |
| Frontend | **React 18 + Vite, JavaScript** (only P05 uses TypeScript) |
| Requests | `fetch` + `async/await`, Vite proxy `/api` → port 8000 (CORS by hand in P03) |
| Tests | **pytest** (FastAPI TestClient / Flask test client) |

---

## 4. The 10 projects

Legend: 🟢 Easy · 🟡 Medium · 🟠 Interview simulation · **FA** = FastAPI · **FL** = Flask

| # | Project | Stack | What you practise | Status |
|---|---|---|---|---|
| 01 🟢 | Click Counter | FA + JS | new endpoints, 409 rule, `updated_at` | ✅ done |
| 02 🟢 | Todo List | FL + JS | DELETE/PATCH, callback props, derived values, filter | ✅ done |
| 03 🟢 | Bug Hunt: Notes | FA + JS | debugging: CORS, wrong key, missing `await`, mutation, status codes | ✅ done |
| 04 🟢 | Book Library | FL + JS | search/sort/filter query params, `useEffect` deps, debounce | ✅ done |
| 05 🟢 | Weather Board | FA + TS | field end-to-end, °C/°F, 404 handling, lazy loading | ✅ done |
| 06 🟡 | **Recipe Box** | FL + JS | **add a field end-to-end** + validation, query-param filters, PATCH favourite | |
| 07 🟡 | **Expense Tracker** | FA + SQLite + JS | **new DB column**, `Literal`, aggregation (`/summary`), PUT + edit mode | |
| 08 🟡 | **Event Booking** | FA + JS | **business rules** (409), computed field, writing tests first, cancel (DELETE) | |
| 09 🟡 | **Task Board** | FL + JS | PATCH status, **refactor into components**, single source of truth, WIP limit | |
| 10 🟠 | **Mock Interview: City Library** | FA (routers) + SQLite + JS | unfamiliar codebase, **vague request**, 30 min prep + **60 min live** | |

Each project README ends with **"Interviewer follow-up questions"**. Answer them out loud: they train the
"explain your decisions" part of the interview.

---

## 5. Schedule (final days, ≈ 4 h/day)

| Day | Date | Work |
|---|---|---|
| ✅ | 15–24 Oct | Setup, basics L1–L6, projects 01–05 |
| 1 | Sun 25 Oct | **P06** · read INTERVIEW_PLAYBOOK §9 · INTERVIEW_QA **Part A** (you & projects) |
| 2 | Mon 26 Oct | **P07** · **P08** · INTERVIEW_QA **Part B** |
| 3 | Tue 27 Oct | **P09** · INTERVIEW_QA **Part C + E** · rehearse 2-minute project stories out loud (timer!) |
| 4 | Wed 28 Oct | **P10 mock interview** (record yourself or ask a friend) · INTERVIEW_QA **Part D** · repeat the ✍️ questions |
| 5 | Thu 29 Oct | **The real repo arrives.** Clone, run, understand (AI allowed). Fill in the architecture note from P10 Part A. Try 2 likely changes on a throw-away branch. Stop early and sleep. |
| 🎯 | **Fri 30 Oct, 9:00** | **Interview** |

> Optional: a **live mock with Claude** in chat (Claude plays the interviewer, gives a surprise task on one of the
> projects, and asks follow-up questions). Good on Wed 28 Oct if you have energy left.

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
| 1 | INTERVIEW_PLAYBOOK + P01–P05 | ✅ done |
| 2 (final) | P06–P10 (JavaScript) + playbook §9 "talk about your projects" | ✅ done |

Reference solutions for every project are on the separate `solutions` branch.

Every project is checked before it's pushed: `pip install` + `pytest` pass, `npm install` + `npm run build` succeed,
and the starter app runs in a browser. The tasks are **not** implemented in the starter code; they're for you.
