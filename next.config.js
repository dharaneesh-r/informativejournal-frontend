/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static1.straitstimes.com.sg",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imgs.search.brave.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.etimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.financialexpress.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.moneycontrol.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.moneycontrol.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cassette.sphdigital.com.sg",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "newwss.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },

  // Add the rewrites configuration for sitemap
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination:
          "https://informativejournal-backend.vercel.app/sitemap.xml",
      },
      {
        source: "/rss.xml",
        destination: "https://informativejournal-backend.vercel.app/rss.xml",
      },
    ];
  },
};

module.exports = nextConfig;
