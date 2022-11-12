const { IMAGES_MANIFEST } = require("next/dist/shared/lib/constants");

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        loader: "akamai",
        path: "",
    },
    reactStrictMode: true,
    swcMinify: true,
};

module.exports = nextConfig;
