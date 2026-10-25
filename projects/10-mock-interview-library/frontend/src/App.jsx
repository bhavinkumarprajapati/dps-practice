import { useState } from "react";
import BooksPage from "./pages/BooksPage.jsx";
import LoansPage from "./pages/LoansPage.jsx";

// A very small "router": the selected tab decides which page is rendered.
const TABS = [
  { key: "books", label: "📚 Books" },
  { key: "loans", label: "🔁 Loans" },
];

export default function App() {
  const [tab, setTab] = useState("books");

  return (
    <div className="container wide">
      <header className="app-header">
        <h1>City Library</h1>
        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Each page loads its own data when it is shown */}
      {tab === "books" && <BooksPage />}
      {tab === "loans" && <LoansPage />}
    </div>
  );
}
