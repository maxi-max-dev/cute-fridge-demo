import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);

  return {
    metadataBase: base,
    title: "冰箱今天吃什么｜冰箱决策助手",
    description: "看看冰箱里有什么、什么快过期、今晚能做什么。",
    icons: { icon: "/favicon.png", shortcut: "/favicon.png" },
    openGraph: {
      title: "冰箱今天吃什么",
      description: "先吃快过期的，今晚不再猜。",
      type: "website",
      images: [{ url: new URL("/og.png", base), width: 1200, height: 630, alt: "冰箱今天吃什么" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "冰箱今天吃什么",
      description: "先吃快过期的，今晚不再猜。",
      images: [new URL("/og.png", base)],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
