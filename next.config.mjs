/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/revise", destination: "/", permanent: false },
      { source: "/important", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
