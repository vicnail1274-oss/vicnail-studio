---
title: "CORS Errors Explained: How to Fix Them for Good"
description: "Understand what CORS errors are, why browsers enforce them, and how to fix them in Express, FastAPI, Next.js, and other frameworks. Includes common debugging tips."
keywords: ["cors errors explained", "how to fix cors error", "cors error javascript", "enable cors express", "cors policy error fix"]
canonical: "https://devplaybook.cc/blog/cors-errors-explained"
date: "2025-03-20"
tags: ["cors", "security", "http", "backend", "javascript"]
slug: "cors-errors-explained"
---

# CORS Errors Explained: How to Fix Them for Good

```
Access to fetch at 'https://api.example.com/data' from origin 'https://app.example.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

Every web developer has seen this error. CORS (Cross-Origin Resource Sharing) is a browser security mechanism, not a bug. Understanding *why* it exists and how it works makes fixing it straightforward.

---

## Why CORS Exists: The Same-Origin Policy

Browsers enforce the **Same-Origin Policy** (SOP): a script from `https://app.example.com` cannot read responses from `https://api.other.com`. Without this, malicious sites could silently make authenticated requests to your bank's API using your stored cookies.

CORS is the **controlled relaxation** of SOP — it lets servers declare which origins they allow.

Two URLs have the same origin if they share the same **protocol + hostname + port**:

```
https://app.example.com        ← origin
https://app.example.com/api    ← same origin (only path differs)
http://app.example.com         ← different (http vs https)
https://api.example.com        ← different (subdomain)
https://app.example.com:3001   ← different (port)
```

---

## Simple vs Preflight Requests

CORS treats requests differently based on their complexity.

### Simple Requests

A request is "simple" if it meets all these criteria:
- Method: `GET`, `POST`, or `HEAD`
- Content-Type: `text/plain`, `multipart/form-data`, or `application/x-www-form-urlencoded`
- No custom headers

For simple requests, the browser sends the request, includes the `Origin` header, and checks if the response has the right `Access-Control-Allow-Origin` header.

### Preflight Requests

For anything else — `PUT`, `DELETE`, `PATCH`, JSON content-type, custom headers — the browser first sends an `OPTIONS` request (the "preflight") to ask the server if the actual request is allowed.

```
Preflight:
OPTIONS /api/users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, Authorization

Server must respond:
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

If the preflight succeeds, the actual request proceeds. If not, you get the CORS error.

---

## The Key Response Headers

| Header | Purpose | Example Value |
|--------|---------|---------------|
| `Access-Control-Allow-Origin` | Which origins are allowed | `https://app.example.com` or `*` |
| `Access-Control-Allow-Methods` | Allowed HTTP methods | `GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | Allowed request headers | `Content-Type, Authorization` |
| `Access-Control-Allow-Credentials` | Allow cookies/auth headers | `true` |
| `Access-Control-Max-Age` | Cache preflight for N seconds | `86400` |

---

## How to Fix CORS: By Framework

### Express.js (Node.js)

```bash
npm install cors
```

```javascript
import express from 'express';
import cors from 'cors';

const app = express();

// Option 1: Allow all origins (development only — never use in production)
app.use(cors());

// Option 2: Specific origins (production)
app.use(cors({
  origin: ['https://app.example.com', 'https://www.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Required if using cookies or Authorization headers
  maxAge: 86400,      // Cache preflight for 24 hours
}));

// Option 3: Dynamic origin (multi-tenant apps)
const allowedOrigins = new Set(['https://app.example.com', 'https://partner.io']);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

### FastAPI (Python)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],  # Or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Next.js API Routes

```javascript
// pages/api/data.js or app/api/data/route.js

// App Router (Next.js 13+)
export async function GET(request) {
  return new Response(JSON.stringify({ data: 'hello' }), {
    headers: {
      'Access-Control-Allow-Origin': 'https://app.example.com',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Content-Type': 'application/json',
    },
  });
}

// Handle preflight
export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://app.example.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

Or use `next.config.mjs`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://app.example.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### Nginx Reverse Proxy

Handle CORS in Nginx instead of application code:

```nginx
server {
    location /api/ {
        proxy_pass http://backend:3000;

        add_header 'Access-Control-Allow-Origin' 'https://app.example.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # Handle preflight
        if ($request_method = OPTIONS) {
            add_header 'Access-Control-Max-Age' 86400;
            return 204;
        }
    }
}
```

---

## Common Mistakes That Keep CORS Broken

### 1. Using `*` with `credentials: true`

This is **not allowed** by the spec:

```javascript
// This will fail:
app.use(cors({
  origin: '*',
  credentials: true,  // Cannot combine with wildcard origin
}));
```

When credentials are involved, you must specify exact origins.

### 2. Missing the Preflight Handler

If your endpoint handles `POST /api/data` but not `OPTIONS /api/data`, authenticated requests with JSON bodies will fail the preflight and never reach your handler.

```javascript
// Make sure OPTIONS is handled:
app.options('*', cors());  // Enable preflight for all routes
app.use(cors(corsOptions));
```

### 3. CORS Set After Route Definitions

Middleware order matters in Express:

```javascript
// Wrong — routes are registered before cors middleware applies
app.get('/api/data', handler);
app.use(cors());  // Too late

// Correct
app.use(cors());
app.get('/api/data', handler);
```

### 4. Missing `Authorization` in `allowedHeaders`

If your client sends `Authorization: Bearer <token>`, you must include it:

```javascript
app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],  // Don't forget Authorization
}));
```

### 5. HTTP vs HTTPS Mismatch

`http://localhost:3000` and `https://localhost:3000` are different origins. Ensure your allowed origins list matches exactly.

---

## Development Workarounds

### Browser DevTools Disable (Temporary)

Not for production use — only for isolated debugging:

```bash
# Chrome with CORS disabled (Mac)
open -n -a /Applications/Google\ Chrome.app --args --disable-web-security --user-data-dir=/tmp/chrome_dev

# Chrome with CORS disabled (Windows)
chrome.exe --disable-web-security --user-data-dir=%TEMP%\chrome_dev
```

### Proxy via Development Server

Avoid CORS in development by proxying requests:

```javascript
// Vite vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
};
```

```javascript
// Create React App package.json
{
  "proxy": "http://localhost:3001"
}
```

Now `fetch('/api/data')` goes to `localhost:3001/api/data` without any cross-origin issues.

---

## Debugging Checklist

When you hit a CORS error:

1. **Check the browser console** — the error message tells you which header is missing
2. **Inspect the Network tab** — look at the Response Headers for `Access-Control-Allow-Origin`
3. **Check for preflight** — filter by `OPTIONS` requests in the Network tab
4. **Verify the exact origin** — protocol, hostname, and port must all match
5. **Test with curl** — `curl -I -H "Origin: https://app.example.com" https://api.example.com/data` — CORS is browser-only; curl doesn't enforce it
6. **Check middleware order** — CORS middleware must come before route handlers
7. **Check credentials configuration** — `credentials: true` requires explicit origins, not `*`

---

## Summary

- CORS is a browser-enforced security feature, not a bug
- The server must return `Access-Control-Allow-Origin` for the browser to accept the response
- Preflight (`OPTIONS`) requests run before non-simple requests — handle them
- Never use `origin: '*'` with `credentials: true`
- In development, use a proxy instead of disabling CORS
- In production, always specify exact allowed origins

---

Format and inspect your API response headers at [devplaybook.cc](https://devplaybook.cc).
