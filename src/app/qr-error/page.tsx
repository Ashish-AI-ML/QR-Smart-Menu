import Link from "next/link";

export default function QrErrorPage() {
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
      <div style={{ fontSize: "4rem", marginBottom: "var(--space-4)" }}>📱</div>
      <h1 className="heading-2" style={{ marginBottom: "var(--space-3)" }}>
        Invalid QR Code
      </h1>
      <p
        className="text-muted"
        style={{ marginBottom: "var(--space-6)", maxWidth: "360px" }}
      >
        This QR code is no longer active or doesn&apos;t exist. Please ask
        your server for a working QR code or visit the restaurant&apos;s menu
        directly.
      </p>
      <Link href="/" className="btn btn-primary">
        Go to Homepage
      </Link>
    </main>
  );
}
