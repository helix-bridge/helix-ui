/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack: (config) => {
    config.externals.push("lokijs", "encoding", "pino-pretty");
    return config;
  },
};

module.exports = nextConfig;
