import Image from "next/image";
import Link from "next/link";
import { User, Settings } from "lucide-react";

export function Header() {
    return (
        <header className="h-[72px] bg-[#FAFAF8]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-20 py-6 border-b border-gray-200/50 sticky top-0 z-50 transition-all">
            <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Memoshare Logo"
                        width={140}
                        height={32}
                        className="h-8 w-auto object-contain"
                        style={{ width: "auto" }}
                        priority
                    />
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
                    Hjem
                </Link>
                <Link href="/tree" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
                    Familietre
                </Link>
                <Link href="/memories" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">
                    Minner
                </Link>
                <Link href="/campfire" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors flex items-center gap-1">
                    <span>🔥</span> Leirbål
                </Link>

            </nav>

            <div className="flex items-center gap-4">
                <Link href="/room/admin">
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-orange-100">
                        <Settings className="w-5 h-5 text-gray-600" />
                    </button>
                </Link>
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-orange-100">
                    <User className="w-5 h-5 text-[var(--foreground)]" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary)] to-purple-400 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <span className="font-bold text-xs text-[var(--primary)]">GO</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
