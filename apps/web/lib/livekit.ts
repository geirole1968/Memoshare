"use server";

import { AccessToken } from 'livekit-server-sdk';
import { createClient } from './supabase/server';

export async function getLiveKitToken(roomName: string, participantName: string) {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
        throw new Error("LiveKit environment variables are not set");
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    const at = new AccessToken(apiKey, apiSecret, {
        identity: user.id,
        name: participantName,
    });

    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

    return at.toJwt();
}
