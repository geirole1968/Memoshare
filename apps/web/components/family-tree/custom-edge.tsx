import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            {/* Base Path */}
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: '#E5E7EB' }} />

            {/* Animated Pulse Path */}
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: 2,
                    stroke: 'var(--primary)',
                    strokeDasharray: 5,
                    animation: 'dashdraw 30s linear infinite',
                    opacity: 0.6
                }}
            />
            <style>
                {`
          @keyframes dashdraw {
            from { stroke-dashoffset: 500; }
            to { stroke-dashoffset: 0; }
          }
        `}
            </style>
        </>
    );
}
