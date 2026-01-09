"use client";

import { useState, useRef } from "react";
import { FamilyMember } from "@memoshare/core";
import { X, Upload } from "lucide-react";

// Mock uploadImage temporarily to debug
const uploadImage = async (file: File, bucket: string) => {
    return URL.createObjectURL(file);
};

interface RegistrationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<FamilyMember>) => void;
}

export default function RegistrationForm({ isOpen, onClose, onSubmit }: RegistrationFormProps) {
    if (!isOpen) return null;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<Partial<FamilyMember>>({
        gender: "male",
        isDeceased: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl my-8 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[var(--foreground)]">
                        Registrer deg selv
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                            <p className="text-sm text-gray-500">Last opp et bilde av deg selv.</p>
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

                    {/* Birth */}
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

                    <div className="flex justify-end gap-4 pt-4">
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
                            Lagre
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
