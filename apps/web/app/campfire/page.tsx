import { createClient } from "@/lib/supabase/server";
import { CampfireRoom } from "../../components/chat/campfire-room";
import { redirect } from "next/navigation";

export default async function CampfirePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user's family
    const { data: members } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id)
        .limit(1);

    const familyId = members?.[0]?.family_id;

    if (!familyId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Ingen familie funnet</h1>
                <p className="text-gray-600 mb-8">Du må være medlem av en familie for å delta i leirbålet.</p>
                <a href="/tree" className="bg-[var(--primary)] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity">
                    Gå til Familietre for å opprette familie
                </a>
            </div>
        );
    }

    return <CampfireRoom roomName={familyId} />;
}
