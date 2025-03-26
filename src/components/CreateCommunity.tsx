"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
//import { toast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { CreateSubredditPayload } from "@/lib/validators/subreddit";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Loader2 } from "lucide-react";

const CreateCommunity = () => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const { loginToast } = useCustomToasts();

  const { mutate: createCommunity, isLoading } = useMutation({
    mutationFn: async () => {
      const trimmedInput = input.trim(); // Trim the input here
      const payload: CreateSubredditPayload = {
        name: trimmedInput,
      };

      const { data } = await axios.post("/api/subreddit", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast.warning("Community already exists.");
        }

        if (err.response?.status === 422) {
          return toast.error("Invalid Community name ");
        }

        if (err.response?.status === 401) {
          return toast.error("You need to be logged in to do that");
        }
      }

      toast.error("There was an error.");
    },
    onSuccess: (data) => {
      toast.success("Community created!", {
        description: `r/${data} has been created.`, // Use the community name
      });
      router.push(`/r/${data}`);
    },
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full mt-3">
          Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs md:max-w-lg w-[80%] rounded-xl">
        <DialogHeader>
          <DialogTitle>Create Community</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please enter community name. No capitalization or spaces.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="relative">
            <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
              r/
            </p>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-6 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex w-full gap-2 justify-end">
          {" "}
          <Button
            disabled={input.length === 0 || isLoading} // Disable while loading
            onClick={() => createCommunity()}
          >
            {" "}
            {isLoading ? (
              <>
                {" "}
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...{" "}
              </>
            ) : (
              "Create Community"
            )}{" "}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default CreateCommunity;
