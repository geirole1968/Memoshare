"use client";

import React, { useState } from "react";
import { CreatePost } from "./create-post";
import { PostCard } from "./post-card";
import { MOCK_POSTS, MOCK_FAMILY_MEMBERS } from "@memoshare/core/src/mock-data";
import { Post, PostMedia } from "@memoshare/core/src/types";
import { Tag } from "lucide-react";
import { useChat } from "../chat/chat-context"; // Reusing for currentUser

export function FeedContainer() {
    const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
    const { currentUser } = useChat();

    const handlePost = (content: string, title?: string, media?: PostMedia[], location?: string) => {
        const newPost: Post = {
            id: `p-${Date.now()}`,
            authorId: currentUser.id,
            content,
            title,
            media,
            location,
            likes: [],
            comments: [],
            timestamp: new Date().toISOString(),
        };
        setPosts([newPost, ...posts]);
    };

    const getAuthor = (authorId: string) => {
        return MOCK_FAMILY_MEMBERS.find((m) => m.id === authorId) || MOCK_FAMILY_MEMBERS[0];
    };

    return (
        <div className="flex flex-col gap-6">
            <CreatePost onPost={handlePost} />

            {posts.length === 0 ? (
                /* Empty State */
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
            ) : (
                /* Feed */
                <div className="flex flex-col gap-6">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} author={getAuthor(post.authorId)} />
                    ))}
                </div>
            )}
        </div>
    );
}
