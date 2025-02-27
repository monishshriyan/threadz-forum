"use client";

import { useState } from "react";
import { Editor } from "@/components/Editor";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

interface ClientSubmitPostProps {
  subredditId: string;
}

const ClientSubmitPost = ({ subredditId }: ClientSubmitPostProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
  };

  return (
    <>
      {/* Editor component renders the form with id "subreddit-post-form" */}
      <Editor subredditId={subredditId} />

      <div className="w-full flex justify-end">
        <Button
          type="submit"
          className="w-full"
          form="subreddit-post-form"
          onClick={handleClick}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin duration-150" />
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </>
  );
};

export default ClientSubmitPost;
