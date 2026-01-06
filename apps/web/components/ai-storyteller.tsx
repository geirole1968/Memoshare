"use client";

import React, { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Text } from "@memoshare/ui";

// Mock AI generation function
const mockGenerateStory = async () => {
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            resolve(
                "Det var en solfylt dag i juli 1975 da Olav og Kari tok med seg lille Per på hans første fisketur. Vannet var blikkstille, og fuglene sang. Per var bare noen måneder gammel, men han smilte bredt da Olav fikk en stor ørret på kroken. Dette bildet fanger øyeblikket perfekt – gleden, samholdet og starten på en livslang tradisjon for familien Nordmann."
            );
        }, 2000);
    });
};

export default function AIStoryteller() {
    const [generating, setGenerating] = useState(false);
    const [story, setStory] = useState<string | null>(null);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const generatedStory = await mockGenerateStory();
            setStory(generatedStory);
        } catch (error) {
            console.error("Failed to generate story", error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    ✨ AI Historieforteller
                </CardTitle>
                <Text variant="muted">La AI hjelpe deg å sette ord på minnene.</Text>
            </CardHeader>
            <CardContent className="space-y-4">
                {!story ? (
                    <div className="text-center py-8 space-y-4">
                        <Text>Vi fant 3 bilder fra "Sommeren 1975". Vil du at jeg skal lage en historie?</Text>
                        <Button onClick={handleGenerate} disabled={generating} className="w-full sm:w-auto">
                            {generating ? "Skriver historie..." : "Generer historie"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-4 bg-background/50 rounded-xl border italic">
                            <Text className="leading-relaxed">"{story}"</Text>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStory(null)}>Prøv igjen</Button>
                            <Button className="flex-1">Lagre historie</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
