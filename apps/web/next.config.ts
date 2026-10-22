import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep legacy CodeIgniter URLs working (bookmarks, search engines).
  async redirects() {
    return [
      {
        source: "/blog/page/:page(\\d+)",
        destination: "/blog?page=:page",
        permanent: true,
      },
      {
        source: "/album/tag/:tag",
        destination: "/tag/:tag",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
