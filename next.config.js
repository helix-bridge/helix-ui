/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "/packages/apps/.next",
  webpack: (config) => {
    config.externals.push("lokijs", "encoding", "pino-pretty");
    return config;
  },
};

module.exports = nextConfig;
