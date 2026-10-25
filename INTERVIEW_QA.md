# Interview Questions & Answers (58 questions)

Prepared for **Jahanvi**, DPS Software Engineer track, interview **Fri 30 Oct 2026, 9:00**.

The answers use **simple words** on purpose. Don't memorise them word by word. Understand the idea, then say it
**in your own words**. Interviewers notice memorised answers immediately.

---

## How to use this file

1. Read one section per day. Cover the answer, say yours **out loud**, then compare.
2. Every answer starts with a **short version** (2–3 sentences). Say that first. Only go deeper if they ask.
3. When you don't know something, say so honestly, then say how you would find out. That's a good answer too.
4. Mark the questions you find hard (✍️) and practise them again on Wed 28 Oct.

**Legend:** 🟢 basic · 🟡 medium · 🔴 harder / scenario
**Why it's likely:** 📄 your CV / letter · 🎓 DPS program page · 💬 Nidhi's tip · 👩‍🏫 the interviewer's background · 🌍 common in junior interviews

---

## What we know about the interview (and why these questions)

**From the invitation email:** a live coding change on a small React + Python app, **minimal AI**, "this part is about
your thinking and problem-solving".

**From Nidhi (DPS alumna, AI track):** questions were mainly about **previous projects**, the **technologies used**,
the **technical decisions behind them**, and **how you approach a problem**.

**From the DPS program page:** they value teamwork, agile and lean methods, design thinking, testing strategies,
continuous delivery, cybersecurity basics, and rapid prototyping in a cross-functional team.

**From the interviewer's public LinkedIn profile (Natalia Barsova, Software Engineer & Coach @ DPS):**
- Long **frontend** background (React, React Native, D3.js data visualisation) → expect **React questions**.
- She mentors teams **"from idea to MVP to production deployment"**, gives **architecture mentoring**, and built
  **the hiring process for software engineers** → expect questions about **decisions and trade-offs**, not trivia.
- She writes about a **"pragmatic, outcome-oriented engineering culture"** → show you build what's useful, not what's fancy.
- In a recent post she said the best learning is *"making a technical decision and then living with its consequences"*:
  early architecture choices that "bite you" later, quick fixes that become a maintenance burden, real users who depend
  on what you shipped → be ready to talk about **a decision you would make differently today**.
- She shared a post titled *"Don't be a meat proxy"*. The title suggests: don't just pass messages or AI output between
  others without adding your own thinking → be ready to explain **how you use AI tools responsibly** and that you
  **understand every line you submit**.
- She was happy about GitHub's **stacked pull requests** → she cares about clean Git workflow and small PRs.

---

# Part A: About you, your projects and DPS (12 questions)

These are the most important ones (💬 Nidhi). Prepare them first.

### A1. 🟢 Tell me about yourself. 📄
**Short version (≈ 60–90 seconds, practise this one the most):**
> "I'm Jahanvi. I studied Information Technology in Ahmedabad and then did my Master's in Data Science at the University
> of Mannheim. During my Master's I worked as a research assistant, on LLM benchmarking at Mannheim and on data pipelines at
> ESCP in Berlin. Since July I've been working as a freelance AI software engineer: for example, I built JobFitAI, a Chrome
> extension with a FastAPI backend that helps a recruitment agency match candidates to jobs. I also built a full-stack
> app with React and FastAPI in a team of five at the Qhack hackathon. What I'm missing is building a product **together
> with designers and product managers**, deciding as a team what is worth building. That's exactly why I applied to DPS."

Structure: **past** (studies) → **present** (what you build now) → **future** (why DPS). No long list of every course.

### A2. 🟢 Why DPS, and why the Software Engineer track? 📄🎓
**Short version:**
> "I want to build software that real people use, in a team that decides together *what* to build and *why*. As a
> freelancer I usually get a fixed scope and deliver one part. At DPS I can learn the whole process: user research, agile,
> testing and continuous delivery, in a real cross-functional team. And I want to widen my skills beyond Python: get
> stronger in React and try Spring."

Tip: mention 1–2 things from the program page that you really want (e.g. working with designers, testing strategies).

### A3. 🟡 Your background is mostly AI and data science. Why not the AI Engineer track? 📄👩‍🏫
They may ask this, so be ready. **Short version:**
> "AI is a strength I bring, but I noticed that my weak spot is the **software engineering** around it: clean
> architecture, frontend, testing, delivery. In my projects the model was often the easy part. Making a reliable product
> around it was the hard part. I want to become a strong software engineer who can also use AI well, not the other way round."

### A4. 🟡 Walk me through JobFitAI. What did you build and how does it work? 📄💬
**Short version:**
> "It's a tool for a recruitment agency. A **Chrome extension** reads a job posting directly from LinkedIn or other job
> sites. It sends the text to my **FastAPI backend**. The backend asks an **LLM** to compare the job with a candidate's
> profile, and it returns a match score, skill gaps and a draft cover letter. Results are stored in **SQLite**."

Then the details, if asked:
- **Pydantic** checks the LLM's answer. If the answer is malformed, it's **rejected before it is saved**.
- **4 scoring categories** with weights, plus a 5-level "should you apply?" recommendation.
- **API key** on all endpoints, **Docker**, deployed on **Render**.
- **GitHub Actions CI**: on every push it runs Ruff (code style), pytest (tests) and a Docker build check.

### A5. 🟡 What was an important technical decision in that project, and why? 📄💬👩‍🏫
Pick **one** decision and explain it with the alternative. Example:
> "I decided to **validate every LLM response with Pydantic** before saving it. The alternative was to save whatever the
> model returned and handle problems later. But LLMs sometimes return broken JSON or missing fields, and then the frontend
> would crash or show wrong scores. Validating at the boundary means bad data never reaches the database. The cost is
> that some requests fail and need a retry, but a clear error is better than wrong data."

Other good decision examples: **SQLite** instead of Postgres (small, one user group, simple to deploy, easy to switch
later); **FastAPI** (I know Python well, automatic validation and docs).

### A6. 🟡 What would you do differently today? 📄👩‍🏫
The interviewer likes "living with the consequences of decisions". Be honest and concrete. Example ideas
(pick what's true for you):
> "I would write tests for the scoring logic **earlier**: I added them late, and changing the weights was scary
> without them." / "I would design the database tables more carefully at the start, because changing them later
> was more work than I expected." / "I would talk to the recruiters more often during building, not only at the end."

### A7. 🟡 Tell me about Cleo at the hackathon. How did the team work together? 📄🎓
> "We were five people and had about two days. We first agreed on what mattered most for the user, a sales rep preparing
> a customer visit, and cut everything else. We split the work: frontend in React with Vite and Tailwind, backend in FastAPI,
> and integrations with external APIs (solar yield, energy prices, subsidy search). We agreed early on the **API shape**
> so frontend and backend could work in parallel. Under time pressure a lot was improvised. That's why I want to learn
> how to do it properly at DPS."

If asked "what did *you* build?", answer with **"I…"**, not "we…".

### A8. 🟡 Tell me about a time something went wrong, a bug or a failure. 🌍
Use this structure: **situation → what went wrong → how you found the cause → what you did → what you learned.**
> "In one pipeline, the results suddenly looked wrong. Instead of guessing, I checked step by step where the data
> changed: input, each processing step, output. The problem was in … (your real example). Since then I add small checks
> or tests at the points where data changes shape."

### A9. 🟢 How do you approach a problem you've never seen before? 💬🌍
> "First I make sure I understand the problem: I restate it and ask questions. Then I break it into small steps and start
> with the simplest version that works. I check each step before the next one. If I'm stuck, I read the error message
> carefully, look at the docs, and ask a colleague with a specific question."

Give a tiny real example (e.g. how you started the SEC MCP project: first the data download, then section detection, then search).

### A10. 🟡 How do you use AI tools when you code? 👩‍🏫
Important for this interviewer ("minimal AI" in the interview, the "meat proxy" post). **Short version:**
> "I use AI to understand unfamiliar code, to look up syntax and for first drafts of boring code. But I treat its output
> like code from a stranger: I read it, run it and test it, and I only commit what I understand and can explain. I
> never just pass AI output on to my team or a client. If I can't explain a line, it doesn't go in."

### A11. 🟢 Can you commit full-time, on-site in Munich, for the 12 weeks? 🎓
Simple and clear: *"Yes. I'm relocating to Munich, I can work 9 to 5 on-site, and I won't have other jobs, projects or courses
during the program."* (Only say this if it's true. They check this seriously.)

### A12. 🟢 Do you have questions for us? 🌍
Always have 2 ready (see the end of this file).

---

# Part B: Fundamentals (basic) (16 questions)

### B1. 🟢 What happens when a user clicks a button in a web app that loads data? 🌍
> "The React component runs a function, which sends an **HTTP request** with `fetch` to the backend. The backend finds
> the right **route**, checks the input, reads or writes the **database**, and sends back a **response**, usually JSON
> with a status code. React puts the data into **state**, and React re-renders the screen."

(Exactly what you practised in basics L6. Draw it: Browser → API → DB → back.)

### B2. 🟢 What's the difference between frontend and backend? 🌍
> "The **frontend** is what the user sees and clicks. It runs in the browser (for us: React). The **backend** runs on a
> server. It holds the business rules and the data (for us: FastAPI or Flask plus a database). They talk through an API."
> Important rule: **anything that must be correct or secure is checked in the backend**, because users can change the frontend.

### B3. 🟢 What is an API? What is a REST API? 🌍
> "An **API** is an agreed way for two programs to talk to each other. A **REST API** works over HTTP: things are
> **resources** with URLs, like `/api/books/4`, and you use **HTTP methods** to say what to do with them. The data is
> usually JSON. Each request has everything the server needs. The server doesn't remember earlier requests
> (that's called **stateless**)."

### B4. 🟢 Explain the HTTP methods. 🌍
| Method | Meaning | Example |
|---|---|---|
| GET | read | `GET /api/books` |
| POST | create | `POST /api/books` with a JSON body |
| PUT | replace completely | `PUT /api/books/4` with all fields |
| PATCH | change some fields | `PATCH /api/books/4` `{"read": true}` |
| DELETE | remove | `DELETE /api/books/4` |

### B5. 🟢 Which HTTP status codes do you know? 🌍
> "**2xx** = success, **4xx** = the client made a mistake, **5xx** = the server has a problem."
- 200 OK · 201 Created · 204 No Content (e.g. after delete)
- 400 Bad Request · 401 not logged in · 403 logged in but not allowed · 404 Not Found
- 409 Conflict (e.g. "book already on loan") · 422 invalid data (FastAPI validation) · 429 too many requests
- 500 server error (bug in the backend)

### B6. 🟢 What's the difference between a path parameter, a query parameter and a request body? 🌍
> "The **path** says *which* thing: `/books/4`. The **query** filters or sorts: `/books?author=tolkien&sort=year`.
> The **body** carries the data you send to create or update something, usually JSON in a POST, PUT or PATCH."

### B7. 🟢 What is JSON? 🌍
> "A simple text format for data, made of key-value pairs and lists, like `{"title": "Dune", "year": 1965}`. Almost every
> web API uses it because every language can read and write it."

### B8. 🟢 What is a database? SQL vs NoSQL? 📄🌍
> "A database stores data so it survives restarts and can be searched quickly. **SQL** databases (PostgreSQL, SQLite)
> store data in **tables with fixed columns** and relationships between tables. They're great when the data has a clear
> structure. **NoSQL** databases (like MongoDB) store flexible documents. They're good when the structure changes a lot.
> For most product MVPs I'd start with a SQL database."

### B9. 🟢 What is a primary key and a foreign key? 🌍
> "A **primary key** uniquely identifies a row, usually `id`. A **foreign key** is a column that points to a row in
> another table. For example `loans.book_id` points to `books.id`. That's how tables are connected."

### B10. 🟢 What is Git? What are branches, merges and pull requests? 👩‍🏫🌍
> "**Git** saves the history of the code, so you can go back and work in parallel. A **branch** is a separate line of
> work, for example one per feature. **Merging** brings a branch back into the main code. A **pull request** asks the team
> to review my branch before it's merged: they read the code, comment, and the CI tests run."

Bonus: *"Small pull requests are easier to review. Stacked PRs mean splitting a big change into several small PRs
that build on each other."*

### B11. 🟢 What is a merge conflict and how do you solve it? 🌍
> "It happens when two branches changed the **same lines**. Git can't decide which version is right, so it marks both.
> I open the file, decide what the correct combined code is (sometimes I ask the colleague who made the other change),
> remove the markers, run the tests, and commit."

### B12. 🟢 What is React? What are components, props and state? 👩‍🏫🌍
> "React is a JavaScript library for building user interfaces from **components**: small, reusable pieces like a button
> or a card. **Props** are inputs a parent gives to a child (read-only). **State** is data that a component remembers and
> that can change, like the text in an input. When state changes, React re-renders that part of the screen."

### B13. 🟡 What does `useEffect` do? 👩‍🏫
> "It runs code **after** the component renders, for side effects like loading data from an API or starting a timer.
> The **dependency array** controls when it runs again: `[]` = only once at the start; `[search]` = every time `search`
> changes. If you start a timer, you return a cleanup function to stop it."

### B14. 🟡 Why do lists in React need a `key`? Why shouldn't you change state directly? 👩‍🏫
> "The `key` (usually the id) helps React know which list item is which when the list changes, so it updates the right
> one. You must not change state directly (like `items.push(x)`), because React compares old and new state. If it's the
> same array, React thinks nothing changed and doesn't update the screen. So you create a **new** array: `[...items, x]`."

### B15. 🟢 FastAPI vs Flask: what's the difference? 📄
> "Both are Python web frameworks. **Flask** is minimal: you parse the request and validate the data yourself. **FastAPI**
> uses type hints and **Pydantic**, so it validates the input automatically (422 for bad data) and creates interactive docs
> at `/docs`. I mostly use FastAPI because of that validation, which mattered a lot for checking LLM output."

### B16. 🟢 What is a virtual environment (`venv`) and why use it? 🌍
> "It's a separate folder with its own Python packages for one project. Then project A can use one version of a library
> and project B another, without breaking each other. `requirements.txt` lists the packages so others can install the same ones."

---

# Part C: Fundamentals (medium) (14 questions)

### C1. 🟡 What is CORS? 🌍
> "It's a **browser** security rule. A page from one origin (like `localhost:5173`) may not read responses from another
> origin (`localhost:8000`) unless the server allows it with a header. You fix it on the **server** by allowing the
> frontend's origin, or you avoid it with a dev **proxy** so both look like the same origin."

### C2. 🟡 Where should you validate user input: frontend or backend? 🎓🌍
> "**Both, for different reasons.** In the frontend for a good user experience: fast feedback and a disabled button. In the
> **backend for correctness and security**, because anyone can skip the frontend and call the API directly."

### C3. 🟡 Authentication vs authorization? 🎓🌍
> "**Authentication** = *who are you?* (login). **Authorization** = *what are you allowed to do?* (e.g. only admins can
> delete). Not logged in → 401. Logged in but not allowed → 403."

### C4. 🟡 How should passwords be stored? 🎓
> "**Never in plain text.** Store a **hash** made with a slow password-hashing algorithm like bcrypt or Argon2, which also
> adds a random **salt**. At login you hash the entered password and compare. Even if the database leaks, the passwords
> aren't directly readable."

### C5. 🟡 What is SQL injection and how do you prevent it? 🎓
> "If you build SQL by pasting user input into a string, an attacker can type SQL code into the input field and run it
> on your database. You prevent it with **parameterised queries** (placeholders like `?`) or an ORM like SQLAlchemy,
> which escapes the values for you. Never use f-strings to build SQL."

### C6. 🟡 What other security basics do you keep in mind? 🎓
- Validate all input on the server; return clear but not too detailed errors.
- **Secrets** (API keys, passwords) go in environment variables, **never in Git**.
- Use HTTPS; protect endpoints with authentication (like the API key in JobFitAI).
- Don't trust prices or permissions sent by the frontend.
- Keep dependencies updated; give each user only the access they need.

### C7. 🟡 What kinds of tests do you know? What is the test pyramid? 🎓📄
> "**Unit tests** check one small piece, like a function that calculates a score. They're fast, so you have many.
> **Integration tests** check pieces working together, like an API endpoint with the database. **End-to-end tests** click
> through the real app in a browser. They're slow, so you have few. That's the pyramid: many unit tests, some integration,
> a few end-to-end. In JobFitAI I used pytest in CI."

### C8. 🟡 What makes a good test? What do you test? 🎓
> "A good test checks **one behaviour**, has a clear name, and is independent of other tests. I test the **happy path**,
> the **edge cases** (empty input, zero, the last seat) and the **error cases** (404, invalid data). The pattern is:
> arrange → act → assert."

### C9. 🟡 What is CI/CD? 🎓📄
> "**Continuous Integration**: every push automatically runs checks like linting, tests and the build, so problems are
> found early. **Continuous Delivery/Deployment**: if the checks pass, the app is automatically prepared or deployed.
> In JobFitAI, GitHub Actions ran Ruff, pytest and a Docker build on every push, and the app ran on Render."

### C10. 🟡 What is Docker and why use it? 📄
> "Docker packages the app **together with everything it needs** (Python version, libraries) into an **image**. A running
> image is a **container**. It runs the same on my laptop, in CI and on the server, so 'it works on my machine' problems
> go away."

### C11. 🟡 What does `async` / `await` do? 🌍
> "Some operations take time, like a network request. `await` waits for the result **without blocking** everything else.
> In JavaScript, `fetch` returns a *Promise*, and `await` gives you the result when it's ready. FastAPI can also use
> `async def` so the server can handle other requests while waiting."

### C12. 🟡 What does "idempotent" mean? 🌍
> "Doing the same request once or many times gives the same result. GET, PUT and DELETE should be idempotent: deleting the
> same item twice still leaves it deleted. POST is not: sending it twice creates two items. That's why double-clicking
> 'Submit' can create duplicates, unless you prevent it."

### C13. 🟡 How do you debug a problem in a full-stack app? 💬🌍
> "First I find **which layer** is broken. Open the browser DevTools: is there an error in the Console? In the Network tab,
> was the request sent, and what status came back? If it's a 4xx, the frontend sent something wrong. If it's a 5xx, I read
> the traceback in the backend terminal. If it's 200 but the screen is wrong, the frontend isn't using the data correctly.
> Then I reproduce it, change one thing, and check again."

### C14. 🟡 What makes code clean or maintainable? What do you look at in a code review? 👩‍🏫🌍
> "Clear names, small functions that do one thing, no copy-pasted logic, and following the **existing patterns** of the
> codebase. Tests for the important logic. In a review I check: does it do what the task asked? Does it handle errors and
> edge cases? Is it easy to understand for the next person? And I give feedback kindly and concretely, with a suggestion."

---

# Part D: Scenario and design questions (10 questions)

There's no single right answer here. They want to see **how you think**. Use this structure:
**clarify → users and core features → data → API → frontend → rules and edge cases → MVP first → tests and deploy → what's next.**

### D1. 🔴 How would you design a simple app to book meeting rooms at DPS? 👩‍🏫🎓
1. **Clarify:** who books (participants, coaches)? How long are bookings? Is a login needed?
2. **Core features for an MVP:** see free rooms for a day, book a slot, cancel my booking.
3. **Data:** `Room(id, name, capacity)`, `Booking(id, room_id, user_id, start, end)`, `User(id, name, email)`.
4. **API:** `GET /api/rooms?date=…` (with free slots), `POST /api/bookings`, `DELETE /api/bookings/{id}`.
5. **Rule:** no overlapping bookings for the same room → **409 Conflict**. Check it in the backend (and in the DB if possible).
6. **Frontend:** a day view with rooms × time slots; click a free slot → confirm.
7. **Then:** tests for the overlap rule, deploy, **ask real users** after a week, then add things like recurring bookings.

### D2. 🔴 A user says: "The app is slow." What do you do? 🌍
> "First **measure**, don't guess. Which page or action, and how slow? I check the Network tab: is it one slow API call or
> many calls? In the backend I look at timings or logs. Common causes: a database query without an **index**, too many
> queries in a loop, loading way more data than needed (fix with **pagination**), or a slow external API (fix with
> **caching**). Fix the biggest problem first, measure again."

### D3. 🔴 A bug is reported in production. What are your steps? 🌍
> "1) Understand the impact: how many users, how bad. 2) **Reproduce** it, locally if possible. 3) Check logs and recent
> changes. 4) Fix it with a **test that would have caught it**, get a quick review, deploy. 5) Tell the team and users what
> happened. 6) Afterwards: why did it get through, and what can we change (more tests, monitoring)?"

### D4. 🔴 The product manager gives you a vague request: "Users forget their tasks." What do you do? 🎓
> "I'd first ask questions: which users, in which situation, how do we know? Maybe talk to a few users. Then propose a
> **small first version** we can test quickly (e.g. a 'due date' and a highlighted 'overdue' list) instead of building a
> big notification system. Ship it, measure if it helps, then improve. That's build → measure → learn."
> (This is exactly project 10 in this repo.)

### D5. 🔴 Two users book the last seat at the same moment. What can go wrong? 🌍
> "Both requests might read '1 seat left' at the same time, and both succeed → overbooking. This is a **race condition**.
> Fix it in the database: do the check and the insert in one **transaction** with a lock, or use a **constraint**
> (e.g. unique seat numbers), so the second request fails cleanly and the user sees 'sold out'."

### D6. 🔴 Your app suddenly has 100× more users. What do you change? 🌍
> "First find the actual bottleneck by measuring. Typical steps: add **database indexes**, **cache** data that's read often,
> use **pagination**, move slow work (emails, AI calls) into a **background job queue**, and run **several copies of the
> backend** behind a **load balancer**, which works because REST servers are stateless. I wouldn't build all this on day one.
> For an MVP, simple is better."

### D7. 🔴 You need to choose a tech stack for a new MVP in 12 weeks. How do you decide? 👩‍🏫🎓
> "**Pragmatic choices:** what the team already knows, what's well documented, and what lets us ship and change things fast.
> For example: React for the frontend, FastAPI or Spring for the backend, PostgreSQL, deployed with Docker and CI from day
> one. I'd avoid adding complex things like microservices before we have users. Every choice is a trade-off we'll live
> with, so I'd write down *why* we chose it."

### D8. 🔴 Speed vs quality: when is a "quick fix" OK? 👩‍🏫
> "A quick fix is fine to unblock users or test an idea, **if we say it out loud and plan to clean it up**. Write it down
> as tech debt, maybe with a ticket. The danger is quick fixes that nobody remembers, which become a maintenance burden
> when real users depend on them. A few tests make later clean-ups much safer."

### D9. 🔴 How would you add an AI feature to a product responsibly? 📄💬
Your strength. Use your experience:
> "Start with the **user problem**, not the model. Then: **validate** the AI output (like Pydantic in JobFitAI) and never
> trust it blindly. Keep a **human in the loop** for important decisions. Think about **privacy**, because some data must not
> leave the company (my message pipeline ran fully locally for that reason). Plan a **fallback** when the AI fails,
> watch the **cost**, and **evaluate** quality with test cases (like I did in my thesis), not just by feeling."

### D10. 🔴 How would you structure a React app that keeps growing? 👩‍🏫
> "Split by responsibility: **components** that show things (props in, events out); **pages** or containers that own the
> state; all backend calls in one **api** module; shared helpers in one place. Keep state as low as possible and **lift it
> up** only when siblings need it. When many distant components need the same data, use **Context** or a library. Keep
> components small and the naming consistent."

---

# Part E: Agile, teamwork and product (6 questions)

### E1. 🟢 What is agile? What is Scrum? 🎓
> "**Agile** means building in small steps, getting feedback often, and adapting the plan. **Scrum** is one way to do it:
> work in short **sprints** (e.g. 1–2 weeks), with a short **daily stand-up**, a **sprint review** to show the result
> to users or stakeholders, and a **retrospective** to improve how the team works. Roles: Product Owner (what to build),
> Scrum Master (helps the process), and the developers."

### E2. 🟢 What is a user story? 🎓
> "A short description of a need from the user's view: *'As a librarian, I want to see overdue books first, so that I know
> whom to contact.'* It comes with **acceptance criteria**, clear conditions that tell us when it's done."

### E3. 🟢 What is an MVP? What is design thinking? What is lean startup? 🎓
- **MVP:** the smallest version of a product that lets you learn whether it solves the problem.
- **Design thinking:** understand the users (empathise) → define the problem → generate ideas → prototype → test with users.
- **Lean startup:** **build → measure → learn** in short loops, so you don't spend months building something nobody needs.

### E4. 🟡 How do you work with designers and product managers? 🎓
> "Early and often. I join user research when possible, give feedback on **technical feasibility** early (*'this is easy,
> this would take two weeks'*), and suggest simpler options. I build quick prototypes so we can test ideas with users.
> We decide together **what** to build; I'm responsible for building it well."

### E5. 🟡 What do you do if you disagree with a teammate about a technical decision? 🌍
> "I first make sure I understand their reasons, then explain mine with facts, like trade-offs or a quick experiment.
> We focus on what's best for the user and the goal, not on who's right. If we still disagree, we decide together, maybe
> with the coach, write the decision down, and I fully support it."

### E6. 🟡 How do you give and receive feedback in code reviews? 🌍
> "When I give feedback: about the code, not the person; specific; with a reason and a suggestion. Also mention what's
> good. When I receive it: I'm thankful, I ask if something is unclear, and I don't take it personally. Reviews are
> how a team learns."

---

# Questions YOU can ask at the end (pick 2)

- "What does a typical week look like for a software engineer in a DPS team?"
- "How do teams decide on their tech stack and architecture? Do coaches guide that?"
- "What do the most successful software engineers in the program do differently?"
- "How do the teams work with the industry partners during the 12 weeks?"
- "What's a technical decision from a past team that taught you something?" (fits Natalia's Demo Day post)

---

# Last-day checklist (Thu 29 Oct)

- [ ] Say A1 (*tell me about yourself*) out loud 3 times, under 90 seconds.
- [ ] One decision story (A5) and one "what I'd do differently" (A6) ready, with real examples.
- [ ] Answer A10 (*AI tools*) honestly. It fits the "minimal AI" rule of the live coding.
- [ ] Skim Part B and C once. Don't learn new things the night before.
- [ ] Two questions ready for them.
- [ ] Sleep. 😴

*Sources used to choose these questions:* the DPS invitation email and program page, Jahanvi's CV and motivation
letter, Nidhi's message, the interviewer's public LinkedIn profile and posts, and common junior software engineer and
REST API interview guides (e.g. [weekday.works](https://www.weekday.works/post/api-testing-interview-questions),
[browserless.io](https://www.browserless.io/blog/rest-api-interview-questions-answers),
[Indeed](https://in.indeed.com/career-advice/interviewing/software-engineer-interview-questions)).
