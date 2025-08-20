import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow external logo hosts
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // keep if you still use Unsplash demo images
      },
      {
        protocol: 'https',
        hostname: 'assets.leetcode.com',  // keep if you still use Unsplash demo images
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',// keep if you still use Unsplash demo images
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // keep if you still use Unsplash demo images
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', // keep if you still use Unsplash demo images
          },
      {
        protocol: 'https',
        hostname: 'www.psgtech.edu',
      }
    ],
  },
  /* config options here */
};

export default nextConfig;
