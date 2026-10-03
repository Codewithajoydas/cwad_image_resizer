import Link from "next/link";

export function AppHeader() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div
        className="container"
        style={{
          minHeight: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ fontWeight: 800, textDecoration: "none" }}>
          CWAD
        </Link>

        <nav style={{ display: "flex", gap: 20 }}>
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}