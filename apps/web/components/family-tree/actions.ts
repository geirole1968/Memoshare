"use server";

import { createClient } from "@/lib/supabase/server";
import { DbFamilyMember, DbRelationship, FamilyMember, Relationship } from "@memoshare/core";
import { revalidatePath } from "next/cache";

// --- Helpers to map DB types to UI types ---

function mapMemberToUI(member: any): FamilyMember {
    // Priority: Direct columns in family_members -> Linked Profile
    const firstName = member.first_name || member.profiles?.full_name?.split(" ")[0] || "Ukjent";
    const lastName = member.last_name || member.profiles?.full_name?.split(" ").slice(1).join(" ") || "";

    return {
        id: member.id,
        userId: member.user_id,
        firstName,
        lastName,
        middleName: member.middle_name,
        role: member.role,
        avatarUrl: member.avatar_url || member.profiles?.avatar_url || undefined,
        gender: member.gender || "other",
        birthDate: member.birth_date,
        deathDate: member.death_date,
        birthPlace: member.birth_place,
        isDeceased: member.is_deceased,
        address: member.address,
        city: member.city,
        zipCode: member.zip_code,
        email: member.email || member.profiles?.email,
        phone: member.phone,
        title: member.title,
    };
}

function mapRelationshipToUI(rel: DbRelationship): Relationship {
    return {
        id: rel.id,
        fromId: rel.from_id,
        toId: rel.to_id,
        type: rel.type,
    };
}

// --- Actions ---

export async function getFamilyTreeData(familyId: string) {
    const supabase = await createClient();

    // 1. Fetch Members
    const { data: membersData, error: membersError } = await supabase
        .from("family_members")
        .select(`
            *,
            profiles (
                full_name,
                avatar_url,
                email
            )
        `)
        .eq("family_id", familyId);

    if (membersError) throw new Error(membersError.message);

    // 2. Fetch Relationships
    const { data: relsData, error: relsError } = await supabase
        .from("relationships")
        .select("*")
        .eq("family_id", familyId);

    if (relsError) throw new Error(relsError.message);

    return {
        members: (membersData as any[]).map(mapMemberToUI),
        relationships: (relsData as DbRelationship[]).map(mapRelationshipToUI),
    };
}

export async function addFamilyMember(
    familyId: string,
    data: Partial<FamilyMember> & {
        relationType?: string;
        relativeId?: string;
        existingMemberId?: string;
        relationshipStatus?: string;
        additionalRelationships?: {
            relativeId: string;
            relationType: string;
            status?: string;
        }[];
    }
) {
    const supabase = await createClient();
    let newMemberId = data.existingMemberId;
    let newMember = null;

    // 1. Insert into family_members ONLY if not linking existing
    if (!newMemberId) {
        const { data: createdMember, error: memberError } = await supabase
            .from("family_members")
            .insert({
                family_id: familyId,
                first_name: data.firstName,
                last_name: data.lastName,
                middle_name: data.middleName,
                birth_date: data.birthDate,
                death_date: data.deathDate,
                birth_place: data.birthPlace,
                gender: data.gender,
                avatar_url: data.avatarUrl,
                address: data.address,
                city: data.city,
                zip_code: data.zipCode,
                email: data.email,
                phone: data.phone,
                title: data.title,
                is_deceased: data.isDeceased,
                role: 'member'
            })
            .select()
            .single();

        if (memberError) {
            console.error("Error adding member:", memberError);
            return { error: memberError.message };
        }
        newMember = createdMember;
        newMemberId = createdMember.id;
    }

    // 2. Create Relationship if provided
    const relationshipsToCreate = [];

    if (data.relationType && data.relativeId) {
        relationshipsToCreate.push({
            relativeId: data.relativeId,
            relationType: data.relationType,
            status: data.relationshipStatus
        });
    }

    if (data.additionalRelationships) {
        relationshipsToCreate.push(...data.additionalRelationships);
    }

    const createdRelationships = [];

    for (const rel of relationshipsToCreate) {
        if (!newMemberId) continue;

        let fromId = rel.relativeId;
        let toId = newMemberId;
        let type = 'parent'; // Default

        // Logic to determine relationship direction and type
        switch (rel.relationType) {
            case 'father':
            case 'mother':
            case 'parent':
                // New person is parent of existing
                fromId = newMemberId;
                toId = rel.relativeId;
                type = 'parent';
                break;
            case 'son':
            case 'daughter':
            case 'child':
                // New person is child of existing
                fromId = rel.relativeId;
                toId = newMemberId;
                type = 'parent';
                break;
            case 'partner':
            case 'husband':
            case 'wife':
            case 'spouse':
                fromId = rel.relativeId;
                toId = newMemberId;
                type = 'spouse';
                break;
            case 'brother':
            case 'sister':
            case 'sibling':
                fromId = rel.relativeId;
                toId = newMemberId;
                type = 'sibling';
                break;
        }

        const { data: createdRel, error: relError } = await supabase
            .from("relationships")
            .insert({
                family_id: familyId,
                from_id: fromId,
                to_id: toId,
                type: type,
                status: rel.status
            })
            .select()
            .single();

        if (relError) {
            console.error("Error creating relationship:", relError);
            // Continue creating other relationships even if one fails
        } else if (createdRel) {
            createdRelationships.push(mapRelationshipToUI(createdRel));
        }
    }

    revalidatePath("/tree");
    return { success: true, member: newMember, relationships: createdRelationships };
}

export async function updateFamilyMember(memberId: string, data: Partial<FamilyMember>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("family_members")
        .update({
            first_name: data.firstName,
            last_name: data.lastName,
            middle_name: data.middleName,
            birth_date: data.birthDate,
            death_date: data.deathDate,
            birth_place: data.birthPlace,
            gender: data.gender,
            avatar_url: data.avatarUrl,
            address: data.address,
            city: data.city,
            zip_code: data.zipCode,
            email: data.email,
            phone: data.phone,
            title: data.title,
            is_deceased: data.isDeceased,
        })
        .eq("id", memberId);

    if (error) return { error: error.message };
    revalidatePath("/tree");
    return { success: true };
}

export async function deleteFamilyMember(memberId: string) {
    console.log("Attempting to delete member:", memberId);
    const supabase = await createClient();

    const { error } = await supabase
        .from("family_members")
        .delete()
        .eq("id", memberId);

    if (error) {
        console.error("Error deleting member:", error);
        return { error: error.message };
    }

    console.log("Member deleted successfully");
    revalidatePath("/tree");
    return { success: true };
}

export async function createFamily(name: string, memberDetails?: Partial<FamilyMember>) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Not authenticated" };

        // 1. Create Family
        const { data: family, error: familyError } = await supabase
            .from("families")
            .insert({
                name: name,
                created_by: user.id
            })
            .select()
            .single();

        if (familyError) {
            console.error("Error creating family:", familyError);
            return { error: "Kunne ikke opprette familie: " + familyError.message };
        }

        console.log("Family created:", family);

        // 2. Add User as Member
        const { error: memberError } = await supabase
            .from("family_members")
            .insert({
                family_id: family.id,
                user_id: user.id,
                role: 'admin',
                first_name: memberDetails?.firstName,
                last_name: memberDetails?.lastName,
                middle_name: memberDetails?.middleName,
                birth_date: memberDetails?.birthDate,
                death_date: memberDetails?.deathDate,
                birth_place: memberDetails?.birthPlace,
                gender: memberDetails?.gender,
                avatar_url: memberDetails?.avatarUrl,
                address: memberDetails?.address,
                city: memberDetails?.city,
                zip_code: memberDetails?.zipCode,
                email: memberDetails?.email,
                phone: memberDetails?.phone,
                title: memberDetails?.title,
                is_deceased: memberDetails?.isDeceased,
            });

        if (memberError) {
            console.error("Error adding first member:", memberError);
            return { error: "Kunne ikke legge til medlem: " + memberError.message };
        }

        console.log("Member added successfully");

        revalidatePath("/tree");
        return { success: true, family };
    } catch (e: any) {
        console.error("Unexpected error in createFamily:", e);
        return { error: "Uventet feil: " + (e.message || e) };
    }
}
