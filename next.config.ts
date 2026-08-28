import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const githubPagesUrl = "https://maxi-max-dev.github.io/cute-fridge-demo";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: "",
  assetPrefix: isGitHubPages ? githubPagesUrl : "",
  trailingSlash: isGitHubPages,
};

export default nextConfig;
