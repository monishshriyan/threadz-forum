import CreateCommunity from "@/components/CreateCommunity";
import JoinedCommunities from "@/components/JoinedCommunities";
import CustomFeed from "@/components/homepage/CustomFeed";
import GeneralFeed from "@/components/homepage/GeneralFeed";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/Card";
import { getAuthSession } from "@/lib/auth";
import type {} from "ldrs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const session = await getAuthSession();
  const joinedCommunities = await JoinedCommunities();

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between gap-y-4 md:gap-x-4 py-6 mt-4 w-full">
        <Card className=" h-fit rounded-lg border bg-transparent border-none">
          <CardHeader className="text-3xl font-extrabold p-0 m-0">
            Your Feed
          </CardHeader>
          <CardDescription className="text-muted-foreground">
            Your personal Threadz frontpage. Come here to check in with your
            favorite communities.
            <CreateCommunity />
          </CardDescription>
        </Card>

        <div className="w-full">
          {/* @ts-expect-error server component */}
          {session ? <CustomFeed /> : <GeneralFeed />}
        </div>

        <Card className="h-fit">
          <CardHeader className="text-3xl font-extrabold">
            Joined Communities
          </CardHeader>
          <CardContent className="px-3 text-muted-foreground">
            {joinedCommunities}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
