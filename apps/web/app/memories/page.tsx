"use client";

import { Heading, Text } from "@memoshare/ui";
import MediaUpload from "../../components/media-upload";
import AIStoryteller from "../../components/ai-storyteller";

export default function MemoriesPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="space-y-2">
                <Heading level={2}>Minner</Heading>
                <Text variant="muted">Samle bilder og videoer fra familiens historie.</Text>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <MediaUpload />
                </div>
                <div className="space-y-8">
                    <AIStoryteller />
                </div>
            </div>
        </div>
    );
}
