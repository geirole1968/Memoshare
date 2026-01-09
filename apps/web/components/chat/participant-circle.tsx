"use client";

import React from 'react';
import { ParticipantTile, useParticipantContext } from '@livekit/components-react';
import { TrackReferenceOrPlaceholder } from '@livekit/components-core';

interface ParticipantCircleProps {
    trackRef: TrackReferenceOrPlaceholder;
    angle: number; // Angle in degrees for positioning
    radius: number; // Distance from center in %
}

export const ParticipantCircle = ({ trackRef, angle, radius }: ParticipantCircleProps) => {
    const participant = trackRef.participant;
    const isSpeaking = participant.isSpeaking;

    // Calculate position based on angle and radius
    // Center is 50%, 50%
    // We convert angle to radians
    const rad = (angle * Math.PI) / 180;
    const x = 50 + radius * Math.cos(rad);
    const y = 50 + radius * Math.sin(rad);

    return (
        <div
            className="absolute w-32 h-32 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{
                left: `${x}%`,
                top: `${y}%`,
            }}
        >
            <div className={`relative w-full h-full rounded-full overflow-hidden border-4 transition-all duration-300 ${isSpeaking ? 'border-[var(--primary)] shadow-[0_0_20px_var(--primary)] scale-110' : 'border-white shadow-lg'}`}>
                <ParticipantTile
                    trackRef={trackRef}
                    className="w-full h-full object-cover"
                    disableSpeakingIndicator={true} // We handle it with custom CSS
                />

                {/* Name Tag */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    {participant.identity}
                </div>
            </div>
        </div>
    );
};
