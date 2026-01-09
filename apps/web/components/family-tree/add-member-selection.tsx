"use client";

import { Plus, User } from "lucide-react";
import { RelationType } from "./types";

interface AddMemberSelectionProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: RelationType) => void;
}

export function AddMemberSelection({ isOpen, onClose, onSelect }: AddMemberSelectionProps) {
    if (!isOpen) return null;

    const options: { type: RelationType; label: string; gender: "male" | "female" }[] = [
        { type: "father", label: "Legg til far", gender: "male" },
        { type: "mother", label: "Legg til mor", gender: "female" },
        { type: "partner", label: "Legg til partner", gender: "female" }, // Default female icon, logic handles actual gender
        { type: "brother", label: "Legg til bror", gender: "male" },
        { type: "sister", label: "Legg til søster", gender: "female" },
        { type: "son", label: "Legg til sønn", gender: "male" },
        { type: "daughter", label: "Legg til datter", gender: "female" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-[32px] p-8 shadow-2xl max-w-2xl w-full animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <h3 className="text-center text-xl font-semibold mb-8 text-[var(--foreground)]">Velg relasjon</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4 justify-items-center">
                    {options.map((option) => (
                        <button
                            key={option.type}
                            onClick={() => onSelect(option.type)}
                            className="flex flex-col items-center gap-3 group"
                        >
                            <div className="relative w-20 h-20 rounded-full border-2 border-gray-100 flex items-center justify-center bg-gray-50 group-hover:border-[var(--primary)] group-hover:bg-orange-50 transition-all">
                                <User className={`w-10 h-10 ${option.gender === 'male' ? 'text-gray-400' : 'text-gray-400'} group-hover:text-[var(--primary)]`} />

                                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center border-2 border-white shadow-sm">
                                    <Plus className="w-5 h-5" />
                                </div>
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-[var(--primary)]">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
