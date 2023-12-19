/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("lokijs", "encoding", "pino-pretty");
    return config;
  },
};

module.exports = nextConfig;
