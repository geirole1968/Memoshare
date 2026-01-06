"use client";

import React from "react";
import { Text } from "@memoshare/ui";

export function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4 md:px-8">
                <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2 md:px-0">
                    <Text variant="small" className="text-center md:text-left">
                        &copy; {new Date().getFullYear()} Memoshare. Alle rettigheter reservert.
                    </Text>
                </div>
                <div className="flex gap-4">
                    <Text variant="small" className="hover:underline cursor-pointer">Personvern</Text>
                    <Text variant="small" className="hover:underline cursor-pointer">Vilkår</Text>
                </div>
            </div>
        </footer>
    );
}
