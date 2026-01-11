import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const UnionNode = () => {
    return (
        <div className="w-1 h-1 bg-black rounded-full opacity-0">
            {/* Inputs from Parents */}
            <Handle type="target" position={Position.Top} id="target" className="!bg-transparent !border-none" />

            {/* Output to Children */}
            <Handle type="source" position={Position.Bottom} id="source" className="!bg-transparent !border-none" />
        </div>
    );
};

export default memo(UnionNode);
