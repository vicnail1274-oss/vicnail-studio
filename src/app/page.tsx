// Root page: meta-refresh redirect for static export compatibility
export default function RootPage() {
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content="0;url=/zh-TW/" />
        <title>Redirecting...</title>
      </head>
      <body>
        <p>
          Redirecting to <a href="/zh-TW/">VicNail Studio</a>...
        </p>
      </body>
    </html>
  );
}
