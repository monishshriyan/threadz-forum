"use client";

import { Button } from "@/components/ui/Button";
// import { toast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { CommentRequest } from "@/lib/validators/comment";

import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Loader2 } from "lucide-react";

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();
  const { loginToast } = useCustomToasts();

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, text, replyToId };

      const { data } = await axios.patch(
        `/api/subreddit/post/comment/`,
        payload
      );
      return data;
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast("Something went wrong.", {
        description: "Comment wasn't created successfully. Please try again.",
      });
    },
    onSuccess: () => {
      toast.success("Comment Posted!");
      router.refresh();
      setInput("");
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <h1 className="text-3xl font-extrabold">Comment</h1>
      <div className="mt-1">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="What are your thoughts?"
        />

        <div className="mt-2 flex justify-end">
          <Button
            disabled={input.length === 0 || isLoading}
            onClick={() => comment({ postId, text: input, replyToId })}
          >
            {" "}
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin duration-150" />
                Posting...
              </>
            ) : (
              "Post"
            )}{" "}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
