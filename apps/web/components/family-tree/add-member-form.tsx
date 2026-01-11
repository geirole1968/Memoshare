"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FamilyMember, Relationship } from "@memoshare/core";
import { X, Upload, Trash2, Link as LinkIcon, User } from "lucide-react";
import { Button } from "@memoshare/ui";
import { RelationType } from "./types";

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
    relativeId?: string;
    initialData?: FamilyMember | null;
    existingMembers?: FamilyMember[];
    relationships?: Relationship[];
}

export default function AddMemberForm({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    relationType,
    relativeName,
    relativeId,
    initialData,
    existingMembers = [],
    relationships = []
}: AddMemberFormProps) {
    if (!isOpen) return null;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // New State for Post-Save Confirmation
    const [confirmationStep, setConfirmationStep] = useState<{
        type: 'co-parent' | 'partner-of-parent' | 'partner-with-children' | 'sibling-parents' | 'parent-siblings';
        person?: FamilyMember; // For single person inference
        people?: FamilyMember[]; // For multiple people inference (parents or siblings)
        children?: FamilyMember[]; // For multiple children inference (existing logic)
    } | null>(null);

    const [selectedChildrenIds, setSelectedChildrenIds] = useState<Set<string>>(new Set());
    const [selectedPeopleIds, setSelectedPeopleIds] = useState<Set<string>>(new Set()); // General selection for multiple people
    const [pendingSubmission, setPendingSubmission] = useState<any>(null);
    const [pendingRelationshipStatus, setPendingRelationshipStatus] = useState<string>("gift");

    const [formData, setFormData] = useState<Partial<FamilyMember>>({
        gender: "male",
        isDeceased: false,
    });

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (initialData?.id && onDelete) {
            onDelete(initialData.id);
            onClose();
        }
    };

    // Check for duplicates
    const possibleDuplicate = useMemo(() => {
        const searchName = formData.firstName?.toLowerCase();
        if (!searchName || initialData) return null;

        return existingMembers.find(m =>
            m.firstName.toLowerCase() === searchName &&
            (!formData.lastName || m.lastName.toLowerCase() === formData.lastName?.toLowerCase()) &&
            m.id !== relativeId // Don't match the person we are adding to
        );
    }, [formData.firstName, formData.lastName, existingMembers, initialData, relativeId]);

    // Reset or Pre-fill form
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                gender: "male",
                isDeceased: false,
            });
            setConfirmationStep(null);
            setPendingSubmission(null);
            setPendingRelationshipStatus("gift");
            setSelectedChildrenIds(new Set());
            setSelectedPeopleIds(new Set());

            // Pre-fill gender based on relation type
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare the base submission data
        const submissionData = {
            ...formData,
            relationshipStatus: isPartner ? pendingRelationshipStatus : undefined,
        };

        // If editing, just submit
        if (initialData) {
            onSubmit(submissionData);
            return;
        }

        // Logic to detect inferred relationships
        let inferenceFound = false;

        if (relationType && relativeId && existingMembers.length > 0) {
            // Case 1: Adding a child (son/daughter). Check if the relative (parent) has a spouse.
            if (['son', 'daughter'].includes(relationType)) {
                const spouseEdge = relationships.find(r => {
                    const type = (r.type as string).toLowerCase();
                    return ['spouse', 'partner', 'husband', 'wife'].includes(type) &&
                        (r.fromId === relativeId || r.toId === relativeId);
                });

                if (spouseEdge) {
                    const spouseId = spouseEdge.fromId === relativeId ? spouseEdge.toId : spouseEdge.fromId;
                    const spouse = existingMembers.find(m => m.id === spouseId);

                    if (spouse) {
                        setConfirmationStep({
                            type: 'co-parent',
                            person: spouse
                        });
                        setPendingSubmission(submissionData);
                        inferenceFound = true;
                    }
                }
            }

            // Case 2: Adding a parent (father/mother). 
            // Sub-case 2a: Check if the relative (child) already has a parent (partner of new parent).
            if (!inferenceFound && ['father', 'mother'].includes(relationType)) {
                const parentEdge = relationships.find(r => {
                    const type = (r.type as string).toLowerCase();
                    return ['parent', 'father', 'mother'].includes(type) && r.toId === relativeId;
                });

                if (parentEdge) {
                    const parentId = parentEdge.fromId;
                    const parent = existingMembers.find(m => m.id === parentId);

                    if (parent) {
                        setConfirmationStep({
                            type: 'partner-of-parent',
                            person: parent
                        });
                        setPendingSubmission(submissionData);
                        inferenceFound = true;
                    }
                }

                // Sub-case 2b: Check if the relative (child) has siblings who should also be children of this new parent.
                if (!inferenceFound) {
                    // Find siblings: People who share a parent with relativeId OR are explicitly linked as siblings
                    const siblingEdges = relationships.filter(r =>
                        ['brother', 'sister', 'sibling'].includes((r.type as string).toLowerCase()) &&
                        (r.fromId === relativeId || r.toId === relativeId)
                    );

                    const siblingIds = siblingEdges.map(r => r.fromId === relativeId ? r.toId : r.fromId);
                    const siblings = existingMembers.filter(m => siblingIds.includes(m.id));

                    if (siblings.length > 0) {
                        setConfirmationStep({
                            type: 'parent-siblings',
                            people: siblings
                        });
                        setSelectedPeopleIds(new Set(siblings.map(s => s.id)));
                        setPendingSubmission(submissionData);
                        inferenceFound = true;
                    }
                }
            }

            // Case 3: Adding a partner. Check if the relative (who is getting a partner) has children.
            if (!inferenceFound && ['partner', 'husband', 'wife'].includes(relationType)) {
                const childEdges = relationships.filter(r =>
                    r.fromId === relativeId &&
                    !['spouse', 'partner', 'husband', 'wife'].includes((r.type as string).toLowerCase())
                );

                if (childEdges.length > 0) {
                    const childrenIds = childEdges.map(r => r.toId);
                    const children = existingMembers.filter(m => childrenIds.includes(m.id));

                    if (children.length > 0) {
                        setConfirmationStep({
                            type: 'partner-with-children',
                            children: children
                        });
                        setSelectedChildrenIds(new Set(children.map(c => c.id)));
                        setPendingSubmission(submissionData);
                        inferenceFound = true;
                    }
                }
            }

            // Case 4: Adding a sibling (brother/sister). Check if the relative (sibling) has parents.
            if (!inferenceFound && ['brother', 'sister'].includes(relationType)) {
                // Find parents of relativeId
                const parentEdges = relationships.filter(r =>
                    ['parent', 'father', 'mother'].includes((r.type as string).toLowerCase()) &&
                    r.toId === relativeId
                );

                if (parentEdges.length > 0) {
                    const parentIds = parentEdges.map(r => r.fromId);
                    const parents = existingMembers.filter(m => parentIds.includes(m.id));

                    if (parents.length > 0) {
                        setConfirmationStep({
                            type: 'sibling-parents',
                            people: parents
                        });
                        setSelectedPeopleIds(new Set(parents.map(p => p.id)));
                        setPendingSubmission(submissionData);
                        inferenceFound = true;
                    }
                }
            }
        }

        // If no inference found, submit directly
        if (!inferenceFound) {
            onSubmit(submissionData);
        }
    };

    const handleConfirmInference = () => {
        if (!pendingSubmission || !confirmationStep) return;

        const additionalRelationships: any[] = [];

        if (confirmationStep.type === 'co-parent' && confirmationStep.person) {
            additionalRelationships.push({
                relativeId: confirmationStep.person.id,
                relationType: 'child'
            });
        } else if (confirmationStep.type === 'partner-of-parent' && confirmationStep.person) {
            additionalRelationships.push({
                relativeId: confirmationStep.person.id,
                relationType: 'spouse',
                status: pendingRelationshipStatus
            });
        } else if (confirmationStep.type === 'partner-with-children' && confirmationStep.children) {
            confirmationStep.children.forEach(child => {
                if (selectedChildrenIds.has(child.id)) {
                    additionalRelationships.push({
                        relativeId: child.id,
                        relationType: 'parent'
                    });
                }
            });
        } else if (confirmationStep.type === 'sibling-parents' && confirmationStep.people) {
            // Add relationship for each selected parent
            confirmationStep.people.forEach(parent => {
                if (selectedPeopleIds.has(parent.id)) {
                    additionalRelationships.push({
                        relativeId: parent.id,
                        relationType: 'child' // New person is child of existing parent
                    });
                }
            });
        } else if (confirmationStep.type === 'parent-siblings' && confirmationStep.people) {
            // Add relationship for each selected sibling
            confirmationStep.people.forEach(sibling => {
                if (selectedPeopleIds.has(sibling.id)) {
                    additionalRelationships.push({
                        relativeId: sibling.id,
                        relationType: 'parent' // New person is parent of existing sibling
                    });
                }
            });
        }

        onSubmit({
            ...pendingSubmission,
            additionalRelationships
        });
    };

    const toggleChildSelection = (childId: string) => {
        const newSelection = new Set(selectedChildrenIds);
        if (newSelection.has(childId)) {
            newSelection.delete(childId);
        } else {
            newSelection.add(childId);
        }
        setSelectedChildrenIds(newSelection);
    };

    const togglePeopleSelection = (personId: string) => {
        const newSelection = new Set(selectedPeopleIds);
        if (newSelection.has(personId)) {
            newSelection.delete(personId);
        } else {
            newSelection.add(personId);
        }
        setSelectedPeopleIds(newSelection);
    };

    const handleSkipInference = () => {
        if (pendingSubmission) {
            onSubmit(pendingSubmission);
        }
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

    // Render Confirmation Step
    if (confirmationStep) {
        const isMultiChild = confirmationStep.type === 'partner-with-children';
        const isSiblingParents = confirmationStep.type === 'sibling-parents';
        const isParentSiblings = confirmationStep.type === 'parent-siblings';
        const isMultiSelect = isMultiChild || isSiblingParents || isParentSiblings;

        const peopleList = isMultiChild ? confirmationStep.children : confirmationStep.people;
        const selectedIds = isMultiChild ? selectedChildrenIds : selectedPeopleIds;
        const toggleSelection = isMultiChild ? toggleChildSelection : togglePeopleSelection;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LinkIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {confirmationStep.type === 'co-parent' && confirmationStep.person
                                ? `Er ${confirmationStep.person.firstName} også forelder?`
                                : confirmationStep.type === 'partner-of-parent' && confirmationStep.person
                                    ? `Er dette partneren til ${confirmationStep.person.firstName}?`
                                    : isSiblingParents
                                        ? `Har ${formData.firstName} samme foreldre?`
                                        : isParentSiblings
                                            ? `Er ${formData.firstName} også forelder til søsknene?`
                                            : `Koble til barn`
                            }
                        </h2>
                        <p className="text-gray-600">
                            {confirmationStep.type === 'co-parent' && confirmationStep.person
                                ? `Vi fant at ${relativeName} har en partner (${confirmationStep.person.firstName}). Skal ${formData.firstName} også kobles til ${confirmationStep.person.firstName} som barn?`
                                : confirmationStep.type === 'partner-of-parent' && confirmationStep.person
                                    ? `Vi fant at ${relativeName} allerede har en forelder (${confirmationStep.person.firstName}). Skal ${formData.firstName} kobles til ${confirmationStep.person.firstName} som partner?`
                                    : isSiblingParents
                                        ? `Vi fant at ${relativeName} har foreldre. Er disse også foreldrene til ${formData.firstName}?`
                                        : isParentSiblings
                                            ? `Vi fant at ${relativeName} har søsken. Er ${formData.firstName} også forelder til disse?`
                                            : `Vi fant at ${relativeName} har ${confirmationStep.children?.length} barn. Velg hvilke barn ${formData.firstName} er forelder til:`
                            }
                        </p>
                    </div>

                    {isMultiSelect && peopleList && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-xl max-h-60 overflow-y-auto">
                            <div className="space-y-3">
                                {peopleList.map(person => (
                                    <div key={person.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                                        <input
                                            type="checkbox"
                                            id={`person-${person.id}`}
                                            checked={selectedIds.has(person.id)}
                                            onChange={() => toggleSelection(person.id)}
                                            className="w-5 h-5 text-[var(--primary)] rounded focus:ring-[var(--primary)] cursor-pointer"
                                        />
                                        <label htmlFor={`person-${person.id}`} className="flex-1 flex items-center gap-3 cursor-pointer select-none">
                                            {person.avatarUrl ? (
                                                <img src={person.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-900">{person.firstName} {person.lastName}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {confirmationStep.type === 'partner-of-parent' && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-xl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Velg sivilstatus</label>
                            <select
                                value={pendingRelationshipStatus}
                                onChange={(e) => setPendingRelationshipStatus(e.target.value)}
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

                    <div className="flex gap-3">
                        <button
                            onClick={handleSkipInference}
                            className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-[12px] font-medium transition-colors"
                        >
                            {isMultiSelect ? 'Ingen av dem' : 'Nei, hopp over'}
                        </button>
                        <button
                            onClick={handleConfirmInference}
                            className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-[12px] font-medium hover:opacity-90 transition-opacity"
                        >
                            {isMultiSelect ? 'Lagre valg' : 'Ja, koble sammen'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        {/* Duplicate Warning */}
                        {possibleDuplicate && (
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-amber-900">Fant mulig duplikat</h4>
                                        <p className="text-sm text-amber-700 mb-3">
                                            Det finnes allerede en person som heter <strong>{possibleDuplicate.firstName} {possibleDuplicate.lastName}</strong>.
                                            Vil du koble til denne personen i stedet for å opprette en ny?
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="bg-white border-amber-200 text-amber-800 hover:bg-amber-100"
                                            onClick={() => {
                                                onSubmit({
                                                    ...possibleDuplicate,
                                                    existingMemberId: possibleDuplicate.id,
                                                    relationType: relationType,
                                                    relativeId: relativeId
                                                });
                                            }}
                                        >
                                            Koble til {possibleDuplicate.firstName}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Relationship Status (Only if partner) */}
                        {isPartner && (
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sivilstatus</label>
                                <select
                                    value={pendingRelationshipStatus}
                                    onChange={(e) => setPendingRelationshipStatus(e.target.value)}
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
                                            {initialData ? 'Lagre endringer' : 'Lagre'}
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
