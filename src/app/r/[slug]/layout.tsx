import CreateCommunity from "@/components/CreateCommunity";
import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import ToFeedButton from "@/components/ToFeedButton";
import { buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/Card";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Threadz",
  description: "A community platform built with Next.js and TypeScript.",
};

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

const Layout = async ({ children, params }: LayoutProps) => {
  const { slug } = await params;
  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });
  const isUserLoggedIn = !!session?.user;

  const subscription = isUserLoggedIn
    ? await db.subscription.findFirst({
        where: {
          subreddit: {
            name: slug,
          },
          user: {
            id: session.user.id,
          },
        },
      })
    : undefined;

  const isSubscribed = !!subscription;

  if (!subreddit) return notFound();

  const memberCount = await db.subscription.count({
    where: {
      subreddit: {
        name: slug,
      },
    },
  });

  return (
    <div className="sm:container max-w-7xl mx-auto h-full mt-3">
      <div>
        <div className="flex flex-col md:flex-row justify-between gap-y-4 md:gap-x-4 py-6">
          <Card className=" h-fit rounded-lg border bg-transparent border-none">
            <CardHeader className="text-3xl font-extrabold p-0 m-0">
              r/{subreddit.name}
            </CardHeader>
            <CardDescription className="text-muted-foreground">
              <div className="flex flex-col gap-2">
                <p>
                  Your personal Threadz frontpage. Come here to check in with
                  your favorite communities.
                </p>
                <ToFeedButton />
              </div>
            </CardDescription>
          </Card>
          <ul className="flex flex-col col-span-2 space-y-6 w-full">
            {children}
          </ul>

          {/* info sidebar */}

          <Card className=" h-fit rounded-lg w-full">
            <CardHeader className="text-3xl font-extrabold">
              About r/{subreddit.name}
            </CardHeader>
            <CardDescription className="px-6">
              {subreddit.creatorId === session?.user?.id
                ? "You created this community :)"
                : null}
            </CardDescription>
            <CardContent className="divide-y divide-muted px-6 text-sm leading-6 w-full">
              <div className="flex justify-between py-3">
                <p className="">Created</p>
                <p className="text-muted-foreground">
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, "MMMM d, yyyy")}
                  </time>
                </p>
              </div>
              <div className="flex justify-between py-3 w-full">
                <p className="">Members</p>
                <p className="flex items-start gap-x-2 text-muted-foreground">
                  {memberCount}
                </p>
              </div>

              {isUserLoggedIn && ( // Only render if logged in
                <SubscribeLeaveToggle
                  isSubscribed={isSubscribed}
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                />
              )}
              <Link
                className={buttonVariants({
                  className: "w-full",
                })}
                href={`/r/${slug}/submit`}
              >
                Create Post
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Layout;
