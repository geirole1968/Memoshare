export interface FamilyMember {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    title?: string; // Mr, Mrs, Dr, etc.
    gender?: "male" | "female" | "other";
    birthDate?: string;
    birthPlace?: string;
    deathDate?: string;
    isDeceased?: boolean;
    avatarUrl?: string;
    bio?: string;

    // Contact Info
    address?: string;
    zipCode?: string;
    city?: string;
    email?: string;
    phone?: string;
    role?: "admin" | "contributor";
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
    senderId: string;
    content: string;
    timestamp: string; // ISO string
    read: boolean;
}

export interface Conversation {
    id: string;
    participantIds: string[]; // IDs of family members in the chat
    messages: Message[];
    updatedAt: string; // ISO string
}

export interface Comment {
    id: string;
    authorId: string;
    content: string;
    timestamp: string;
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
}

export interface Post {
    id: string;
    authorId: string;
    title?: string;
    content: string;
    media?: PostMedia[];
    location?: string;
    likes: string[]; // User IDs of people who liked
    comments: Comment[];
    timestamp: string;
}
