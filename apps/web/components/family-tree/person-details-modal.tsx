import { FamilyMember } from "@memoshare/core";
import { X, UserPlus, Edit2, MapPin, Mail, Phone, Calendar } from "lucide-react";

interface PersonDetailsModalProps {
    member: FamilyMember | null;
    isOpen: boolean;
    onClose: () => void;
    onAddRelative: (member: FamilyMember) => void;
    onEdit: (member: FamilyMember) => void;
}

export function PersonDetailsModal({ member, isOpen, onClose, onAddRelative, onEdit }: PersonDetailsModalProps) {
    if (!isOpen || !member) return null;

    const fullName = `${member.title ? member.title + " " : ""}${member.firstName} ${member.middleName ? member.middleName + " " : ""}${member.lastName}`;
    const age = member.birthDate ? new Date().getFullYear() - new Date(member.birthDate).getFullYear() : "Ukjent";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header with Avatar */}
                <div className="relative h-32 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                            {member.avatarUrl ? (
                                <img src={member.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-3xl font-bold text-[var(--primary)]">
                                    {member.firstName[0]}{member.lastName[0]}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-16 px-8 pb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">{fullName}</h2>
                            <p className="text-gray-500">{member.gender === 'male' ? 'Mann' : member.gender === 'female' ? 'Kvinne' : ''} • {age} år</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(member)}
                                className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-orange-50 rounded-full transition-colors"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {member.birthDate && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <Calendar className="w-5 h-5 text-[var(--secondary)]" />
                                <span>Født: {new Date(member.birthDate).toLocaleDateString('no-NO')} {member.birthPlace ? `i ${member.birthPlace}` : ''}</span>
                            </div>
                        )}

                        {member.address && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <MapPin className="w-5 h-5 text-[var(--secondary)]" />
                                <span>{member.address}, {member.zipCode} {member.city}</span>
                            </div>
                        )}

                        {member.email && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail className="w-5 h-5 text-[var(--secondary)]" />
                                <a href={`mailto:${member.email}`} className="hover:underline">{member.email}</a>
                            </div>
                        )}

                        {member.phone && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <Phone className="w-5 h-5 text-[var(--secondary)]" />
                                <a href={`tel:${member.phone}`} className="hover:underline">{member.phone}</a>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button
                            onClick={() => onAddRelative(member)}
                            className="w-full py-3 bg-[var(--primary)] text-white rounded-[16px] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-orange-200"
                        >
                            <UserPlus className="w-5 h-5" />
                            Legg til familiemedlem
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
