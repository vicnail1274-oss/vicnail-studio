import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://dkyiyjadlnpzbsjkpoly.supabase.co https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
      "frame-src 'self' https://www.googletagmanager.com https://www.youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
      // ECPay 付款 / 物流選店需要 form submit 到 ecpay 網域
      "form-action 'self' https://payment.ecpay.com.tw https://payment-stage.ecpay.com.tw https://logistics.ecpay.com.tw https://logistics-stage.ecpay.com.tw",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' is set via NEXT_OUTPUT env var during Cloudflare build
  ...(process.env.NEXT_OUTPUT === "export" && {
    output: "export",
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
