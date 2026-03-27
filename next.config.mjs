const allowedDevOrigins = [
  process.env.DEV_HOST,
  "127.0.0.1",
  "localhost",
].filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
