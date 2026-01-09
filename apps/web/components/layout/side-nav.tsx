"use client";

import React from "react";

export function SideNav() {
    return (
        <nav className="flex flex-col gap-2">
            <button className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/50 hover:bg-white/80 transition-all text-gray-900 font-medium">
                <span>🏠</span> Hjem
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/50 transition-all text-gray-600 font-medium">
                <span>👨‍👩‍👧‍👦</span> Familiefeed
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/50 transition-all text-gray-600 font-medium">
                <span>📸</span> Minner
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/50 transition-all text-gray-600 font-medium">
                <span>⚙️</span> Innstillinger
            </button>
        </nav>
    );
}
