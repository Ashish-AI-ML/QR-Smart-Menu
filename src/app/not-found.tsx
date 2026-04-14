import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "var(--space-6)",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "var(--space-4)" }}>🍽️</div>
      <h1 className="heading-2" style={{ marginBottom: "var(--space-3)" }}>
        Page Not Found
      </h1>
      <p className="text-muted" style={{ marginBottom: "var(--space-6)", maxWidth: "360px" }}>
        The page you&apos;re looking for doesn&apos;t exist. It might have been
        moved or the URL might be incorrect.
      </p>
      <Link href="/" className="btn btn-primary">
        Go to Homepage
      </Link>
    </main>
  );
}
