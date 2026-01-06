import { FamilyMember, Relationship } from "./types";

export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
    {
        id: "1",
        firstName: "Olav",
        lastName: "Nordmann",
        birthDate: "1950-05-12",
        gender: "male",
        bio: "Bestefar og fiskeentusiast.",
        role: "admin",
    },
    {
        id: "2",
        firstName: "Kari",
        lastName: "Nordmann",
        birthDate: "1952-08-20",
        gender: "female",
        bio: "Bestemor og familiens samlingspunkt.",
        role: "admin",
    },
    {
        id: "3",
        firstName: "Per",
        lastName: "Nordmann",
        birthDate: "1975-03-15",
        gender: "male",
        bio: "Far, elsker fotball.",
        role: "contributor",
    },
    {
        id: "4",
        firstName: "Anne",
        lastName: "Hansen",
        birthDate: "1978-11-10",
        gender: "female",
        bio: "Mor, jobber som lærer.",
        role: "contributor",
    },
    {
        id: "5",
        firstName: "Lise",
        lastName: "Nordmann",
        birthDate: "2005-06-01",
        gender: "female",
        bio: "Datter, student.",
        role: "contributor",
    },
    {
        id: "6",
        firstName: "Ole",
        lastName: "Nordmann",
        birthDate: "2008-09-22",
        gender: "male",
        bio: "Sønn, gamer.",
        role: "contributor",
    },
];

export const MOCK_RELATIONSHIPS: Relationship[] = [
    { id: "r1", fromId: "1", toId: "2", type: "spouse" },
    { id: "r2", fromId: "1", toId: "3", type: "parent" },
    { id: "r3", fromId: "2", toId: "3", type: "parent" },
    { id: "r4", fromId: "3", toId: "4", type: "spouse" },
    { id: "r5", fromId: "3", toId: "5", type: "parent" },
    { id: "r6", fromId: "4", toId: "5", type: "parent" },
    { id: "r7", fromId: "3", toId: "6", type: "parent" },
    { id: "r8", fromId: "4", toId: "6", type: "parent" },
];

import { Conversation, Post } from "./types";

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "c1",
        participantIds: ["1", "3"], // Olav and Per
        updatedAt: "2023-10-27T10:30:00Z",
        messages: [
            {
                id: "m1",
                senderId: "1",
                content: "Hei Per! Hvordan går det med fotballen?",
                timestamp: "2023-10-27T10:00:00Z",
                read: true,
            },
            {
                id: "m2",
                senderId: "3",
                content: "Hei pappa! Det går bra, vi vant forrige kamp!",
                timestamp: "2023-10-27T10:05:00Z",
                read: true,
            },
            {
                id: "m3",
                senderId: "1",
                content: "Så bra! Gratulerer!",
                timestamp: "2023-10-27T10:30:00Z",
                read: true,
            },
        ],
    },
    {
        id: "c2",
        participantIds: ["2", "4"], // Kari and Anne
        updatedAt: "2023-10-26T14:00:00Z",
        messages: [
            {
                id: "m4",
                senderId: "4",
                content: "Hei Kari, har du oppskriften på eplekaken din?",
                timestamp: "2023-10-26T13:00:00Z",
                read: true,
            },
            {
                id: "m5",
                senderId: "2",
                content: "Selvfølgelig! Jeg skal finne den frem til deg.",
                timestamp: "2023-10-26T14:00:00Z",
                read: true,
            },
        ],
    },
];

export const MOCK_POSTS: Post[] = [
    // Intentionally empty for now
];
