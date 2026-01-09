import { Card, CardContent, Heading, Text } from "@memoshare/ui";
import { FamilyTreeContainer } from "../../components/family-tree/family-tree-container";

export default function TreePage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="space-y-2">
                <Heading level={2}>Ditt Familietre</Heading>
                <Text variant="muted">Utforsk din familiehistorie og se hvordan generasjonene henger sammen.</Text>
            </div>

            <Card className="h-[calc(100vh-200px)] min-h-[600px]">
                <CardContent className="h-full p-0">
                    <FamilyTreeContainer />
                </CardContent>
            </Card>
        </div>
    );
}
