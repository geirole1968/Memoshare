import { FeedContainer } from "../components/feed/feed-container";
import { FamilyTreeWidget } from "../components/tree/family-tree-widget";
import { MemoriesRow } from "../components/memories/memories-row";
import { BottomMenu } from "../components/layout/bottom-menu";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-0">

      <main className="max-w-[1440px] mx-auto px-4 md:px-20 pt-8">
        {/* Welcome Section - Hero Card */}
        <div className="mb-8 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-orange-50 via-white to-orange-50/50 border border-orange-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/10 to-transparent rounded-full blur-3xl -ml-16 -mb-16" />

          <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Hei, Geir! 👋</h1>
              <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                Velkommen tilbake til din familiehistorie. I dag er en fin dag for å dele et minne eller utforske slektstreet ditt.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white text-[var(--foreground)] px-6 py-3 rounded-2xl font-semibold shadow-sm border border-gray-100 hover:bg-gray-50 transition-all">
                Utforsk treet
              </button>
              <button className="bg-[var(--primary)] text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105 transition-all">
                Nytt minne
              </button>
            </div>
          </div>
        </div>

        {/* Memories Row - Moved up for better engagement */}
        <div className="mb-8">
          <MemoriesRow />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Content (Feed/Chat) - 8 Columns */}
          <div className="md:col-span-8">
            <FeedContainer />
          </div>

          {/* Sidebar (Family Tree) - 4 Columns */}
          <div className="md:col-span-4">
            <FamilyTreeWidget />
          </div>
        </div>
      </main>

      <BottomMenu />
    </div>
  );
}
