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

const Page = () => {
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
          return toast.warning("Subreddit already exists.");
        }

        if (err.response?.status === 422) {
          return toast.error("Invalid Subreddit name ");
        }

        if (err.response?.status === 401) {
          return toast.error("You need to be logged in to do that");
        }
      }

      toast.error("There was an error.");
    },
    onSuccess: (data) => {
      router.push(`/r/${data}`);
    },
  });

  return (
    <div className="flex flex-col items-start justify-center mt-4 ">
      <h1 className="font-extrabold text-3xl">Create a community</h1>
      <div className="">
        <Card className="h-fit">
          <CardContent className="space-y-4">
            <hr className="bg-red-500 h-px" />
            <div className="space-y-2">
              <CardDescription>Name</CardDescription>
              <p className="text-xs pb-2 text-muted-foreground">
                Community names including capitalization cannot be changed.
              </p>
              <div className="relative">
                <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
                  r/
                </p>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="pl-6"
                />
              </div>
            </div>
          </CardContent>
          {/* <CardFooter className="flex justify-end gap-4">
          <Button
            disabled={isLoading}
            variant="subtle"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => createCommunity()}
          >
            Create Community
          </Button>
        </CardFooter> */}
        </Card>
        <div className="flex w-full gap-2 mt-2 justify-end">
          <Button
            disabled={isLoading}
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            disabled={input.length === 0}
            onClick={() => createCommunity()}
          >
            Create Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
