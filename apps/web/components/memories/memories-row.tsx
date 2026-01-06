import { Heart, MessageCircle } from "lucide-react";

interface MemoryCardProps {
    title: string;
    imageColor: string; // Placeholder for actual image
}

function MemoryCard({ title, imageColor }: MemoryCardProps) {
    return (
        <div className="flex-shrink-0 w-[300px] h-[220px] bg-white rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col group cursor-pointer transition-transform hover:scale-[1.02]">
            {/* Image Placeholder */}
            <div className={`h-[160px] w-full ${imageColor} relative`}>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                    12. okt
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 flex items-center justify-between">
                <span className="font-medium text-[var(--foreground)] truncate">{title}</span>
                <div className="flex gap-2 text-gray-400">
                    <Heart className="w-4 h-4" />
                    <MessageCircle className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}

export function MemoriesRow() {
    const memories = [
        { title: "Sommer 2025", color: "bg-blue-100" },
        { title: "Sydentur høsten 2025", color: "bg-orange-100" },
        { title: "Lines fødselsdag", color: "bg-pink-100" },
        { title: "Julen 2024", color: "bg-green-100" },
    ];

    return (
        <div className="flex flex-col gap-6 mt-8">
            <h2 className="text-[20px] font-semibold text-[var(--foreground)] px-4 md:px-0">Siste minner</h2>

            <div className="flex gap-6 overflow-x-auto pb-8 px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide">
                {memories.map((memory, index) => (
                    <MemoryCard key={index} title={memory.title} imageColor={memory.color} />
                ))}
            </div>
        </div>
    );
}
