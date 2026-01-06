"use client";

import React, { useState } from "react";
import { Post, FamilyMember } from "@memoshare/core/src/types";
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin } from "lucide-react";
import { cn } from "@memoshare/ui/src/utils";
import { MOCK_FAMILY_MEMBERS } from "@memoshare/core/src/mock-data";

interface PostCardProps {
    post: Post;
    author: FamilyMember;
}

export const PostCard = ({ post, author }: PostCardProps) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const [showTags, setShowTags] = useState(false);

    const handleLike = () => {
        if (liked) {
            setLikesCount((prev) => prev - 1);
        } else {
            setLikesCount((prev) => prev + 1);
        }
        setLiked(!liked);
    };

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "Akkurat nå";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min siden`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} timer siden`;
        return date.toLocaleDateString("no-NO");
    };

    // Simple markdown-like parser for bold/italic/underline
    const renderContent = (text: string) => {
        // Note: This is a very basic parser. In production use a proper library.
        // Order matters: bold (**), underline (__), italic (*)
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<u>$1</u>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');

        return <p className="text-gray-800 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {author.avatarUrl ? (
                            <img src={author.avatarUrl} alt={author.firstName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-300 flex items-center justify-center text-white font-bold">
                                {author.firstName[0]}{author.lastName[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {author.firstName} {author.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{timeAgo(post.timestamp)}</span>
                            {post.location && (
                                <>
                                    <span>•</span>
                                    <div className="flex items-center gap-0.5 text-blue-500">
                                        <MapPin size={10} />
                                        <span>{post.location}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Title */}
            {post.title && (
                <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
            )}

            {/* Content */}
            <div className="mb-4">
                {renderContent(post.content)}

                {/* Media Gallery */}
                {post.media && post.media.length > 0 && (
                    <div className="mt-4 grid gap-2 grid-cols-1">
                        {post.media.map((m, idx) => (
                            <div
                                key={idx}
                                className="relative rounded-2xl overflow-hidden group"
                                onMouseEnter={() => setShowTags(true)}
                                onMouseLeave={() => setShowTags(false)}
                            >
                                <img src={m.url} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />

                                {/* Tags Overlay */}
                                {showTags && m.tags?.map((tag, tIdx) => {
                                    const taggedUser = MOCK_FAMILY_MEMBERS.find(u => u.id === tag.userId);
                                    return (
                                        <div
                                            key={tIdx}
                                            className="absolute bg-black/70 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
                                            style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                                        >
                                            {taggedUser?.firstName || "Ukjent"}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1">
                    {likesCount > 0 && (
                        <>
                            <div className="bg-red-100 p-1 rounded-full">
                                <Heart size={12} className="text-red-500 fill-red-500" />
                            </div>
                            <span>{likesCount}</span>
                        </>
                    )}
                </div>
                <div className="flex gap-4">
                    {post.comments.length > 0 && <span>{post.comments.length} kommentarer</span>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handleLike}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium text-sm",
                        liked ? "text-red-500 bg-red-50" : "text-gray-600 hover:bg-gray-50"
                    )}
                >
                    <Heart size={20} className={liked ? "fill-current" : ""} />
                    <span>Liker</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium text-sm text-gray-600 hover:bg-gray-50">
                    <MessageCircle size={20} />
                    <span>Kommenter</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium text-sm text-gray-600 hover:bg-gray-50">
                    <Share2 size={20} />
                    <span>Del</span>
                </button>
            </div>
        </div>
    );
};
