import type { CSSProperties, ReactNode } from "react";

type StatusCardProps = {
  title: string;
  value: string;
  description: string;
};

export function StatusCard({ title, value, description }: StatusCardProps) {
  const style: CSSProperties = {
    padding: 24,
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#ffffff",
  };

  return (
    <article style={style}>
      <strong>{title}</strong>
      <h2>{value}</h2>
      <p style={{ color: "#64748b" }}>{description}</p>
    </article>
  );
}

export function Stack({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}