"use client";

import React, { useState, useRef } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Text } from "@memoshare/ui";

// Mock upload function
const mockUploadFile = async (file: File) => {
    return new Promise<{ path: string; url: string }>((resolve) => {
        setTimeout(() => {
            resolve({
                path: `uploads/${file.name}`,
                url: URL.createObjectURL(file),
            });
        }, 1500);
    });
};

export default function MediaUpload() {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        setUploading(true);

        try {
            // In a real app, we would upload to Supabase Storage here
            // const { data, error } = await supabase.storage.from('media').upload(...)
            const result = await mockUploadFile(file);

            setUploadedFiles((prev) => [...prev, { name: file.name, url: result.url }]);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Last opp minner</CardTitle>
                <Text variant="muted">Del bilder og videoer med familien.</Text>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="file:ui-mr-4 file:ui-py-2 file:ui-px-4 file:ui-rounded-full file:ui-border-0 file:ui-text-sm file:ui-font-semibold file:ui-bg-primary file:ui-text-primary-foreground hover:file:ui-bg-primary-hover"
                    />
                    {uploading && <Text variant="small">Laster opp...</Text>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                            {file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img src={file.url} alt={file.name} className="object-cover w-full h-full" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Text variant="small">{file.name}</Text>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
