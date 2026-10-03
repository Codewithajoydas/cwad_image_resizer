import Link from "next/link";
import { StatusCard } from "@cwad/ui";

export default function HomePage() {
  return (
    <main className="page">
      <div className="container hero">
        <p className="eyebrow">CWAD Next.js Monorepo</p>
        <h1>Build the product, not the boilerplate.</h1>
        <p className="description">
          Next.js App Router, typed Route Handlers, shared packages, validation, testing,
          workspace orchestration, and production-ready boundaries are already configured.
        </p>

        <div className="grid">
          <StatusCard
            title="Runtime"
            value="Next.js"
            description="Server Components and Route Handlers are ready."
          />
          <StatusCard
            title="Contracts"
            value="Shared"
            description="Types and validation can be shared across domains."
          />
          <StatusCard
            title="Tooling"
            value="Turbo"
            description="Build, test, lint, and typecheck from the root."
          />
        </div>

        <p style={{ marginTop: 32 }}>
          <Link href="/dashboard">Open dashboard →</Link>
        </p>
      </div>
    </main>
  );
}