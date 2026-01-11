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
                strokeWidth: 1.5,
                stroke: '#9CA3AF', // Gray 400, matching CustomEdge
                // strokeDasharray: '5,5', // Removed dashed line
            }}
        />
    );
}
