"use client";

import React, { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Text } from "@memoshare/ui";
import { MOCK_FAMILY_MEMBERS } from "@memoshare/core";

export default function FamilyRoom() {
    const [inviteEmail, setInviteEmail] = useState("");
    const [members, setMembers] = useState(MOCK_FAMILY_MEMBERS);

    const handleInvite = () => {
        if (!inviteEmail) return;
        alert(`Invitasjon sendt til ${inviteEmail}`);
        setInviteEmail("");
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Familierom</CardTitle>
                <Text variant="muted">Administrer tilgang og inviter familiemedlemmer.</Text>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Text variant="small">Inviter nytt medlem</Text>
                        <Input
                            placeholder="epost@eksempel.no"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleInvite}>Send invitasjon</Button>
                </div>

                <div className="space-y-4">
                    <Text variant="lead" className="text-lg font-semibold">Medlemmer</Text>
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                                        {member.firstName[0]}
                                    </div>
                                    <div>
                                        <Text className="font-medium">{member.firstName} {member.lastName}</Text>
                                        <Text variant="small" className="text-muted-foreground">
                                            {member.id === "1" ? "Admin" : "Bidragsyter"}
                                        </Text>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">Endre</Button>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
