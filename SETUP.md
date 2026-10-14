# Setup on Windows (do this once, ~45 min)

Every project in this repo uses the same setup. **Backend:** Python on port **8000**. **Frontend:** React + Vite on port **5173**.

## 1. Install the tools

| Tool | Version | Download | Notes |
|---|---|---|---|
| Git | latest | https://git-scm.com/download/win | Keep the defaults. This also installs **Git Bash**. |
| Python | **3.12 or 3.13** | https://www.python.org/downloads/windows/ | ⚠️ Tick **"Add python.exe to PATH"** on the first installer screen. |
| Node.js | **22 LTS** | https://nodejs.org | The LTS version. It includes `npm`. |
| VS Code | latest | https://code.visualstudio.com | Extensions: **Python** (Microsoft), **Pylance**, **ES7+ React snippets** (optional) |

Then open a **new** PowerShell window and check:

```powershell
git --version
python --version     # Python 3.12.x or 3.13.x
node -v              # v22.x
npm -v
```

> ❗ If `python` opens the Microsoft Store: go to Settings → Apps → Advanced app settings →
> **App execution aliases** → turn **off** both "python.exe" and "python3.exe". Then reopen the terminal.

## 2. Allow PowerShell to activate virtual environments (one time)

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
Answer `Y`. Without this, `.venv\Scripts\Activate.ps1` fails with *"running scripts is disabled on this system"*.

## 3. Clone this repo

```powershell
cd $HOME\Documents
git clone https://github.com/bhavinkumarprajapati/dps-practice.git
cd dps-practice
code .
```

## 4. Run any backend (Python)

Example for `basics/L2-fastapi`. Every project's README gives the exact folder and command.

```powershell
cd basics\L2-fastapi
python -m venv .venv              # create a virtual environment (once per project)
.\.venv\Scripts\Activate.ps1      # activate it; your prompt now starts with (.venv)
pip install -r requirements.txt   # install the dependencies
uvicorn main:app --reload --port 8000
```

**Activation in other terminals:**

| Terminal | Command |
|---|---|
| PowerShell | `.\.venv\Scripts\Activate.ps1` |
| cmd.exe | `.venv\Scripts\activate.bat` |
| Git Bash | `source .venv/Scripts/activate` |

Run `deactivate` to leave the virtual environment.

> 💡 VS Code: press `Ctrl+Shift+P` → "Python: Select Interpreter" → choose the `.venv` one.
> New terminals in VS Code will then activate it automatically.

## 5. Run any frontend (React)

Open a **second** terminal. In VS Code, click the split icon in the terminal panel.

```powershell
cd basics\L4-react
npm install        # once, creates node_modules
npm run dev        # starts http://localhost:5173
```

The frontend forwards every request that starts with `/api` to `http://localhost:8000`.
This is the **Vite proxy**, set in `vite.config.js`, so **start the backend first**.

## 6. Run the tests

```powershell
# in the backend folder, with .venv active
pytest -v
```

## 7. Common errors and fixes

| Error | Cause | Fix |
|---|---|---|
| `ModuleNotFoundError: No module named 'fastapi'` | venv not active | Activate `.venv`, then `pip install -r requirements.txt` |
| `'uvicorn' is not recognized` | venv not active | Same as above, or run `python -m uvicorn main:app --reload` |
| `[Errno 10048] ... address already in use` / port 8000 busy | an old server is still running | `netstat -ano \| findstr :8000` then `taskkill /PID <pid> /F` |
| `'vite' is not recognized` | forgot `npm install` | `npm install` |
| Browser shows `Failed to fetch` or `500` on `/api/...` | backend not running | Start the backend, then refresh |
| `CORS policy` error in the console | frontend called `http://localhost:8000` directly | Call `/api/...` (relative URL) so the proxy is used, or enable CORS in the backend |
| `npm ERR!` weird install errors | broken `node_modules` | Delete `node_modules` and `package-lock.json`, then `npm install` |

## 8. Git habits for practice

```powershell
git checkout -b practice/01       # one branch per practice attempt
git status                        # what changed?
git diff                          # show the changes
git add -A
git commit -m "Add decrement button"
git checkout main                 # go back to the clean starter code
git branch -D practice/01         # delete the attempt and start fresh
```
