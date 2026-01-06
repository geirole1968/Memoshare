"use client";

import { useState } from "react";
import { MOCK_FAMILY_MEMBERS } from "@memoshare/core";
import { FamilyMember } from "@memoshare/core";
import { ArrowLeft, Mail, Shield, User, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminPage() {
    const [members, setMembers] = useState<FamilyMember[]>(MOCK_FAMILY_MEMBERS);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    const toggleRole = (id: string) => {
        setMembers((prev) =>
            prev.map((member) => {
                if (member.id === id) {
                    return {
                        ...member,
                        role: member.role === "admin" ? "contributor" : "admin",
                    };
                }
                return member;
            })
        );
    };

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate sending invitation
        alert(`Invitasjon sendt til ${inviteEmail}`);
        setInviteEmail("");
        setIsInviteModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-[#2D3748]">
                                Administrer Familierom
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Administrer medlemmer og rettigheter
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-all shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Inviter medlem</span>
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-700">
                            Medlemmer ({members.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {member.avatarUrl ? (
                                            <Image
                                                src={member.avatarUrl}
                                                alt={`${member.firstName} ${member.lastName}`}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {member.firstName} {member.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {member.email || "Ingen e-post registrert"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-sm font-medium ${member.role === "admin"
                                                ? "text-[var(--primary)]"
                                                : "text-gray-500"
                                                }`}
                                        >
                                            {member.role === "admin"
                                                ? "Admin"
                                                : "Bidragsyter"}
                                        </span>
                                        <button
                                            onClick={() => toggleRole(member.id)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${member.role === "admin"
                                                ? "bg-[var(--primary)]"
                                                : "bg-gray-200"
                                                }`}
                                        >
                                            <span
                                                className={`${member.role === "admin"
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                Inviter familiemedlem
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Send en invitasjon via e-post for å bli med i familierommet.
                            </p>
                        </div>
                        <form onSubmit={handleInvite} className="p-6">
                            <div className="mb-4">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    E-postadresse
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                                        placeholder="ola.nordmann@eksempel.no"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Avbryt
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium shadow-sm"
                                >
                                    Send invitasjon
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
