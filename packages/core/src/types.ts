export interface FamilyMember {
    id: string; // family_member_id
    userId: string; // profile_id
    firstName: string;
    lastName: string;
    role: "admin" | "contributor" | "member";
    avatarUrl?: string;
    gender?: "male" | "female" | "other"; // Not in DB yet
    birthDate?: string; // Not in DB yet
    deathDate?: string; // Not in DB yet
    bio?: string; // Not in DB yet

    // Legacy fields from mock data (optional for now)
    middleName?: string;
    title?: string;
    birthPlace?: string;
    isDeceased?: boolean;
    address?: string;
    zipCode?: string;
    city?: string;
    phone?: string;
    email?: string;
}

// DB Types (Snake Case)
export interface DbProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    created_at: string;
}

export interface DbFamily {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
}

export interface DbFamilyMember {
    id: string;
    family_id: string;
    user_id: string;
    role: "admin" | "contributor" | "member";
    joined_at: string;

    // Joined Profile Data (fetched via join)
    first_name?: string; // mapped from full_name or separate
    last_name?: string;
    full_name?: string;
    avatar_url?: string;
    email?: string;
}

export interface DbRelationship {
    id: string;
    family_id: string;
    from_id: string;
    to_id: string;
    type: "parent" | "child" | "spouse" | "sibling";
}

export interface Relationship {
    id: string;
    fromId: string;
    toId: string;
    type: "parent" | "child" | "spouse" | "sibling";
}

export interface FamilyTreeData {
    members: FamilyMember[];
    relationships: Relationship[];
}

export interface Message {
    id: string;
    conversationId: string; // Mapped from conversation_id
    senderId: string; // Mapped from sender_id
    content: string;
    timestamp: string; // Mapped from created_at
    read: boolean;
}

export interface Conversation {
    id: string;
    familyId: string; // Mapped from family_id
    isGroup: boolean; // Mapped from is_group
    name?: string;
    updatedAt: string; // Mapped from created_at (or last message)
    participantIds: string[]; // IDs of family members
    messages: Message[];
}

export interface Post {
    id: string;
    familyId: string; // Mapped from family_id
    authorId: string; // Mapped from author_id
    content: string;
    imageUrl?: string; // Mapped from image_url
    title?: string; // Optional
    location?: string; // Optional
    media?: PostMedia[]; // Optional
    timestamp: string; // Mapped from created_at
    author?: FamilyMember; // Mapped from DbProfile
    likes: string[];
    comments: Comment[];
}

export interface Comment {
    id: string;
    postId: string; // Mapped from post_id
    authorId: string; // Mapped from author_id
    content: string;
    timestamp: string; // Mapped from created_at
    author?: FamilyMember;
}

export interface MediaTag {
    x: number; // Percentage (0-100)
    y: number; // Percentage (0-100)
    userId: string;
}

export interface PostMedia {
    type: 'image' | 'video';
    url: string;
    tags?: MediaTag[];

    // Metadata
    dateTaken?: string; // ISO string
    location?: {
        lat: number;
        lng: number;
        name?: string; // Optional reverse geocoded name
    };
    faces?: {
        x: number;
        y: number;
        width: number;
        height: number;
        descriptor?: number[]; // For face recognition
    }[];
}
