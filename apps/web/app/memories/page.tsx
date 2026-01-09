"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heading, Text } from "@memoshare/ui";
import { Image as ImageIcon } from "lucide-react";

interface MemoryImage {
    id: string;
    url: string;
    postId: string;
    timestamp: string;
}

export default function MemoriesPage() {
    const [images, setImages] = useState<MemoryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user's family
        const { data: members } = await supabase
            .from("family_members")
            .select("family_id")
            .eq("user_id", user.id)
            .limit(1);

        const familyId = members?.[0]?.family_id;

        if (familyId) {
            // Fetch posts with images
            const { data: posts } = await supabase
                .from("posts")
                .select("id, image_url, created_at")
                .eq("family_id", familyId)
                .not("image_url", "is", null)
                .order("created_at", { ascending: false });

            if (posts) {
                const memoryImages: MemoryImage[] = posts.map((p: any) => ({
                    id: p.id,
                    url: p.image_url,
                    postId: p.id,
                    timestamp: p.created_at
                }));
                setImages(memoryImages);
            }
        }
        setLoading(false);
    };

    if (loading) return <div className="p-8">Laster minner...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="space-y-2">
                <Heading level={2}>Minner</Heading>
                <Text variant="muted">Et galleri av alle delte øyeblikk.</Text>
            </div>

            {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <ImageIcon size={48} className="mb-4 opacity-50" />
                    <p>Ingen bilder delt enda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div key={img.id} className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer">
                            <img
                                src={img.url}
                                alt="Minne"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs font-medium">
                                    {new Date(img.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
