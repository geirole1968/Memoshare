"use client";

import { getFamilyTreeData, createFamily } from "./actions";
import FamilyTree from "./index";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { FamilyMember, Relationship } from "@memoshare/core";
import { Button } from "@memoshare/ui";
import RegistrationForm from "./registration-form";

export function FamilyTreeContainer() {
    const [loading, setLoading] = useState(true);
    const [familyId, setFamilyId] = useState<string | null>(null);
    const [data, setData] = useState<{ members: FamilyMember[], relationships: Relationship[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [debugLog, setDebugLog] = useState<string[]>([]);

    const addLog = (msg: string) => setDebugLog(prev => [...prev, new Date().toISOString().split('T')[1] + ': ' + msg]);

    const supabase = createClient();

    useEffect(() => {
        checkFamily();
    }, []);

    const checkFamily = async () => {
        addLog("Sjekker familie...");
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            addLog("Ingen bruker funnet.");
            setLoading(false);
            return;
        }
        addLog("Bruker funnet: " + user.id);

        const { data: members, error } = await supabase
            .from("family_members")
            .select("family_id")
            .eq("user_id", user.id)
            .limit(1);

        if (error) {
            addLog("Feil ved henting av familie: " + error.message);
        }

        const foundFamilyId = members?.[0]?.family_id;

        if (foundFamilyId) {
            addLog("Fant familie ID: " + foundFamilyId);
            setFamilyId(foundFamilyId);
            loadTreeData(foundFamilyId);
        } else {
            addLog("Fant ingen familie for bruker.");
            setLoading(false);
        }
    };

    const loadTreeData = async (id: string) => {
        try {
            const treeData = await getFamilyTreeData(id);
            setData(treeData);
        } catch (e) {
            console.error(e);
            setError("Kunne ikke laste familietreet.");
        } finally {
            setLoading(false);
        }
    };

    const handleFirstMemberSubmit = async (formData: Partial<FamilyMember>) => {
        addLog("Prøver å opprette familie...");
        setLoading(true);
        setIsFormOpen(false);

        // Generate a generic family name since the user doesn't want to specify one
        // We use the last name if available, otherwise just "Familietre"
        const familyName = formData.lastName ? `Familietre (${formData.lastName})` : "Mitt Familietre";

        try {
            const result = await createFamily(familyName, formData);

            if (result.error) {
                addLog("Feil ved opprettelse: " + result.error);
                setLoading(false);
            } else {
                addLog("Familie opprettet! ID: " + result.family?.id);
                // Refresh
                checkFamily();
            }
        } catch (e) {
            addLog("Klientfeil ved opprettelse: " + e);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-8 text-center">
            Laster...
            <pre className="mt-4 text-xs text-left bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {debugLog.join('\n')}
            </pre>
        </div>
    );

    if (!familyId) {
        return (
            <div className="p-8 text-center flex flex-col items-center gap-4">
                <pre className="w-full text-xs text-left bg-yellow-50 p-2 rounded border border-yellow-200 overflow-auto max-h-40 mb-4">
                    {debugLog.join('\n')}
                </pre>
                <h3 className="text-xl font-bold">Du er ikke medlem av en familie enda</h3>
                <p className="text-gray-600">Opprett din første familie for å komme i gang.</p>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-[var(--primary)] text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                    Opprett første familiemedlem
                </button>



                <RegistrationForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleFirstMemberSubmit}
                />
            </div>
        );
    }

    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    if (!data) return null;

    return (
        <FamilyTree
            members={data.members}
            relationships={data.relationships}
            familyId={familyId}
        />
    );
}
