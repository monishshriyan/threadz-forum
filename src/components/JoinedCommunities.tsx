import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

const JoinedCommunities = async () => {
  const session = await getAuthSession();
  if (!session) return null;

  const followedCommunities = await db.subscription.findMany({
    where: { userId: session.user.id },
    include: { subreddit: true },
  });

  return (
    <div className="flex flex-wrap gap-1">
      {followedCommunities.map((subscription) => {
        const { subreddit } = subscription;
        return (
          <Link
            key={subreddit.id}
            href={`/r/${subreddit.name}`}
            className={buttonVariants({
              variant: "outline",
              className: "",
            })}
          >
            {subreddit.name}
          </Link>
        );
      })}
    </div>
  );
};

export default JoinedCommunities;
