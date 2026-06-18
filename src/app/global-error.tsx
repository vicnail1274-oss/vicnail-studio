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
    <html lang="zh-TW">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#FFF8F0",
          color: "#1a1a1a",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>
          發生錯誤 Something went wrong
        </h1>
        <p style={{ color: "#666", marginTop: "1rem", maxWidth: "28rem" }}>
          系統發生未預期的錯誤，請重新載入頁面。
          <br />
          An unexpected error occurred. Please reload the page.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 2rem",
            background: "#B76E79",
            border: "none",
            borderRadius: "9999px",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          重新載入 / Reload
        </button>
      </body>
    </html>
  );
}
