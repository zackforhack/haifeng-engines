import type { NextConfig } from "next";

const SUPABASE_PDF_BASE =
  "https://ntrysdovwnbegxtjsqkz.supabase.co/storage/v1/object/public/engine-pdfs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Mask spec-sheet PDFs under our own domain: /specsheets/<path> transparently
  // proxies to the Supabase storage bucket, so visitors and search engines see
  // engines.haifengmachinery.com URLs instead of the raw Supabase host.
  async rewrites() {
    return [
      {
        source: "/specsheets/:path*",
        destination: `${SUPABASE_PDF_BASE}/:path*`,
      },
    ];
  },
};

export default nextConfig;
