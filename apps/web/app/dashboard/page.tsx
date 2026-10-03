import { StatusCard } from "@cwad/ui";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Application area</p>
        <h1>Dashboard</h1>
        <p className="description">
          This route demonstrates a normal server-rendered App Router page. Add domain-specific
          features under a dedicated feature boundary as the application grows.
        </p>

        <div className="grid">
          <StatusCard
            title="Server Component"
            value="Ready"
            description="No client-side JavaScript is required for this page."
          />
          <StatusCard
            title="API"
            value="Ready"
            description="Use Route Handlers for HTTP endpoints owned by this application."
          />
          <StatusCard
            title="Database"
            value="Optional"
            description="Add Prisma or another data capability only when required."
          />
        </div>
      </div>
    </main>
  );
}