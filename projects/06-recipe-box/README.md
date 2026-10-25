# 06: Recipe Box 🟡

**Stack:** Flask + React (JavaScript) · **Total time:** ~75 min · **Concepts:** **adding a field end-to-end** (the #1
interview task), manual validation in Flask, query-param filters, PATCH, derived sorting in React

## The app

A recipe collection stored in memory in a **Flask** backend. You can list, add and delete recipes.
The form uses **one state object** for all fields and **one change handler**. Look at how `RecipeForm.jsx` does that.

```
06-recipe-box/
├── backend/
│   ├── app.py              ← routes + validate_recipe()
│   └── test_app.py
└── frontend/src/
    ├── api.js
    ├── App.jsx             ← owns the recipes list
    └── components/
        ├── RecipeForm.jsx  ← form → onCreate(recipe) → shows backend errors
        └── RecipeCard.jsx  ← one recipe
```

**API right now**

| Method | URL | Body | Response |
|---|---|---|---|
| GET | `/api/recipes` | – | `200` list |
| GET | `/api/recipes/<id>` | – | `200` · `404` |
| POST | `/api/recipes` | `{title, ingredients: [..], servings, vegetarian}` | `201` · `400 {"detail": "..."}` |
| DELETE | `/api/recipes/<id>` | – | `204` · `404` |

## Run it

```powershell
# Terminal 1
cd projects\06-recipe-box\backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
flask --app app run --debug --port 8000

# Terminal 2
cd projects\06-recipe-box\frontend
npm install
npm run dev
```

## Before you start (5 min, no coding)

1. Add a recipe with **no ingredients**. Trace where the error message comes from, all the way to the screen.
2. Explain in one sentence what `[name]: value` does inside `handleChange`.

---

## Tasks

Restate each task out loud, say your plan, then start the timer.

### Task 1: Cooking time, end-to-end (25 min) ← the classic interview task
> *"Users want to know how long a recipe takes."*

- Every recipe has `cooking_time`: whole minutes, **1–600**. Give the 4 existing recipes realistic values.
- POST without a valid `cooking_time` → **400** `{"detail": "cooking_time must be a whole number between 1 and 600"}`.
- The form gets a **Cooking time (min)** number input. The card shows `⏱ 25 min`.
- Tests: create with `cooking_time` works; `cooking_time: 0` → 400.

✅ Done when: you can add a recipe with a time and see it; a wrong time shows the backend's message in the form.

### Task 2: Filters (20 min)
> *"I'm hungry now. Show me quick vegetarian recipes."*

- Backend: `GET /api/recipes?max_time=30&vegetarian=true`
  - `max_time` → only recipes with `cooking_time <= max_time`. Not a positive number → **400** `"max_time must be a positive number"`.
  - `vegetarian=true` → only vegetarian recipes. (`false` or missing → no filter.)
- Frontend: two checkboxes above the list: **Quick (≤ 30 min)** and **Vegetarian only**. Changing one re-fetches.
- Empty result: `No recipes match your filters.`

### Task 3: Favourites (20 min)
> *"I want my favourite recipes at the top."*

- Every recipe has `favorite` (bool, default `false`, not sent by the form).
- `PATCH /api/recipes/<id>` with `{"favorite": true}` → **200** + the updated recipe. Not a bool → **400**.
- Each card gets a ☆/★ button that toggles it.
- Favourites are shown **first**. Sort in the frontend, without changing the order stored in state.

### Bonus
- `?ingredient=onion` returns only recipes containing that ingredient (case-insensitive).

---

## Interviewer follow-up questions (answer out loud after you finish)
1. Why do you validate `cooking_time` in the **backend**, if the form already has a number input?
2. Why is `isinstance(x, bool)` checked separately from `isinstance(x, int)` in Python?
3. You sorted favourites in the frontend. When would you sort in the backend instead?
4. What happens to recipes created **before** you added `cooking_time`, if this were a real database?

---

<details><summary>💡 Hints</summary>

- Task 1, the order: seed data → `validate_recipe` → the dict in `create_recipe` → **test with pytest** → form state
  (`EMPTY_FORM`) + input with `name="cooking_time"` → `Number(...)` when building the recipe → card.
- Task 2: `request.args.get("max_time")` is a **string**. `int(...)` in a `try/except ValueError` → `abort(400, ...)`.
  React: `useEffect(() => {...}, [quickOnly, vegOnly])` and `new URLSearchParams()`.
- Task 3: sort a **copy**: `[...recipes].sort((a, b) => Number(b.favorite) - Number(a.favorite))`.
</details>

**Reference solution:** not in this branch. When you have finished all tasks, ask your mentor for the review / solution.
