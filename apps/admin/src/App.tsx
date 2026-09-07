import { useState } from "react";

const sections = ["Dashboard", "Products", "Orders", "Customers", "Coupons", "Delivery Zones", "Messages", "Reviews", "Returns", "Banners", "Reports", "Audit Logs"];

export default function App() {
  const [section, setSection] = useState("Dashboard");

  return (
    <div className="admin-shell">
      <aside>
        <div className="brand">RamjanStore <span>Admin</span></div>
        <nav aria-label="Admin navigation">
          {sections.map((item) => (
            <button key={item} className={item === section ? "active" : ""} onClick={() => setSection(item)}>
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <main>
        <header><h1>{section}</h1><span className="role">Owner</span></header>
        <section className="placeholder" aria-live="polite">
          <h2>{section}</h2>
          <p>The admin foundation is ready. Feature modules will be wired into this protected surface in the next implementation phase.</p>
        </section>
      </main>
    </div>
  );
}
