"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FamilyMember } from "@memoshare/core";
import { Heading, Text, Card, CardContent } from "@memoshare/ui";
import { Trash2, UserPlus, Shield, ShieldAlert, User } from "lucide-react";

export default function FamilyRoomAdminPage() {
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: familyMembers } = await supabase
            .from("family_members")
            .select(`
                *,
                profiles (
                    id, full_name, email, avatar_url
                )
            `)
            .eq("user_id", user.id); // First get user's families

        if (familyMembers && familyMembers.length > 0) {
            const familyId = familyMembers[0].family_id;

            // Now fetch all members of this family
            const { data: allMembers } = await supabase
                .from("family_members")
                .select(`
                    *,
                    profiles (
                        id, full_name, email, avatar_url
                    )
                `)
                .eq("family_id", familyId);

            if (allMembers) {
                const mapped: FamilyMember[] = allMembers.map((m: any) => ({
                    id: m.id,
                    userId: m.user_id,
                    firstName: m.profiles?.full_name?.split(" ")[0] || "Ukjent",
                    lastName: m.profiles?.full_name?.split(" ").slice(1).join(" ") || "",
                    role: m.role,
                    avatarUrl: m.profiles?.avatar_url,
                    email: m.profiles?.email,
                }));
                setMembers(mapped);
            }
        }
        setLoading(false);
    };

    const updateRole = async (memberId: string, newRole: "admin" | "contributor" | "member") => {
        // Optimistic update
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));

        const { error } = await supabase
            .from("family_members")
            .update({ role: newRole })
            .eq("id", memberId);

        if (error) {
            console.error("Failed to update role", error);
            alert("Kunne ikke endre rolle.");
            fetchMembers(); // Revert
        }
    };

    const removeMember = async (memberId: string) => {
        if (!confirm("Er du sikker på at du vil fjerne dette medlemmet?")) return;

        // Optimistic update
        setMembers(prev => prev.filter(m => m.id !== memberId));

        const { error } = await supabase
            .from("family_members")
            .delete()
            .eq("id", memberId);

        if (error) {
            console.error("Failed to remove member", error);
            alert("Kunne ikke fjerne medlem.");
            fetchMembers(); // Revert
        }
    };

    if (loading) return <div className="p-8">Laster...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Heading level={2}>Familierom Admin</Heading>
                    <Text variant="muted">Administrer medlemmer og roller i familien.</Text>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-[12px] font-medium hover:opacity-90 transition-opacity">
                    <UserPlus size={20} />
                    <span>Inviter ny</span>
                </button>
            </div>

            <div className="grid gap-4">
                {members.map((member) => (
                    <Card key={member.id} className="overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {member.avatarUrl ? (
                                    <img src={member.avatarUrl} alt={member.firstName} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                        {member.firstName[0]}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900">{member.firstName} {member.lastName}</h3>
                                    <p className="text-sm text-gray-500">{member.email || "Ingen e-post"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    {member.role === "admin" && <ShieldAlert size={16} className="text-red-500" />}
                                    {member.role === "contributor" && <Shield size={16} className="text-blue-500" />}
                                    {member.role === "member" && <User size={16} className="text-gray-500" />}

                                    <select
                                        value={member.role}
                                        onChange={(e) => updateRole(member.id, e.target.value as any)}
                                        className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="contributor">Bidragsyter</option>
                                        <option value="member">Medlem</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => removeMember(member.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Fjern medlem"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
