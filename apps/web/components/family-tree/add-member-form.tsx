"use client";

import { useState, useEffect, useRef } from "react";
import { FamilyMember } from "@memoshare/core";
import { X, Upload, Trash2 } from "lucide-react";
import { RelationType } from "./types";
// import { uploadImage } from "@/lib/supabase/storage";

// Mock uploadImage temporarily to debug
const uploadImage = async (file: File, bucket: string) => {
    return URL.createObjectURL(file);
};

interface AddMemberFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    onDelete?: (id: string) => void;
    relationType: RelationType | null;
    relativeName: string;
    initialData?: FamilyMember | null;
    existingMembers?: FamilyMember[];
}

export default function AddMemberForm({ isOpen, onClose, onSubmit, onDelete, relationType, relativeName, initialData, existingMembers = [] }: AddMemberFormProps) {
    // if (!isOpen) return null; // Handled by parent

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<'new' | 'existing'>('new');
    const [selectedExistingId, setSelectedExistingId] = useState<string>("");
    const [relationshipStatus, setRelationshipStatus] = useState<string>("gift");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState<Partial<FamilyMember>>({
        gender: "male",
        isDeceased: false,
    });

    // ...

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (initialData?.id && onDelete) {
            onDelete(initialData.id);
            onClose();
        }
    };

    // ... (keep useEffect and handlers)

    // ... (inside return statement, replacing the bottom buttons)



    // Reset or Pre-fill form
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setMode('new'); // Always edit in 'new' mode (conceptually)
        } else {
            setFormData({
                gender: "male",
                isDeceased: false,
            });
            setMode('new');
            setSelectedExistingId("");

            // Pre-fill gender based on relation type if creating new
            if (relationType) {
                const femaleTypes = ["mother", "sister", "daughter", "wife"];
                const maleTypes = ["father", "brother", "son", "husband"];

                if (femaleTypes.includes(relationType)) {
                    setFormData(prev => ({ ...prev, gender: "female" }));
                } else if (maleTypes.includes(relationType)) {
                    setFormData(prev => ({ ...prev, gender: "male" }));
                }
            }
        }
    }, [initialData, relationType, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'existing' && selectedExistingId) {
            onSubmit({
                existingMemberId: selectedExistingId,
                relationshipStatus: isPartner ? relationshipStatus : undefined
            });
            return;
        }

        // Check for inferred relationships
        const additionalRelationships: any[] = [];

        // Case 1: Adding a child (son/daughter)
        // Check if the current person (parent) has a spouse.
        // If so, ask if the spouse is also a parent.
        if (['son', 'daughter'].includes(relationType || '')) {
            // Find spouses of the current person (initialData is the parent)
            // We need access to relationships. existingMembers doesn't have relationships attached directly usually, 
            // but we can try to find them if we had them. 
            // Wait, AddMemberForm doesn't have access to relationships prop.
            // We need to pass relationships to AddMemberForm or do this check in the parent component.
            // Doing it in parent (index.tsx) is cleaner for data access, but UI is here.
            // Let's assume we pass relationships or a helper.
            // Since we don't have it, we'll skip this advanced check for now or rely on the user to add the second parent later.
            // BUT the user specifically asked for this.
            // "Når jeg deretter legger til en datter, må jeg få det avklares om den partner er mor til datter"

            // I will implement a simple prompt if I can find a potential partner in existingMembers 
            // but I don't know who is partner of whom without the relationships data.

            // Strategy change: I need to pass `relationships` to AddMemberForm.
        }

        // Since I cannot easily access relationships here without prop drilling, 
        // I will implement the logic in `index.tsx`'s `handleFormSubmit` instead, 
        // OR I will just submit the form and let `index.tsx` handle the "second step" of asking.

        // Let's pass the raw data to onSubmit, and let the parent handle the complex logic.
        onSubmit({
            ...formData,
            relationshipStatus: isPartner ? relationshipStatus : undefined
        });
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Optimistic preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);

            // Upload to Supabase
            try {
                const publicUrl = await uploadImage(file, "avatars");
                setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
            } catch (error) {
                console.error("Failed to upload avatar", error);
                alert("Kunne ikke laste opp profilbilde.");
            }
        }
    };

    const isPartner = ['partner', 'husband', 'wife'].includes(relationType || '');
    const availableExistingMembers = existingMembers.filter(m => m.id !== initialData?.id); // Filter out self if editing (though we don't link existing when editing)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl my-8 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[var(--foreground)]">
                        {initialData ? 'Rediger person' :
                            `Legg til ${relationType === 'partner' ? 'partner' :
                                relationType === 'father' ? 'far' :
                                    relationType === 'mother' ? 'mor' :
                                        relationType === 'brother' ? 'bror' :
                                            relationType === 'sister' ? 'søster' :
                                                relationType === 'son' ? 'sønn' :
                                                    relationType === 'daughter' ? 'datter' : 'familiemedlem'} til ${relativeName}`}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {!initialData && (
                        <div className="flex gap-4 mb-6 p-1 bg-gray-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setMode('new')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'new' ? 'bg-white shadow-sm text-[var(--primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Opprett ny person
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('existing')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'existing' ? 'bg-white shadow-sm text-[var(--primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Koble til eksisterende
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'existing' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Velg person fra treet</label>
                                <select
                                    value={selectedExistingId}
                                    onChange={(e) => setSelectedExistingId(e.target.value)}
                                    className="w-full rounded-[12px] border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-[var(--primary)] outline-none bg-white"
                                    required
                                >
                                    <option value="">-- Velg person --</option>
                                    {availableExistingMembers.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.firstName} {member.lastName} ({member.birthDate ? new Date(member.birthDate).getFullYear() : '?'})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-500 mt-2">
                                    Dette vil opprette en kobling til en person som allerede finnes i treet, i stedet for å lage en ny.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Image Upload */}
                                <div className="flex items-center gap-6 mb-4">
                                    <div
                                        className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--primary)] transition-colors group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-[var(--primary)]" />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">Endre</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">Profilbilde</h3>
                                        <p className="text-sm text-gray-500">Last opp et bilde av personen. Klikk på sirkelen for å velge fil.</p>
                                    </div>
                                </div>

                                {/* Personal Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Kjønn</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        >
                                            <option value="male">Mann</option>
                                            <option value="female">Kvinne</option>
                                            <option value="other">Annet</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Tittel</label>
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="F.eks. Dr., Mr."
                                            value={formData.title || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Fornavn</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            required
                                            value={formData.firstName || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Mellomnavn</label>
                                        <input
                                            type="text"
                                            name="middleName"
                                            value={formData.middleName || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Etternavn</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            required
                                            value={formData.lastName || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Birth & Death */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Fødselsdato</label>
                                        <input
                                            type="date"
                                            name="birthDate"
                                            value={formData.birthDate || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Fødested</label>
                                        <input
                                            type="text"
                                            name="birthPlace"
                                            value={formData.birthPlace || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="isDeceased"
                                            id="isDeceased"
                                            checked={formData.isDeceased || false}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)]"
                                        />
                                        <label htmlFor="isDeceased" className="text-sm font-medium text-gray-700">Personen er død</label>
                                    </div>

                                    {formData.isDeceased && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-0.5">Dødsfallsdato</label>
                                            <input
                                                type="date"
                                                name="deathDate"
                                                value={formData.deathDate || ''}
                                                onChange={handleChange}
                                                className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                <hr className="border-gray-100" />

                                {/* Contact Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Adresse</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Postnummer</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Poststed</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">E-post</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Telefon</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-[12px] border border-gray-200 px-4 py-1.5 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Relationship Status (Only if partner) */}
                        {isPartner && (
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sivilstatus</label>
                                <select
                                    value={relationshipStatus}
                                    onChange={(e) => setRelationshipStatus(e.target.value)}
                                    className="w-full rounded-[12px] border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-[var(--primary)] outline-none bg-white"
                                >
                                    <option value="gift">Gift</option>
                                    <option value="samboer">Samboer</option>
                                    <option value="forlovet">Forlovet</option>
                                    <option value="kjæreste">Kjæreste</option>
                                    <option value="separert">Separert</option>
                                    <option value="skilt">Skilt</option>
                                    <option value="enke_enkemann">Enke/Enkemann</option>
                                </select>
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            {showDeleteConfirm ? (
                                <div className="flex items-center gap-4 w-full justify-end bg-red-50 p-2 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                    <span className="text-sm text-red-800 font-medium">Er du sikker?</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-1.5 text-gray-600 hover:bg-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Avbryt
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDelete}
                                        className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
                                    >
                                        Ja, slett
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {initialData && onDelete ? (
                                        <button
                                            type="button"
                                            onClick={handleDeleteClick}
                                            className="px-6 py-2 text-red-500 hover:bg-red-50 rounded-[12px] font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Slett person
                                        </button>
                                    ) : (
                                        <div></div> // Spacer
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-[12px] font-medium transition-colors"
                                        >
                                            Avbryt
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-8 py-2 bg-[var(--primary)] text-white rounded-[12px] font-medium hover:opacity-90 transition-opacity shadow-lg shadow-orange-200"
                                        >
                                            {mode === 'existing' ? 'Koble til' : 'Lagre'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
