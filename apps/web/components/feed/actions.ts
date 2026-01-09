"use server";

import { createClient } from "@/lib/supabase/server";
import { Post, Comment, DbProfile } from "@memoshare/core";
import { revalidatePath } from "next/cache";

// --- Helpers ---

function mapPostToUI(post: any): Post {
    return {
        id: post.id,
        familyId: post.family_id,
        authorId: post.author_id,
        content: post.content,
        imageUrl: post.image_url,
        media: post.media && post.media.length > 0 ? post.media : (post.image_url ? [{ type: 'image', url: post.image_url }] : []),
        timestamp: post.created_at,
        author: post.author ? {
            id: post.author.id,
            userId: post.author.id, // Profile ID is User ID
            firstName: post.author.full_name.split(" ")[0],
            lastName: post.author.full_name.split(" ").slice(1).join(" "),
            role: "member", // Default
            avatarUrl: post.author.avatar_url,
        } : undefined,
        likes: [], // Not implemented yet
        comments: post.comments?.map((c: any) => ({
            id: c.id,
            postId: c.post_id,
            authorId: c.author_id,
            content: c.content,
            timestamp: c.created_at,
            author: c.author ? {
                id: c.author.id,
                userId: c.author.id,
                firstName: c.author.full_name.split(" ")[0],
                lastName: c.author.full_name.split(" ").slice(1).join(" "),
                role: "member",
                avatarUrl: c.author.avatar_url,
            } : undefined
        })) || []
    };
}

// --- Actions ---

export async function getPosts(familyId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("posts")
        .select(`
            *,
            author:profiles!author_id (
                id, full_name, avatar_url
            ),
            comments (
                *,
                author:profiles!author_id (
                    id, full_name, avatar_url
                )
            )
        `)
        .eq("family_id", familyId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data.map(mapPostToUI);
}

export async function createPost(familyId: string, content: string, media: any[] = []) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // For backward compatibility, use the first image as image_url
    const imageUrl = media.length > 0 ? media[0].url : null;

    const { error } = await supabase
        .from("posts")
        .insert({
            family_id: familyId,
            author_id: user.id,
            content,
            image_url: imageUrl,
            media: media // Save full media array
        });

    if (error) throw new Error(error.message);

    revalidatePath("/");
}
