"use client";

import React from "react";
import { Button, Heading, Text } from "@memoshare/ui";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">M</span>
                    </div>
                    <Heading level={3} className="text-lg md:text-xl text-primary">Memoshare</Heading>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    <a href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground">Hjem</a>
                    <a href="/tree" className="text-sm font-medium text-foreground/80 hover:text-foreground">Familietre</a>
                    <a href="/memories" className="text-sm font-medium text-foreground/80 hover:text-foreground">Minner</a>
                    <a href="/room" className="text-sm font-medium text-foreground/80 hover:text-foreground">Familierom</a>
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm">Logg inn</Button>
                    <Button size="sm">Kom i gang</Button>
                </div>
            </div>
        </header>
    );
}
