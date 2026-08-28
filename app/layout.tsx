import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-static";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? "/cute-fridge-demo" : "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bingxiang-jintian-chi-shenme.maxorila.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "冰箱今天吃什么｜冰箱决策助手",
  description: "看看冰箱里有什么、什么快过期、今晚能做什么。",
  icons: { icon: `${basePath}/favicon.png`, shortcut: `${basePath}/favicon.png` },
  openGraph: {
    title: "冰箱今天吃什么",
    description: "先吃快过期的，今晚不再猜。",
    type: "website",
    images: [{ url: `${basePath}/og.png`, width: 1200, height: 630, alt: "冰箱今天吃什么" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "冰箱今天吃什么",
    description: "先吃快过期的，今晚不再猜。",
    images: [`${basePath}/og.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
