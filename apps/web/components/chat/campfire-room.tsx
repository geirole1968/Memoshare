"use client";

import React, { useEffect, useState } from 'react';
import {
    LiveKitRoom,
    VideoConference,
    GridLayout,
    ParticipantTile,
    useTracks,
    RoomAudioRenderer,
    ControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { getLiveKitToken } from '@/lib/livekit';
import { useChat } from './chat-context';

interface CampfireRoomProps {
    roomName: string;
}

export const CampfireRoom = ({ roomName }: CampfireRoomProps) => {
    const { currentUser } = useChat();
    const [token, setToken] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const name = `${currentUser.firstName} ${currentUser.lastName}`;
                const t = await getLiveKitToken(roomName, name);
                setToken(t);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [roomName, currentUser]);

    if (!token) {
        return <div className="flex items-center justify-center h-full">Kobler til leirbålet...</div>;
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            style={{ height: '100vh' }}
        >
            <CampfireLayout roomName={roomName} />
            <RoomAudioRenderer />
            <ControlBar />
        </LiveKitRoom>
    );
};

import { ParticipantCircle } from './participant-circle';
import { SharedCanvas } from './shared-canvas';

// ... imports

const CampfireLayout = ({ roomName }: { roomName: string }) => {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
        ],
        { onlySubscribed: false },
    );

    // Calculate positions
    // We want to distribute participants in a circle/ellipse around the center
    // We'll place them at 42% radius from center (so they are near edges)
    const RADIUS = 42;

    // AI Moderator Logic
    // Monitor silence and suggest topics
    const [showAiSuggestion, setShowAiSuggestion] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState("");

    useEffect(() => {
        // Mock silence detection
        // In a real app, we'd use useAudioTrack to check volume levels
        const timer = setInterval(() => {
            // Randomly trigger AI suggestion for demo purposes
            if (Math.random() > 0.95) {
                const topics = [
                    "Husker dere turen til Legoland i 2018?",
                    "Hva er det morsomste som skjedde i julen?",
                    "Hvem var det som bakte denne kaken?",
                    "Se på dette bildet fra hytta!"
                ];
                setAiSuggestion(topics[Math.floor(Math.random() * topics.length)]);
                setShowAiSuggestion(true);

                // Hide after 10 seconds
                setTimeout(() => setShowAiSuggestion(false), 10000);
            }
        }, 20000); // Check every 20 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-full w-full bg-[#1A3C34] overflow-hidden">
            {/* Center Canvas */}
            <SharedCanvas roomId={roomName} />

            {/* AI Moderator Toast */}
            {showAiSuggestion && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl z-50 animate-in slide-in-from-top-4 fade-in duration-500 border border-[var(--primary)]/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            AI
                        </div>
                        <p className="text-[var(--primary)] font-medium">{aiSuggestion}</p>
                    </div>
                </div>
            )}

            {/* Participants around the edges (Campfire Style) */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {tracks.map((track, index) => {
                    // Distribute angles. Start from -90 (top) or 90 (bottom)
                    // Let's start from bottom (-90 is top, 90 is bottom in CSS logic if 0 is right)
                    // Actually, let's distribute evenly starting from angle 0 (Right)
                    const total = tracks.length;
                    const angleStep = 360 / total;
                    const angle = index * angleStep;

                    return (
                        <ParticipantCircle
                            key={track.participant.identity}
                            trackRef={track}
                            angle={angle}
                            radius={RADIUS}
                        />
                    );
                })}
            </div>
        </div>
    );
};
