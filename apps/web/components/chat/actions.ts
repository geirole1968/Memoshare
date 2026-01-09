"use server";

import { createClient } from "@/lib/supabase/server";
import { Conversation, Message, FamilyMember } from "@memoshare/core";

// --- Helpers ---

function mapMessageToUI(msg: any): Message {
    return {
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        timestamp: msg.created_at,
        read: msg.read || false,
    };
}

function mapConversationToUI(conv: any, currentUserId: string): Conversation {
    return {
        id: conv.id,
        familyId: conv.family_id,
        isGroup: conv.is_group,
        name: conv.name,
        updatedAt: conv.created_at, // Should be max(message.created_at)
        participantIds: conv.participants?.map((p: any) => p.user_id) || [],
        messages: conv.messages?.map(mapMessageToUI) || []
    };
}

// --- Actions ---

export async function getConversations(familyId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Fetch conversations where user is a participant
    // This is complex with Supabase simple filters. 
    // We might need a join on conversation_participants.

    const { data, error } = await supabase
        .from("conversations")
        .select(`
            *,
            participants:conversation_participants(user_id),
            messages(*)
        `)
        .eq("family_id", familyId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Filter client-side for now if RLS doesn't handle it (RLS should handle it)
    // RLS: "Users can view conversations they are part of"

    return data.map(c => mapConversationToUI(c, user.id));
}

export async function sendMessage(conversationId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content
        });

    if (error) throw new Error(error.message);
}
