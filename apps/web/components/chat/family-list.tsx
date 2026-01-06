"use client";

import React, { useState } from "react";
import { useChat } from "./chat-context";
import { MOCK_FAMILY_MEMBERS } from "@memoshare/core/src/mock-data";
import { MessageCircle, X, Search } from "lucide-react";

export const FamilyList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { startChat, currentUser } = useChat();

    const filteredMembers = MOCK_FAMILY_MEMBERS.filter(
        (m) =>
            m.id !== currentUser.id &&
            (m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="relative">
            {isOpen ? (
                <div className="w-80 h-[500px] bg-white border border-gray-200 rounded-t-lg shadow-xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-lg">Meldinger</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:bg-gray-100 rounded-full p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Søk etter familie..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-2">
                            <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Kontakter</p>
                            {filteredMembers.map((member) => (
                                <button
                                    key={member.id}
                                    onClick={() => {
                                        startChat(member.id);
                                        // Optional: close list on select? setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                >
                                    <div className="relative">
                                        {member.avatarUrl ? (
                                            <img src={member.avatarUrl} alt={member.firstName} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {member.firstName[0]}{member.lastName[0]}
                                            </div>
                                        )}
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {member.firstName} {member.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                            {member.bio || "Ingen status"}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform border border-gray-100"
                >
                    <MessageCircle size={28} className="text-primary" />
                </button>
            )}
        </div>
    );
};
