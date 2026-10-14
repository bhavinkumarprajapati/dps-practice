# Basics Course: React + Python from zero to "I understand this app"

Do this **before** the 20 practice projects. It takes about **10–12 hours** over Days 1–3. Every lesson is
a small, working program with lots of comments. Read the code, run it, change it, and break it on purpose.

| Lesson | Folder | What you learn | Time |
|---|---|---|---|
| L1 | [L1-web-fundamentals.md](L1-web-fundamentals.md) | How a React + Python app works: HTTP, REST, JSON, status codes, ports, proxy, CORS | 1 h |
| L2 | [L2-fastapi/](L2-fastapi/) | FastAPI: routes, path/query params, Pydantic models, validation, 404/201/204, Swagger, pytest | 2 h |
| L3 | [L3-flask/](L3-flask/) | **The same API** in Flask, side by side with FastAPI | 1.5 h |
| L4 | [L4-react/](L4-react/) | React (JavaScript): JSX, props, state, lists, forms, `useEffect` + fetch, lifting state up | 3 h |
| L5 | [L5-typescript/](L5-typescript/) | TypeScript in React: types, typed props/state/events/fetch | 1.5 h |
| L6 | [L6-fullstack/](L6-fullstack/) | A full app: React + **FastAPI or Flask** + SQLite. Trace one click from start to finish, then add a field end-to-end | 3 h |

## How to study each lesson

1. **Run it first** and see what it does.
2. **Read the code top to bottom.** The comments marked `STEP 1`, `STEP 2`, … tell you the reading order.
3. **Do the exercises** in the lesson's README. Write the code yourself. Use `CHEATSHEET.md` and the official docs,
   **not AI**, because this is exactly the rule in the interview.
4. Only then open the collapsed **Solution**.
5. **Explain out loud** what you just built, as if to an interviewer. This feels odd at first, but it is the skill they are testing.

## Self-check: you're ready for the projects when you can…

- [ ] explain what happens between clicking a button and the data appearing (browser → proxy → backend → database → back)
- [ ] write a GET and a POST endpoint in **FastAPI** and in **Flask** without looking
- [ ] explain the difference between a path parameter, a query parameter and a request body
- [ ] pick the right status code: 200, 201, 204, 400, 404, 409, 422, 500
- [ ] build a React component with `useState`, render a list with `map` + `key`, and handle a form
- [ ] load data with `useEffect` + `fetch` and show loading and error states
- [ ] pass data **down** with props and send events **up** with callback props
- [ ] add a type to props and state in TypeScript
- [ ] add a new field to an existing app end-to-end (DB → model → API → UI)
- [ ] run `pytest` and write one simple API test

Official docs (allowed during the interview, since looking up syntax is OK):
- FastAPI: https://fastapi.tiangolo.com/tutorial/
- Flask: https://flask.palletsprojects.com/en/stable/quickstart/
- React: https://react.dev/learn
- TypeScript + React: https://react-typescript-cheatsheet.netlify.app/
- SQLAlchemy 2.0: https://docs.sqlalchemy.org/en/20/orm/quickstart.html
