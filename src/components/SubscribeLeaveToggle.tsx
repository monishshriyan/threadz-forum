"use client";
import { Button } from "@/components/ui/Button";
import { SubscribeToSubredditPayload } from "@/lib/validators/subreddit";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
//import { useToast } from '../hooks/use-toast'
import { toast } from "sonner";
import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { Loader2 } from "lucide-react";

interface SubscribeLeaveToggleProps {
  isSubscribed: boolean;
  subredditId: string;
  subredditName: string;
}

const SubscribeLeaveToggle = ({
  isSubscribed,
  subredditId,
  subredditName,
}: SubscribeLeaveToggleProps) => {
  //const { toast } = useToast()
  const { loginToast } = useCustomToasts();
  const router = useRouter();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      };

      const { data } = await axios.post("/api/subreddit/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return toast.error("You need to be logged in to do that");
        }
      }

      return toast.error("There was a problem.");
    },
    onSuccess: () => {
      startTransition(() => {
        // Refresh the current route and fetch new data from the server without
        // losing client-side browser or React state.
        router.refresh();
      });
      toast.success("Subscribed!", {
        description: `You are now subscribed to r/${subredditName}`,
      });
    },
  });

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      };

      const { data } = await axios.post("/api/subreddit/unsubscribe", payload);
      return data as string;
    },
    onError: (err: AxiosError) => {
      toast(err.response?.data as string);
    },
    onSuccess: () => {
      startTransition(() => {
        // Refresh the current route and fetch new data from the server without
        // losing client-side browser or React state.
        router.refresh();
      });
      toast.error("Unsubscribed!", {
        description: `You are now unsubscribed from/${subredditName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      className="w-full mt-1 mb-4"
      disabled={isUnsubLoading}
      onClick={() => unsubscribe()}
      variant={"secondary"}
    >
      {isUnsubLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Leaving...
        </>
      ) : (
        "Leave community"
      )}
    </Button>
  ) : (
    <Button
      className="w-full mt-1 mb-4"
      disabled={isSubLoading}
      onClick={() => subscribe()}
    >
      {isSubLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Joining...
        </>
      ) : (
        "Join to post"
      )}
    </Button>
  );
};

export default SubscribeLeaveToggle;
