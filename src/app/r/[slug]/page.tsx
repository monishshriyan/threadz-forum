import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Metadata } from "next";
import { notFound } from "next/navigation";
type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `r/${slug}`,
    description: `Community page for r/${slug}`,
  };
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const session = await getAuthSession();
  const { slug } = params;

  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true,
        },
        orderBy: { createdAt: "desc" },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });

  if (!subreddit) return notFound();

  return (
    <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />
  );
}
