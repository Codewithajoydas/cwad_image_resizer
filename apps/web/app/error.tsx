"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page">
      <div className="container">
        <p className="eyebrow">Application error</p>
        <h1>Something went wrong.</h1>
        <p className="description">
          The application could not render this section. Try the operation again.
        </p>
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </main>
  );
}