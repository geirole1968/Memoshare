"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PostMedia } from '@memoshare/core/src/types';
import { useChat } from './chat-context';

interface SharedCanvasProps {
    roomId: string;
}

interface CanvasState {
    media?: PostMedia;
    timestamp?: number;
}

export const SharedCanvas = ({ roomId }: SharedCanvasProps) => {
    const [canvasState, setCanvasState] = useState<CanvasState>({});
    const [cursors, setCursors] = useState<Record<string, { x: number, y: number, name: string }>>({});
    const supabase = createClient();
    const { currentUser } = useChat();

    useEffect(() => {
        const channel = supabase.channel(`room_${roomId}`)
            .on('broadcast', { event: 'MEDIA_SHARE' }, (payload) => {
                setCanvasState(payload.payload as CanvasState);
            })
            .on('broadcast', { event: 'CURSOR_MOVE' }, (payload) => {
                const { userId, x, y, name } = payload.payload;
                if (userId !== currentUser.id) {
                    setCursors(prev => ({ ...prev, [userId]: { x, y, name } }));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, supabase, currentUser.id]);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const mediaData = e.dataTransfer.getData('application/json');
        if (mediaData) {
            try {
                const media = JSON.parse(mediaData) as PostMedia;
                // Broadcast to others
                await supabase.channel(`room_${roomId}`).send({
                    type: 'broadcast',
                    event: 'MEDIA_SHARE',
                    payload: { media, timestamp: Date.now() }
                });
                // Update local state
                setCanvasState({ media, timestamp: Date.now() });
            } catch (err) {
                console.error("Failed to parse dropped media", err);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Throttle this in a real app
        supabase.channel(`room_${roomId}`).send({
            type: 'broadcast',
            event: 'CURSOR_MOVE',
            payload: { userId: currentUser.id, name: currentUser.firstName, x, y }
        });
    };

    return (
        <div
            className="absolute inset-4 md:inset-20 bg-[#FAFAF8] rounded-3xl shadow-2xl flex items-center justify-center z-0 overflow-hidden transition-all duration-500 cursor-none" // Hide default cursor? Maybe just crosshair
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onMouseMove={handleMouseMove}
        >
            {/* Render Cursors */}
            {Object.entries(cursors).map(([id, cursor]) => (
                <div
                    key={id}
                    className="absolute pointer-events-none transition-all duration-100 z-50"
                    style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L17.9169 12.3673H5.65376Z" fill="#FE5B00" stroke="white" />
                    </svg>
                    <span className="absolute left-4 top-4 bg-[#FE5B00] text-white text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        {cursor.name}
                    </span>
                </div>
            ))}

            {canvasState.media ? (
                <div className="relative w-full h-full p-4 flex items-center justify-center animate-in fade-in zoom-in duration-500">
                    {canvasState.media.type === 'image' ? (
                        <img
                            src={canvasState.media.url}
                            alt="Shared Memory"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                    ) : (
                        <video
                            src={canvasState.media.url}
                            controls
                            className="max-w-full max-h-full rounded-lg shadow-lg"
                        />
                    )}
                </div>
            ) : (
                <div className="text-center text-gray-400 p-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <h2 className="text-2xl font-serif text-[var(--primary)] mb-2">Felles Lerret</h2>
                    <p>Dra et bilde fra albumet hit for å dele det med alle</p>
                </div>
            )}
        </div>
    );
};
