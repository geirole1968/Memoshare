import { Home, Search, PlusSquare, BookOpen, User } from "lucide-react";

export function BottomMenu() {
    return (
        <div className="h-[72px] bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.04)] flex items-center justify-around px-4 fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <button className="flex flex-col items-center gap-1 text-[var(--primary)]">
                <Home className="w-6 h-6" />
                <span className="text-[10px] font-medium">Hjem</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                <Search className="w-6 h-6" />
                <span className="text-[10px] font-medium">Søk</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                <PlusSquare className="w-6 h-6" />
                <span className="text-[10px] font-medium">Nytt</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                <BookOpen className="w-6 h-6" />
                <span className="text-[10px] font-medium">Minner</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
                <User className="w-6 h-6" />
                <span className="text-[10px] font-medium">Profil</span>
            </button>
        </div>
    );
}
