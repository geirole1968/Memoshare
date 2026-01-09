"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Conversation, Message, FamilyMember } from "@memoshare/core/src/types";
import { createClient } from "@/lib/supabase/client";
import { getConversations, sendMessage as sendMessageAction } from "./actions";

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
    currentUser: FamilyMember; // Mocked current user for now (should be fetched)
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
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [openChats, setOpenChats] = useState<string[]>([]);
    const [minimizedChats, setMinimizedChats] = useState<string[]>([]);
    const supabase = createClient();

    // Mock current user for now (we need a better way to get this in client context)
    // Ideally, we pass it as a prop from server component
    const [currentUser, setCurrentUser] = useState<FamilyMember>({
        id: "user-1", // Temporary fallback
        userId: "user-1",
        firstName: "Meg",
        lastName: "",
        role: "admin"
    });

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser({
                    id: user.id,
                    userId: user.id,
                    firstName: user.user_metadata?.full_name?.split(" ")[0] || "Meg",
                    lastName: "",
                    role: "member"
                });

                // Fetch family ID (hacky, assuming first family)
                const { data: members } = await supabase
                    .from("family_members")
                    .select("family_id")
                    .eq("user_id", user.id)
                    .limit(1);

                const familyId = members?.[0]?.family_id;
                if (familyId) {
                    const convs = await getConversations(familyId);
                    setConversations(convs);
                }
            }
        };
        init();
    }, []);

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('chat-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMessage = payload.new as any;
                    setConversations((prev) =>
                        prev.map((c) =>
                            c.id === newMessage.conversation_id
                                ? {
                                    ...c,
                                    messages: [...c.messages, {
                                        id: newMessage.id,
                                        conversationId: newMessage.conversation_id,
                                        senderId: newMessage.sender_id,
                                        content: newMessage.content,
                                        timestamp: newMessage.created_at,
                                        read: false
                                    }],
                                    updatedAt: newMessage.created_at
                                }
                                : c
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const startChat = (participantId: string) => {
        // Check if conversation already exists
        let conversation = conversations.find(
            (c) => c.participantIds.includes(participantId) && !c.isGroup
        );

        if (!conversation) {
            // Create new conversation (optimistic)
            // In reality, we should create it on server first
            // For now, let's just open it if it exists, or handle creation logic later
            console.log("Creating new chat not fully implemented yet");
            return;
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

    const sendMessage = async (conversationId: string, content: string) => {
        // Optimistic update
        const newMessage: Message = {
            id: `temp-${Date.now()}`,
            conversationId,
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

        await sendMessageAction(conversationId, content);
    };

    const getParticipant = (conversationId: string) => {
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) return undefined;
        // This logic needs to be robust for group chats or missing participants
        // For now, just return undefined if we can't find them
        return undefined;
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

