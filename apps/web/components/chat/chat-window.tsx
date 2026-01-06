"use client";

import React, { useState, useRef, useEffect } from "react";
import { Conversation } from "@memoshare/core/src/types";
import { useChat } from "./chat-context";
import { ChatBubble } from "./chat-bubble";
import { X, Minus, Send } from "lucide-react";

interface ChatWindowProps {
    conversationId: string;
}

export const ChatWindow = ({ conversationId }: ChatWindowProps) => {
    const {
        conversations,
        closeChat,
        minimizeChat,
        sendMessage,
        getParticipant,
        currentUser,
    } = useChat();
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const conversation = conversations.find((c) => c.id === conversationId);
    const participant = getParticipant(conversationId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation?.messages]);

    if (!conversation || !participant) return null;

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;
        sendMessage(conversationId, inputValue);
        setInputValue("");
    };

    return (
        <div className="w-80 h-96 bg-white border border-gray-200 rounded-t-lg shadow-lg flex flex-col mr-4">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground rounded-t-lg cursor-pointer" onClick={() => minimizeChat(conversationId)}>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        {participant.avatarUrl ? (
                            <img src={participant.avatarUrl} alt={participant.firstName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                {participant.firstName[0]}{participant.lastName[0]}
                            </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-primary rounded-full"></span>
                    </div>
                    <span className="font-semibold text-sm truncate max-w-[120px]">
                        {participant.firstName} {participant.lastName}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            minimizeChat(conversationId);
                        }}
                        className="p-1 hover:bg-white/20 rounded"
                    >
                        <Minus size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeChat(conversationId);
                        }}
                        className="p-1 hover:bg-white/20 rounded"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                {conversation.messages.map((msg) => (
                    <ChatBubble
                        key={msg.id}
                        message={msg}
                        isMe={msg.senderId === currentUser.id}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white">
                <div className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Skriv en melding..."
                        className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};
