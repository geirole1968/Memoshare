import React, { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { Card, CardContent, Text } from "@memoshare/ui";
import { FamilyMember } from "@memoshare/core";

type FamilyMemberNodeData = Node<{ label: string; member: FamilyMember }, "familyMember">;

const FamilyMemberNode = ({ data }: NodeProps<FamilyMemberNodeData>) => {
    const birthYear = data.member.birthDate?.split("-")[0] || "?";
    const deathYear = data.member.deathDate?.split("-")[0];
    const dateString = deathYear ? `${birthYear} - ${deathYear}` : `f. ${birthYear}`;

    return (
        <div className="w-64">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground" />
            <Card className="overflow-hidden border-2 hover:border-primary transition-colors cursor-pointer shadow-sm rounded-2xl bg-card">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-secondary/30">
                        {data.member.avatarUrl ? (
                            <img src={data.member.avatarUrl} alt={data.member.firstName} className="w-full h-full object-cover" />
                        ) : (
                            <span>{data.member.gender === "female" ? "👩" : "👨"}</span>
                        )}
                    </div>
                    <div className="text-left overflow-hidden">
                        <Text variant="small" className="font-bold text-base truncate text-foreground">
                            {data.member.firstName} {data.member.lastName}
                        </Text>
                        <Text variant="muted" className="text-xs text-muted-foreground">
                            {dateString}
                        </Text>
                    </div>
                </CardContent>
            </Card>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-muted-foreground" />
        </div>
    );
};

export default memo(FamilyMemberNode);
