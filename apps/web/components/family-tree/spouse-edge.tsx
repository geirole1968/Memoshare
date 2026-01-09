import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';

export default function SpouseEdge({
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
    const [edgePath] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <BaseEdge
            path={edgePath}
            markerEnd={markerEnd}
            style={{
                ...style,
                strokeWidth: 2,
                stroke: '#FF69B4', // Hot pink for love/partners? Or just a different color. Let's go with a warm color.
                strokeDasharray: '5,5', // Dashed line
            }}
        />
    );
}
