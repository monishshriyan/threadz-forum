"use client";

import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { PostVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
//import { toast } from "../../hooks/use-toast";
import { toast } from "sonner";

import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostVoteClientProps {
  postId: string;
  initialVotesAmt: number;
  initialVote?: VoteType | null;
}

const PostVoteClient = ({
  postId,
  initialVotesAmt,
  initialVote,
}: PostVoteClientProps) => {
  const { loginToast } = useCustomToasts();
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);
  const queryClient = useQueryClient();
  // ensure sync with server
  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: PostVoteRequest = {
        voteType: type,
        postId: postId,
      };

      await axios.patch("/api/subreddit/post/vote", payload);
    },
    onSuccess: () => {
      // Invalidate the "infinite-query" to trigger refetch in PostFeed
      queryClient.invalidateQueries(["infinite-query"]);
      // Optionally, you might want to refetch more specifically, if you have a better query key
      // For example, if you change query key to be subreddit-specific:
      // queryClient.invalidateQueries(["infinite-posts", subredditNameFromPostFeed]);

      return toast.info("Your vote has been recorded.");
    },
    onError: (err, voteType) => {
      if (voteType === "UP") setVotesAmt((prev) => prev - 1);
      else setVotesAmt((prev) => prev + 1);

      // reset current vote
      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return toast.error("You need to be logged in to do that");
        }
      }

      return toast.error("Something went wrong.");
    },
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        // User is voting the same way again, so remove their vote
        setCurrentVote(undefined);
        if (type === "UP") setVotesAmt((prev) => prev - 1);
        else if (type === "DOWN") setVotesAmt((prev) => prev + 1);
      } else {
        // User is voting in the opposite direction, so subtract 2
        setCurrentVote(type);
        if (type === "UP") setVotesAmt((prev) => prev + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setVotesAmt((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <div className="flex flex-col h-fit items-center justify-center gap-2 border rounded-lg mr-3">
      {/* upvote */}
      <Button
        onClick={() => vote("UP")}
        variant="ghost"
        aria-label="upvote"
        className="p-1"
      >
        <ArrowBigUp
          className={cn("text-muted-foreground hover:fill-emerald-500", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>

      {/* score */}
      <p className="text-center py-2 font-medium text-s text-muted-foreground">
        {votesAmt}
      </p>

      {/* downvote */}
      <Button
        onClick={() => vote("DOWN")}
        className="p-1"
        variant="ghost"
        aria-label="downvote"
      >
        <ArrowBigDown
          className={cn(" text-muted-foreground", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
