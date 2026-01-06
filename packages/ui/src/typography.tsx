import * as React from "react";
import { cn } from "./utils";

export function Heading({
    className,
    level = 1,
    children,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 }) {
    const Tag = `h${level}` as React.ElementType;
    const sizes = {
        1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground",
        2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-foreground",
        3: "scroll-m-20 text-2xl font-semibold tracking-tight text-foreground",
        4: "scroll-m-20 text-xl font-semibold tracking-tight text-foreground",
    };

    return (
        <Tag className={cn("ui-text-foreground", sizes[level], className)} {...props}>
            {children}
        </Tag>
    );
}

export function Text({
    className,
    variant = "body",
    children,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: "body" | "muted" | "small" | "lead";
}) {
    const variants = {
        body: "leading-7 [&:not(:first-child)]:mt-6 text-foreground",
        muted: "text-sm text-muted-foreground",
        small: "text-sm font-medium leading-none text-foreground",
        lead: "text-xl text-muted-foreground",
    };

    return (
        <p className={cn(variants[variant], className)} {...props}>
            {children}
        </p>
    );
}
