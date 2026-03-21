import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | VicNail Studio",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          background: "#fdf8f5",
          color: "#1a1a1a",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "6rem", fontWeight: 700, margin: 0, lineHeight: 1 }}>
          404
        </h1>
        <p style={{ fontSize: "1.25rem", marginTop: "1rem", color: "#666" }}>
          Page not found
        </p>
        <p style={{ color: "#999", marginTop: "0.5rem" }}>
          找不到這個頁面
        </p>
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
          <Link
            href="/zh-TW"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#e8c5b0",
              borderRadius: "0.5rem",
              textDecoration: "none",
              color: "#1a1a1a",
              fontWeight: 500,
            }}
          >
            中文首頁
          </Link>
          <Link
            href="/en"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#e8c5b0",
              borderRadius: "0.5rem",
              textDecoration: "none",
              color: "#1a1a1a",
              fontWeight: 500,
            }}
          >
            English Home
          </Link>
        </div>
      </body>
    </html>
  );
}
