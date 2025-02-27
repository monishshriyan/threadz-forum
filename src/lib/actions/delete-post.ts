// src/lib/actions/delete-post.ts (modified - move auth() call)
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deletePost(postId: string) {
    console.log("--- deletePost called ---");
    try {
        console.log("Before findUnique query");
        const post = await db.post.findUnique({ // Keep db call first
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
        console.log("After findUnique query, Post:", post);

        if (!post) {
            console.log("Post not found in DB");
            return { error: "Post not found" };
        }

        // Authorization check BEFORE auth() call (for this test)
        // const session = await auth(); // Moved auth() call down
        if (/* ... your authorization check logic using 'post' data but WITHOUT 'session' yet if possible ... */ post.authorId === "some_placeholder_authorId_to_test") { // Replace placeholder with a simple test condition based on 'post' data, if feasible without session
            console.log("Authorization check passed (placeholder)"); // Indicate placeholder auth passed
            // return { error: "Unauthorized to delete this post" }; // If you can't easily test auth without session, just comment out the auth check for now
        } else {
            console.log("Authorization check skipped or placeholder used"); // Indicate auth check skipped
        }


        const session = await auth(); // Moved auth() call AFTER db and (placeholder) auth check
        console.log("Session after auth() call:", session); // Log session

        if (!session?.user) {
            console.log("No Session User (after auth() call)");
            return { error: "Unauthorized" };
        }
        console.log("Session User exists (after auth() call)");


        await db.$transaction(async (tx) => {
            await tx.post.delete({
                where: { id: postId },
            });
            await tx.comment.deleteMany({ where: { postId: postId } });
            await tx.vote.deleteMany({ where: { postId: postId } });
        });


        revalidatePath(`/r/${post.subreddit.name}`);
        revalidatePath("/");
        return { success: true };

    } catch (error) {
        console.error("Error in deletePost:", error);
        return { error: "Could not delete post. Please try again." };
    }
}