// src/components/Post.tsx
"use client";

import { formatTimeToNow } from "@/lib/utils";
import { Post, User, Vote } from "@prisma/client";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { FC, useRef, useTransition } from "react";
import EditorOutput from "./EditorOutput";
import PostVoteClient from "./post-vote/PostVoteClient";
import React from "react";
import { Card, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
//import { deletePost } from "@/lib/actions/delete-post"; // If you have this helper function, uncomment and use it
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/Dialog";

type PartialVote = Pick<Vote, "type">;

interface PostProps {
  post: Post & {
    author: User;
    votes: Vote[];
  };
  votesAmt: number;
  subredditName: string;
  currentVote?: PartialVote;
}

const Post: FC<PostProps> = ({
  post,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
  subredditName,
}) => {
  const pRef = useRef<HTMLParagraphElement>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();

  const isPostAuthor = session?.user.id === post.authorId;
  const [open, setOpen] = React.useState(false); // Add state for dialog

  const deletePostHandler = async () => {
    startTransition(async () => {  // Wrap in startTransition
      try {
        const response = await fetch(`/api/deletepost/${post.id}`, {
          method: "DELETE",
        });
  
        if (!response.ok) {
          let errorMessage = "Failed to delete post.";
          const clonedResponse = response.clone();
          // ...existing error handling code...
          toast.error(errorMessage);
          return;
        }
  
        // Success!
        router.refresh();
        setOpen(false); // Move this here to close dialog after successful deletion
        toast.success("Post deleted successfully!");
      } catch (error) {
        console.error("Error deleting post (API call):", error);
        toast.error("Failed to delete post. Please try again.");
      }
    });
  };
  return (
    <Card>
      <div className="px-6 py-4 flex justify-between gap-3">
        <PostVoteClient
          postId={post.id}
          initialVotesAmt={_votesAmt}
          initialVote={_currentVote?.type}
        />

        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-muted-foreground">
            {subredditName ? (
              <>
                <Link
                  className="underline text-muted-foreground text-sm underline-offset-2"
                  href={`/r/${subredditName}`}
                >
                  r/{subredditName}
                </Link>
                <span className="px-1">•</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{" "}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          <Link href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 ">
              {post.title}
            </h1>
          </Link>

          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={pRef}
          >
            <EditorOutput content={post.content} />
            {pRef.current?.clientHeight === 160 ? (
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-card to-transparent"></div>
            ) : null}
          </div>
        </div>
      </div>
      <CardFooter className="flex gap-2">
        <Button variant={"secondary"}>
          <Link
            href={`/r/${subredditName}/post/${post.id}`}
            className="w-fit flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" /> Comments
          </Link>
        </Button>
        {isPostAuthor && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-red-700 hover:text-red-900 hover:bg-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[80%] rounded-xl">
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this post? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await deletePostHandler();
                    setOpen(false); // Close dialog after deletion
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default React.memo(Post);
