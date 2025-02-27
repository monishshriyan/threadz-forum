import ClientSubmitPost from "@/components/ClientSubmitPost";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import JoinToast from "@/components/JoinToast";

interface PageProps {
  params: {
    slug: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const subreddit = await db.subreddit.findFirst({
    where: {
      name: params.slug,
    },
  });

  if (!subreddit) return notFound();

  // Get the current session.
  const session = await getAuthSession();

  // Look up subscription if user is logged in.
  const subscription = session
    ? await db.subscription.findFirst({
        where: {
          subreddit: {
            name: params.slug,
          },
          user: {
            id: session.user.id,
          },
        },
      })
    : null;

  if (!subscription) {
    return <JoinToast message="Join the community to post" />;
  }

  return (
    <div className="flex flex-col items-start gap-6">
      {/* form */}
      <ClientSubmitPost subredditId={subreddit.id} />
    </div>
  );
};

export default Page;
