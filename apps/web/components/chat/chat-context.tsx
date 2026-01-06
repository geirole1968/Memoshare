"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Conversation, Message, FamilyMember } from "@memoshare/core/src/types";
import { MOCK_CONVERSATIONS, MOCK_FAMILY_MEMBERS } from "@memoshare/core/src/mock-data";

interface ChatContextType {
    conversations: Conversation[];
    openChats: string[]; // Conversation IDs
    minimizedChats: string[]; // Conversation IDs
    startChat: (participantId: string) => void;
    closeChat: (conversationId: string) => void;
    minimizeChat: (conversationId: string) => void;
    maximizeChat: (conversationId: string) => void;
    sendMessage: (conversationId: string, content: string) => void;
    getParticipant: (conversationId: string) => FamilyMember | undefined;
    currentUser: FamilyMember; // Mocked current user
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [openChats, setOpenChats] = useState<string[]>([]);
    const [minimizedChats, setMinimizedChats] = useState<string[]>([]);

    // Mock current user (using ID "3" - Per Nordmann for this demo)
    const currentUser = MOCK_FAMILY_MEMBERS.find((m) => m.id === "3") || MOCK_FAMILY_MEMBERS[0];

    const startChat = (participantId: string) => {
        // Check if conversation already exists
        let conversation = conversations.find(
            (c) => c.participantIds.includes(participantId) && c.participantIds.includes(currentUser.id)
        );

        if (!conversation) {
            // Create new conversation
            const newConversation: Conversation = {
                id: `c-${Date.now()}`,
                participantIds: [currentUser.id, participantId],
                messages: [],
                updatedAt: new Date().toISOString(),
            };
            setConversations((prev) => [...prev, newConversation]);
            conversation = newConversation;
        }

        if (!openChats.includes(conversation.id)) {
            setOpenChats((prev) => [...prev, conversation.id]);
        }

        // If it was minimized, maximize it
        if (minimizedChats.includes(conversation.id)) {
            setMinimizedChats((prev) => prev.filter((id) => id !== conversation.id));
        }
    };

    const closeChat = (conversationId: string) => {
        setOpenChats((prev) => prev.filter((id) => id !== conversationId));
        setMinimizedChats((prev) => prev.filter((id) => id !== conversationId));
    };

    const minimizeChat = (conversationId: string) => {
        if (!minimizedChats.includes(conversationId)) {
            setMinimizedChats((prev) => [...prev, conversationId]);
        }
    };

    const maximizeChat = (conversationId: string) => {
        setMinimizedChats((prev) => prev.filter((id) => id !== conversationId));
    };

    const sendMessage = (conversationId: string, content: string) => {
        const newMessage: Message = {
            id: `m-${Date.now()}`,
            senderId: currentUser.id,
            content,
            timestamp: new Date().toISOString(),
            read: false,
        };

        setConversations((prev) =>
            prev.map((c) =>
                c.id === conversationId
                    ? { ...c, messages: [...c.messages, newMessage], updatedAt: newMessage.timestamp }
                    : c
            )
        );

        // Simulate auto-reply for demo purposes
        setTimeout(() => {
            const replyMessage: Message = {
                id: `m-reply-${Date.now()}`,
                senderId: conversations.find(c => c.id === conversationId)?.participantIds.find(id => id !== currentUser.id) || "unknown",
                content: "Dette er et automatisk svar. Jeg er ikke tilgjengelig akkurat nå.",
                timestamp: new Date().toISOString(),
                read: false,
            };
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === conversationId
                        ? { ...c, messages: [...c.messages, replyMessage], updatedAt: replyMessage.timestamp }
                        : c
                )
            );
        }, 2000);
    };

    const getParticipant = (conversationId: string) => {
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) return undefined;
        const participantId = conversation.participantIds.find((id) => id !== currentUser.id);
        return MOCK_FAMILY_MEMBERS.find((m) => m.id === participantId);
    };

    return (
        <ChatContext.Provider
            value={{
                conversations,
                openChats,
                minimizedChats,
                startChat,
                closeChat,
                minimizeChat,
                maximizeChat,
                sendMessage,
                getParticipant,
                currentUser,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
