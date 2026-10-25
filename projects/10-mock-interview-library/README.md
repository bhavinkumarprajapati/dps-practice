# 10: Mock Interview: City Library 🟠

**Stack:** FastAPI (routers) + SQLAlchemy + SQLite + React (JavaScript) · **Time:** 30 min prep + **60 min live**

This project **simulates the real interview**. The codebase is bigger than the others and you haven't seen it.
The request is **vague on purpose**, like a real user problem. You decide (and explain) the details.

> 💡 Best: ask a friend or your mentor to play the interviewer: they read the request to you, answer your questions
> from the hidden section, and ask the follow-up questions at the end. Otherwise, **record yourself** (screen + voice)
> and watch the first 10 minutes afterwards.

---

## Part A: "The day before" (30 min, AI allowed ✅)

This is what you'll do on Thu 29 Oct with the real repo. Practise it now.

```powershell
# Terminal 1
cd projects\10-mock-interview-library\backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2
cd projects\10-mock-interview-library\frontend
npm install
npm run dev
```

1. Get it running. Click through both tabs. Lend a book, return a book. Watch the Network tab.
2. Run `pytest -v`.
3. Fill in this **architecture note** (on paper or in a text file). In the interview, having it next to you is gold:

```
BACKEND
  entry point: ...............   how routes are organised: ...............
  tables + relationships: ...............
  endpoints (method, URL, what it does):
    ...
  where business rules live (e.g. "book already on loan"): ...............
  how test data is created: ...............
FRONTEND
  entry point → main component: ...............
  how pages/tabs work: ...............
  where API calls are: ...............   who owns which state: ...............
CONNECTION
  how the frontend reaches the backend (proxy? URL?): ...............
5 CHANGES THEY MIGHT ASK FOR:
  1. ...  2. ...  3. ...  4. ...  5. ...
```

4. Restart everything once from scratch (stop both servers, delete `backend/library.db`, start again), so you know the reset steps.

---

## Part B: The live session (60 min, NO AI ❌, timer on, talk out loud)

**Rules:** looking up syntax is fine (CHEATSHEET, official docs). No AI-generated code.
Work on a branch: `git checkout -b mock`.

| Time | What |
|---|---|
| 0–5 min | Read the request. **Restate it** in your own words. **Ask clarifying questions** out loud (write them down). Only then open the interviewer's answers. |
| 5–10 min | Explain your **plan** (backend → API check → frontend → edge cases) and ask "does that sound good?" |
| 10–50 min | Implement in small steps. Say what you're doing. Check after each step. |
| 50–60 min | **Demo** (happy path + one edge case), summarise what you changed, then answer the follow-up questions. |

<details><summary>📩 <b>The request</b> (open when you start the timer)</summary>

> *"Hi! We talked to the librarians last week. They told us that members often forget when they have to bring their
> books back, and some books aren't returned for weeks. The librarians have no idea which books they should chase.
> Can you help them with that?"*

</details>

<details><summary>🗣 Interviewer's answers to clarifying questions (open only AFTER you asked your questions out loud)</summary>

- **How long can a member keep a book?** 14 days from the day it was lent.
- **What should the librarian see?** On the **Loans** page: when each book is due, and the overdue ones should
  **stand out clearly**, e.g. "5 days overdue". The most urgent ones should be at the top.
- **Should the due date be stored or calculated?** Your choice, but explain it. (We'd like members to be able to extend a
  loan later, if that helps you decide.)
- **What about loans that already exist?** They should get a due date too: 14 days after their loan date.
- **Books page?** Not required. If you have time, showing "due back on …" for books on loan would be nice.
- **Tests?** At least one backend test for the new logic would be great.
- **Emails or notifications?** Not now. Just the UI.

</details>

<details><summary>➕ Extension (only if you finish early)</summary>

> *"Members love it, and now they ask: can I extend my loan?"* A loan can be **extended once**, by 14 days, and **only if
> it isn't overdue yet**. Otherwise the librarian gets a clear message.

</details>

<details><summary>❓ Follow-up questions the interviewer might ask (last 10 min)</summary>

1. Walk me through your changes, file by file. Why did you start where you started?
2. Did you store the due date or calculate it? What are the trade-offs?
3. What happened to the existing database when you added a column? How would you do this in production?
4. Where is "today" decided: backend or frontend? Why does it matter? (Think: time zones, the user's wrong clock.)
5. How would you test "5 days overdue" reliably, when the result depends on today's date?
6. What would you build next for the librarians? How would you find out if this feature actually helps them?

</details>

---

## Self-evaluation (fill in right after, honestly)

| Skill | 1 = not yet · 2 = OK · 3 = strong | Note |
|---|---|---|
| Understood the codebase quickly | | |
| Restated the task + asked good questions | | |
| Explained a plan before coding | | |
| Worked in small, verified steps | | |
| Talked out loud while working (no long silences) | | |
| Handled edge cases / errors | | |
| Wrote or updated a test | | |
| Explained decisions and trade-offs | | |

The two lowest rows are what you practise on Wed 28 Oct.

**Reference solution:** not in this branch. When you have finished, ask your mentor for the review / solution.
