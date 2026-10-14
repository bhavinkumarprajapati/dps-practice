# L5: TypeScript + React (≈ 1.5 h)

Same idea as L4, but with types. 40% of the practice projects use TypeScript, and the interview repo might too.

## Run it

```powershell
cd basics\L5-typescript
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # checks ALL types without running the app. Do this after each change!
```
Lesson 5 needs a backend on port 8000 (L2 or L3).

## What's different from JavaScript

| JavaScript | TypeScript |
|---|---|
| `.js` / `.jsx` | `.ts` / `.tsx` |
| `function Badge({ label })` | `function Badge({ label }: BadgeProps)` |
| `useState([])` | `useState<Book[]>([])` |
| `useState(null)` | `useState<Book \| null>(null)` |
| `function handleSubmit(e)` | `function handleSubmit(e: FormEvent<HTMLFormElement>)` |
| `async function getBooks()` | `async function getBooks(): Promise<Book[]>` |
| errors at runtime in the browser | many errors shown **in the editor** before running |

## Files

| File | Concept |
|---|---|
| `src/types.ts` | `interface`, `type`, union literals, `Omit`: shared API types |
| `lessons/Lesson1Types.tsx` | primitives, arrays, objects, optional `?`, unions, functions, generics, narrowing, `??`, `?.` |
| `lessons/Lesson2TypedProps.tsx` | props types, callback props `(id: number) => void`, `ReactNode` children |
| `lessons/Lesson3TypedState.tsx` | `useState<T>`, `T \| null`, union-typed state, `as` assertions |
| `lessons/Lesson4TypedEvents.tsx` | `ChangeEvent`, `FormEvent` and how to find types by hovering |
| `lessons/Lesson5TypedFetch.tsx` | typed API functions returning `Promise<T>`, `unknown` errors in catch |

## How to read TypeScript errors (important under interview stress)

```
Type 'string' is not assignable to type 'number'.
     ^^^^^^ what you gave          ^^^^^^ what was expected
```
```
Property 'pages' does not exist on type 'Book'.
→ you use a field that isn't in the interface. Add it to the type (if the backend sends it) or fix the typo.
```
```
'selected' is possibly 'null'.
→ check first:  if (selected) { ... }   or   selected?.title
```
```
Argument of type '"blue"' is not assignable to parameter of type '"green" | "red"'.
→ the value isn't in the union.
```

## Final challenge (30 min) 🟡

Do exercises a) and b) from Lesson 5: a Delete button with a typed `deleteBook(id: number): Promise<void>`,
and a typed form that uses `createBook(newBook: NewBook)`. `npm run typecheck` must pass with **0 errors**.
