// app/api/deletepost/[postId]/route.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
type Props = {
    params: Promise<{
      postId: string;
    }>;
  };
// DELETE /api/deletepost/[postId]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise< { postId: string }> } // Re-introduce and refine type annotation
): Promise<NextResponse> {
   const { postId } = await params;

    console.log("--- DELETE /api/deletepost ROUTE called ---");
    console.log("DATABASE_URL in API route:", process.env.DATABASE_URL);

    if (!postId) {
        console.log("postId missing in API route");
        return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
        console.log("No Session User in API route");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Session User exists in API route");

    try {
        console.log("Before findUnique query in API route");
        const post = await db.post.findUnique({
            where: { id: postId },
            select: {
                authorId: true,
                subreddit: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        console.log("Post found in API route:", post);

        if (!post) {
            console.log("Post not found in DB in API route");
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (post.authorId !== session.user.id) {
            console.log("Unauthorized author in API route");
            return NextResponse.json({ error: "Unauthorized to delete this post" }, { status: 403 });
        }

        console.log("Starting transaction in API route");
        await db.$transaction(async (tx) => {
            console.log("Deleting post in API route");
            await tx.post.delete({
                where: { id: postId },
            });

            await tx.comment.deleteMany({ where: { postId: postId } });
            await tx.vote.deleteMany({ where: { postId: postId } });
        });
        console.log("Transaction completed in API route");

        console.log("Revalidating paths in API route");
        revalidatePath(`/r/${post.subreddit.name}`);
        revalidatePath("/");

        console.log("Returning success from API route");
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting post in API route:", error);
        console.log("Returning error from catch in API route");
        return NextResponse.json({ error: "Could not delete post. Please try again." }, { status: 500 });
    } finally {
        console.log("--- DELETE /api/deletepost ROUTE finished ---");
    }
}