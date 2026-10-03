import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1>Page not found.</h1>
        <p className="description">The page you requested does not exist.</p>
        <Link href="/">Return home</Link>
      </div>
    </main>
  );
}