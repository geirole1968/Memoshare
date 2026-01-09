"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FamilyMember } from "@memoshare/core/src/types";

export function useFamilyMembers(familyId?: string) {
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchMembers() {
            try {
                // If no familyId provided, try to find the user's first family
                let targetFamilyId = familyId;

                if (!targetFamilyId) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data: userFamilies } = await supabase
                        .from("family_members")
                        .select("family_id")
                        .eq("user_id", user.id)
                        .limit(1);

                    if (userFamilies && userFamilies.length > 0) {
                        targetFamilyId = userFamilies[0].family_id;
                    }
                }

                if (!targetFamilyId) {
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("family_members")
                    .select(`
                        id,
                        first_name,
                        last_name,
                        role,
                        avatar_url,
                        user_id,
                        user:profiles!user_id (
                            id,
                            full_name,
                            avatar_url
                        )
                    `)
                    .eq("family_id", targetFamilyId);

                if (error) {
                    console.error("Error fetching family members:", error);
                    return;
                }

                const mappedMembers: FamilyMember[] = data.map((item: any) => ({
                    id: item.id,
                    userId: item.user_id || item.user?.id,
                    firstName: item.first_name || item.user?.full_name?.split(" ")[0] || "Ukjent",
                    lastName: item.last_name || item.user?.full_name?.split(" ").slice(1).join(" ") || "",
                    role: item.role,
                    avatarUrl: item.avatar_url || item.user?.avatar_url,
                    bio: "" // Not in profile yet
                }));

                setMembers(mappedMembers);
            } catch (e) {
                console.error("Failed to fetch members", e);
            } finally {
                setLoading(false);
            }
        }

        fetchMembers();
    }, [familyId]);

    return { members, loading };
}
