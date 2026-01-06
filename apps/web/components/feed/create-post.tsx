"use client";

import React, { useState, useRef } from "react";
import { Image, MapPin, Users, Send, Bold, Italic, Underline, X, Plus } from "lucide-react";
import { useChat } from "../chat/chat-context";
import { MOCK_FAMILY_MEMBERS } from "@memoshare/core/src/mock-data";
import { PostMedia, MediaTag } from "@memoshare/core/src/types";

interface CreatePostProps {
    onPost: (content: string, title?: string, media?: PostMedia[], location?: string) => void;
}

export const CreatePost = ({ onPost }: CreatePostProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [location, setLocation] = useState("");
    const [media, setMedia] = useState<PostMedia[]>([]);
    const [taggingMediaIndex, setTaggingMediaIndex] = useState<number | null>(null);

    const { currentUser } = useChat();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePost = () => {
        if (!content.trim() && media.length === 0) return;
        onPost(content, title, media, location);
        // Reset state
        setTitle("");
        setContent("");
        setLocation("");
        setMedia([]);
        setIsExpanded(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setMedia([...media, { type: 'image', url: event.target.result as string, tags: [] }]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddTag = (mediaIndex: number, x: number, y: number, userId: string) => {
        const newMedia = [...media];
        if (!newMedia[mediaIndex].tags) newMedia[mediaIndex].tags = [];
        newMedia[mediaIndex].tags!.push({ x, y, userId });
        setMedia(newMedia);
        setTaggingMediaIndex(null);
    };

    const formatText = (command: string) => {
        // Simple mock formatting - in a real app use a rich text editor lib
        const textarea = document.getElementById('post-content') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        let formatted = selectedText;
        if (command === 'bold') formatted = `**${selectedText}**`;
        if (command === 'italic') formatted = `*${selectedText}*`;
        if (command === 'underline') formatted = `__${selectedText}__`;

        const newContent = content.substring(0, start) + formatted + content.substring(end);
        setContent(newContent);
    };

    return (
        <div className={`bg-white rounded-[24px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 ${isExpanded ? 'shadow-[0_12px_32px_rgba(0,0,0,0.12)]' : ''}`}>
            <div className="flex gap-4">
                <div className="relative flex-shrink-0">
                    {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.firstName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-300 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm">
                            {currentUser.firstName[0]}{currentUser.lastName[0]}
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col gap-3">
                    {/* Title Input */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (!isExpanded) setIsExpanded(true);
                        }}
                        onFocus={() => setIsExpanded(true)}
                        placeholder={`Hva tenker du på, ${currentUser.firstName}? Legg inn emne...`}
                        className="w-full bg-transparent text-lg font-semibold placeholder:text-gray-400 outline-none border-b border-transparent focus:border-gray-200 transition-colors pb-2"
                    />

                    {/* Content Area */}
                    {isExpanded && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Toolbar */}
                            <div className="flex items-center gap-1 mb-2 border-b border-gray-100 pb-2">
                                <button onClick={() => formatText('bold')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Fet"><Bold size={16} /></button>
                                <button onClick={() => formatText('italic')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Kursiv"><Italic size={16} /></button>
                                <button onClick={() => formatText('underline')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Understrek"><Underline size={16} /></button>
                            </div>

                            <textarea
                                id="post-content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Skriv din historie her..."
                                className="w-full min-h-[100px] bg-transparent outline-none resize-none text-gray-700 leading-relaxed"
                            />

                            {/* Media Preview */}
                            {media.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto py-2">
                                    {media.map((m, idx) => (
                                        <div key={idx} className="relative group w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={m.url} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setMedia(media.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                            >
                                                <X size={12} />
                                            </button>
                                            <button
                                                onClick={() => setTaggingMediaIndex(idx)}
                                                className="absolute bottom-1 right-1 bg-white/90 text-xs px-2 py-1 rounded shadow-sm hover:bg-white"
                                            >
                                                Tag
                                            </button>
                                            {/* Tag Markers */}
                                            {m.tags?.map((tag, tIdx) => (
                                                <div
                                                    key={tIdx}
                                                    className="absolute w-3 h-3 bg-primary rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                                                    style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                                                    title={MOCK_FAMILY_MEMBERS.find(u => u.id === tag.userId)?.firstName}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Location Input */}
                            {location && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full w-fit mb-2">
                                    <MapPin size={14} />
                                    <span>{location}</span>
                                    <button onClick={() => setLocation("")} className="hover:text-blue-800"><X size={14} /></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-[16px] hover:bg-orange-50 text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-all group">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                            <Image className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                        <span className="hidden sm:inline">Bilde/Video</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />

                    <button
                        onClick={() => {
                            const loc = prompt("Skriv inn sted:");
                            if (loc) setLocation(loc);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-[16px] hover:bg-blue-50 text-sm font-medium text-gray-600 hover:text-[var(--secondary)] transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <MapPin className="w-4 h-4 text-[var(--secondary)]" />
                        </div>
                        <span className="hidden sm:inline">Sted</span>
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-[16px] hover:bg-green-50 text-sm font-medium text-gray-600 hover:text-green-600 transition-all group">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="hidden sm:inline">Tag venner</span>
                    </button>
                </div>

                <button
                    onClick={handlePost}
                    disabled={!content.trim() && media.length === 0}
                    className="bg-[var(--primary)] text-white px-8 py-2.5 rounded-[16px] font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Publiser
                </button>
            </div>

            {/* Tagging Modal */}
            {taggingMediaIndex !== null && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setTaggingMediaIndex(null)}>
                    <div className="bg-white rounded-xl p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-4">Klikk på bildet for å tagge</h3>
                        <div className="relative inline-block cursor-crosshair group"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = ((e.clientX - rect.left) / rect.width) * 100;
                                const y = ((e.clientY - rect.top) / rect.height) * 100;
                                // For simplicity, just auto-tag the first other user found or prompt
                                // In a real app, show a dropdown at x,y
                                const userToTag = MOCK_FAMILY_MEMBERS.find(m => m.id !== currentUser.id);
                                if (userToTag) handleAddTag(taggingMediaIndex, x, y, userToTag.id);
                            }}
                        >
                            <img src={media[taggingMediaIndex].url} alt="Tagging" className="max-w-full h-auto rounded" />
                            {/* Show existing tags */}
                            {media[taggingMediaIndex].tags?.map((tag, i) => (
                                <div
                                    key={i}
                                    className="absolute bg-black/70 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                                >
                                    {MOCK_FAMILY_MEMBERS.find(u => u.id === tag.userId)?.firstName}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setTaggingMediaIndex(null)} className="px-4 py-2 bg-gray-100 rounded-lg font-medium">Ferdig</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
