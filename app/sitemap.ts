import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/curriculum", priority: 0.9, changeFrequency: "monthly" },
    { path: "/teachers", priority: 0.8, changeFrequency: "weekly" },
    { path: "/teach", priority: 0.7, changeFrequency: "monthly" },
    { path: "/donate", priority: 0.7, changeFrequency: "monthly" },
    { path: "/gallery", priority: 0.5, changeFrequency: "monthly" },
    { path: "/stories", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
    { path: "/register", priority: 0.6, changeFrequency: "yearly" },
    { path: "/login", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
