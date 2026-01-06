export function FamilyTreeWidget() {
    return (
        <div className="bg-white rounded-[24px] h-[420px] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center relative overflow-hidden">
            <h3 className="absolute top-6 left-6 text-lg font-semibold text-[var(--foreground)]">Min Familie</h3>

            {/* Visual Node Graph Placeholder */}
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Simple SVG representation of a tree structure */}
                <svg width="100%" height="100%" viewBox="0 0 300 200" className="absolute inset-0">
                    {/* Connecting Lines */}
                    <path d="M150 40 L150 80" stroke="#E6E8EC" strokeWidth="2" />
                    <path d="M150 80 L100 120" stroke="#E6E8EC" strokeWidth="2" />
                    <path d="M150 80 L200 120" stroke="#E6E8EC" strokeWidth="2" />

                    {/* Nodes */}
                    <circle cx="150" cy="40" r="24" fill="#FFE4E1" /> {/* Grandparent */}
                    <circle cx="100" cy="120" r="24" fill="#E0F7FA" /> {/* Parent 1 */}
                    <circle cx="200" cy="120" r="24" fill="#E0F7FA" /> {/* Parent 2 */}
                </svg>

                {/* Avatar Placeholders (HTML overlay for better accessibility/styling if needed later) */}
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xs text-gray-400">
                    Bestemor
                </div>
                <div className="absolute top-[50%] left-[25%] w-16 h-16 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xs text-gray-400">
                    Mor
                </div>
                <div className="absolute top-[50%] right-[25%] w-16 h-16 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xs text-gray-400">
                    Far
                </div>
            </div>

            <button className="absolute bottom-6 w-full py-3 text-[var(--primary)] font-medium hover:bg-orange-50 rounded-[16px] transition-colors">
                Se hele treet
            </button>
        </div>
    );
}
