import { FeedContainer } from "../components/feed/feed-container";
import { FamilyTreeWidget } from "../components/tree/family-tree-widget";
import { BottomMenu } from "../components/layout/bottom-menu";
import { SideNav } from "../components/layout/side-nav";
import { createClient } from "@/lib/supabase/server";
import { getPosts } from "../components/feed/actions";
import { MotionWrapper } from "../components/ui/motion-wrapper";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let familyId = "";
  let posts: any[] = [];

  if (user) {
    const { data: members } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", user.id)
      .limit(1);

    familyId = members?.[0]?.family_id || "";

    if (familyId) {
      posts = await getPosts(familyId);
    }
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Left Column: Navigation (2 cols) */}
          <div className="hidden md:block md:col-span-2 sticky top-24">
            <SideNav />
          </div>

          {/* Center Column: Main Feed (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-8">
            {/* Hero / Welcome */}
            <MotionWrapper delay={0.1}>
              <div className="glass rounded-[32px] p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Hei, {user?.user_metadata?.full_name?.split(" ")[0] || "gjest"}! 👋</h1>
                  <p className="text-gray-600">Klar for å dele et nytt øyeblikk?</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-3xl -mr-16 -mt-16" />
              </div>
            </MotionWrapper>

            <FeedContainer initialPosts={posts} familyId={familyId} />
          </div>

          {/* Right Column: Context Panel (3 cols) */}
          <div className="hidden md:block md:col-span-3 sticky top-24 flex flex-col gap-6">

            {/* Module A: Living Tree */}
            <MotionWrapper delay={0.2}>
              <div className="glass rounded-[32px] p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Mitt Familietre</h3>
                <FamilyTreeWidget />
              </div>
            </MotionWrapper>

            {/* Module B: Milestones */}
            <MotionWrapper delay={0.3}>
              <div className="glass rounded-[32px] p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Kommende Merkedager</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg">🎂</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Anna's Bursdag</p>
                      <p className="text-xs text-gray-500">I dag (12 år)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-lg">💍</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Gullbryllup</p>
                      <p className="text-xs text-gray-500">Om 2 uker</p>
                    </div>
                  </div>
                </div>
              </div>
            </MotionWrapper>

            {/* Module C: Album Shortcuts */}
            <MotionWrapper delay={0.4}>
              <div className="glass rounded-[32px] p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Mine Album</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-square rounded-2xl bg-gray-100 relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                    <span className="absolute bottom-2 left-2 text-white text-xs font-medium">Sommer 2025</span>
                  </div>
                  <div className="aspect-square rounded-2xl bg-gray-100 relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                    <span className="absolute bottom-2 left-2 text-white text-xs font-medium">Julen</span>
                  </div>
                </div>
              </div>
            </MotionWrapper>

          </div>
        </div>
      </main>

      <BottomMenu />
    </div>
  );
}
