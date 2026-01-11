import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MotionWrapper, PulseWrapper } from '../ui/motion-wrapper';

const CustomNode = ({ data, selected }: NodeProps) => {
    return (
        <PulseWrapper>
            <div className={`relative group flex flex-col items-center w-24 ${selected ? 'z-50' : 'z-10'}`}>
                {/* Connection Handles - Positioned relative to the w-24 (96px) container to match w-16 (64px) avatar */}

                {/* Top Handle - Top of Avatar (0px) */}
                <Handle
                    type="target"
                    position={Position.Top}
                    id="top-target"
                    className="!bg-transparent !border-none !w-2 !h-2"
                    style={{ top: 0, transform: 'translate(-50%, -50%)' }}
                />

                {/* Side Handles - Center of Avatar (32px down), indented 16px to hit avatar edge */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right-source"
                    className="!bg-transparent !border-none"
                    style={{ top: 32, right: 16, transform: 'translate(50%, -50%)' }}
                />
                <Handle
                    type="target"
                    position={Position.Right}
                    id="right-target"
                    className="!bg-transparent !border-none"
                    style={{ top: 32, right: 16, transform: 'translate(50%, -50%)' }}
                />

                <Handle
                    type="source"
                    position={Position.Left}
                    id="left-source"
                    className="!bg-transparent !border-none"
                    style={{ top: 32, left: 16, transform: 'translate(-50%, -50%)' }}
                />
                <Handle
                    type="target"
                    position={Position.Left}
                    id="left-target"
                    className="!bg-transparent !border-none"
                    style={{ top: 32, left: 16, transform: 'translate(-50%, -50%)' }}
                />

                {/* Bottom Handle - Bottom of Avatar (64px) */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom-source"
                    className="!bg-transparent !border-none !w-2 !h-2"
                    style={{ top: 64, bottom: 'auto', transform: 'translate(-50%, 50%)' }}
                />

                {/* Avatar Wrapper */}
                <div className="relative w-16 h-16">
                    {/* Avatar Circle */}
                    <div
                        className={`
                w-full h-full rounded-full overflow-hidden border-4 transition-all duration-300
                ${selected ? 'border-[var(--primary)] shadow-[0_0_20px_rgba(193,91,68,0.4)] scale-110' : 'border-white shadow-lg'}
            `}
                    >
                        {data.avatarUrl ? (
                            <img
                                src={data.avatarUrl as string}
                                alt={data.label as string}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-[var(--primary)] font-bold text-xl">
                                {(data.label as string)?.[0]}
                            </div>
                        )}
                    </div>
                </div>

                {/* Name Label */}
                <div className={`
          mt-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-white/50
          transition-all duration-300
          ${selected ? 'scale-105 bg-white' : ''}
        `}>
                    <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                        {data.label as string}
                    </p>
                </div>

                {/* Add Relative Button */}
                <button
                    className="absolute -bottom-3 w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (data.onAddRelative) {
                            (data.onAddRelative as Function)(data.member);
                        }
                    }}
                >
                    <span className="text-xs font-bold">+</span>
                </button>
            </div>
        </PulseWrapper>
    );
};

export default memo(CustomNode);
