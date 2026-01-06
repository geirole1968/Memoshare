"use client";

import React from "react";
import { useChat } from "./chat-context";
import { ChatWindow } from "./chat-window";
import { FamilyList } from "./family-list";

export const ChatDock = () => {
    const { openChats, minimizedChats, maximizeChat, closeChat, getParticipant } = useChat();

    return (
        <div className="fixed bottom-0 right-4 flex items-end gap-4 z-50 pointer-events-none">
            {/* Minimized Chats (Bubbles) */}
            <div className="flex flex-col gap-2 pointer-events-auto mb-4">
                {minimizedChats.map((id) => {
                    const participant = getParticipant(id);
                    if (!participant) return null;
                    return (
                        <div key={id} className="relative group">
                            <button
                                onClick={() => maximizeChat(id)}
                                className="w-12 h-12 rounded-full bg-white shadow-lg border-2 border-white overflow-hidden hover:scale-105 transition-transform"
                            >
                                {participant.avatarUrl ? (
                                    <img src={participant.avatarUrl} alt={participant.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {participant.firstName[0]}{participant.lastName[0]}
                                    </div>
                                )}
                            </button>
                            <button
                                onClick={() => closeChat(id)}
                                className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Open Chat Windows */}
            <div className="flex items-end pointer-events-auto">
                {openChats.map((id) => (
                    <div key={id} className={minimizedChats.includes(id) ? "hidden" : "block"}>
                        <ChatWindow conversationId={id} />
                    </div>
                ))}
            </div>

            {/* Family List Trigger / Main Chat Button */}
            <div className="pointer-events-auto">
                <FamilyList />
            </div>
        </div>
    );
};
