import type { NextConfig } from "next";

// Fully static site: `next build` writes plain HTML/CSS/JS to `out/`, which
// is uploaded to All-Inkl (.github/workflows/deploy-allinkl.yml). No server code.
const nextConfig: NextConfig = {
  output: "export",
  // Folders with index.html (`/bild/IMG_2801/index.html`), so URLs work on
  // any static host without rewrite rules.
  trailingSlash: true,
  images: { unoptimized: true },
  // Legacy-URL redirects cannot live here with `output: "export"`; they go
  // into the web server config (public/.htaccess) at cutover.
};

export default nextConfig;
