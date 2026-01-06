import React from "react";
import { Message } from "@memoshare/core/src/types";
import { cn } from "@memoshare/ui/src/utils";

interface ChatBubbleProps {
    message: Message;
    isMe: boolean;
}

export const ChatBubble = ({ message, isMe }: ChatBubbleProps) => {
    return (
        <div
            className={cn(
                "flex w-full mb-2",
                isMe ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[70%] px-3 py-2 rounded-2xl text-sm",
                    isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                )}
            >
                {message.content}
            </div>
        </div>
    );
};
