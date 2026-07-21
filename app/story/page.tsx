import type { Metadata } from "next";
import { peekTitleTone } from "@/lib/share";
import { StoryClient } from "./StoryClient";

type SearchParams = Promise<{ s?: string }>;

// A shared link carries the narrative in the URL, so the social preview can be
// personalized to the actual week. Direct in-app navigations get the default.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { s } = await searchParams;
  const peek = s ? peekTitleTone(s) : null;

  if (!peek || !peek.title) {
    return {
      title: "A week, read by Arc",
      description: "A one of a kind site, generated from a real week.",
    };
  }

  const title = `${peek.title} / read by Arc`;
  const description = "A one of a kind site, generated from a real week.";
  const ogImage = `/api/og?t=${encodeURIComponent(peek.title)}&k=${encodeURIComponent(peek.tone)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function StoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { s } = await searchParams;
  return <StoryClient shared={s} />;
}
