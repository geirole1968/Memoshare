"use client";

import React, { useState } from "react";
import { CreatePost } from "./create-post";
import { PostCard } from "./post-card";
import { Post, PostMedia } from "@memoshare/core/src/types";
import { Tag } from "lucide-react";
import { useChat } from "../chat/chat-context"; // Reusing for currentUser
import { createPost } from "./actions";
import { MotionWrapper } from "../ui/motion-wrapper";

interface FeedContainerProps {
    initialPosts: Post[];
    familyId: string;
}

import { useFamilyMembers } from "@/hooks/use-family-members";

export function FeedContainer({ initialPosts, familyId }: FeedContainerProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const { currentUser } = useChat();
    const { members } = useFamilyMembers(familyId);

    const handlePost = async (content: string, title?: string, media?: PostMedia[], location?: string) => {
        // Optimistic update
        const newPost: Post = {
            id: `temp-${Date.now()}`,
            familyId,
            authorId: currentUser.id,
            content,
            // title, // Post type doesn't have title in updated types.ts? Check types.ts
            // media, // Post type has imageUrl?
            // location,
            likes: [],
            comments: [],
            timestamp: new Date().toISOString(),
            author: currentUser as any // Cast for now
        };

        setPosts([newPost, ...posts]);

        try {
            await createPost(familyId, content, media);
        } catch (e) {
            console.error("Failed to create post", e);
            // Revert on failure?
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <MotionWrapper delay={0.2}>
                <CreatePost onPost={handlePost} />
            </MotionWrapper>

            {posts.length === 0 ? (
                /* Empty State */
                <MotionWrapper delay={0.3}>
                    <div className="bg-white rounded-[24px] p-12 shadow-[0_8px_24px_rgba(0,0,0,0.06)] min-h-[300px] flex flex-col items-center justify-center text-center gap-4 border border-dashed border-gray-200">
                        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-2 animate-pulse">
                            <Tag className="w-10 h-10 text-orange-300" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Ingen innlegg enda</h3>
                            <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">Del et minne, et bilde eller en historie med familien din for å komme i gang.</p>
                        </div>
                        <button className="mt-4 text-[var(--primary)] font-bold hover:underline text-lg">
                            Start ditt første innlegg
                        </button>
                    </div>
                </MotionWrapper>
            ) : (
                /* Feed */
                <div className="flex flex-col gap-6">
                    {posts.map((post, index) => (
                        <MotionWrapper key={post.id} delay={0.1 * (index + 1)}>
                            <PostCard
                                post={post}
                                author={post.author || currentUser}
                                members={members}
                            />
                        </MotionWrapper>
                    ))}
                </div>
            )}
        </div>
    );
}
