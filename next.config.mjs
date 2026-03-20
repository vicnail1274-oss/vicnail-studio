import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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
};

export default withNextIntl(nextConfig);
