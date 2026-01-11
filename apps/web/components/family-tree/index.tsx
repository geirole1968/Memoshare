"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Position,
    OnConnect,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FamilyMember, Relationship } from "@memoshare/core";
import CustomNode from "./custom-node";
import CustomEdge from "./custom-edge";
import SpouseEdge from "./spouse-edge";
import UnionNode from "./union-node";
import { PersonDetailsModal } from "./person-details-modal";
import { AddMemberSelection } from "./add-member-selection";
import { RelationType } from "./types";
import AddMemberForm from "./add-member-form";
import { addFamilyMember, deleteFamilyMember, updateFamilyMember } from "./actions";

interface FamilyTreeProps {
    members: FamilyMember[];
    relationships: Relationship[];
    familyId: string;
    onRefresh?: () => void;
}

// Layout Constants
const NODE_WIDTH = 150;
const NODE_HEIGHT = 100;
const SPOUSE_GAP = 50;
const SIBLING_GAP = 50;
const LEVEL_HEIGHT = 200;

// Helper Types for Layout
interface TreeNode {
    id: string;
    member: FamilyMember;
    spouses: TreeNode[];
    children: TreeNode[]; // Children of this person (from any spouse)
    width: number;
    x: number;
    y: number;
    generation: number;
    // For layout calculation
    childrenWidth: number;
    spouseGroupWidth: number;
}

export default function FamilyTree({ members, relationships, familyId, onRefresh }: FamilyTreeProps) {
    console.log("FamilyTree rendered with:", { membersCount: members?.length, relationshipsCount: relationships?.length });

    // Local state
    const [localMembers, setLocalMembers] = useState<FamilyMember[]>(members);
    const [localRelationships, setLocalRelationships] = useState<Relationship[]>(relationships);

    useEffect(() => { setLocalMembers(members); }, [members]);
    useEffect(() => { setLocalRelationships(relationships); }, [relationships]);

    // Modal state
    const [selectedPerson, setSelectedPerson] = useState<FamilyMember | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isSelectionOpen, setIsSelectionOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [relationType, setRelationType] = useState<RelationType | null>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const nodeTypes = useMemo(() => ({ familyMember: CustomNode, union: UnionNode }), []);
    const edgeTypes = useMemo(() => ({ organic: CustomEdge, spouse: SpouseEdge }), []);

    // --- RECURSIVE TREE LAYOUT ALGORITHM ---

    const buildAndLayoutGraph = useCallback((members: FamilyMember[], relationships: Relationship[]) => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // 1. Build Adjacency Lists
        const memberMap = new Map<string, FamilyMember>();
        members.forEach(m => memberMap.set(m.id, m));

        const spouseMap = new Map<string, string[]>();
        const childParentMap = new Map<string, string[]>();
        const parentChildMap = new Map<string, string[]>();

        relationships.forEach(r => {
            if (['spouse', 'partner', 'husband', 'wife'].includes(r.type as string)) {
                if (!spouseMap.has(r.fromId)) spouseMap.set(r.fromId, []);
                if (!spouseMap.has(r.toId)) spouseMap.set(r.toId, []);
                spouseMap.get(r.fromId)!.push(r.toId);
                spouseMap.get(r.toId)!.push(r.fromId);
            } else {
                // Parent -> Child
                if (!parentChildMap.has(r.fromId)) parentChildMap.set(r.fromId, []);
                parentChildMap.get(r.fromId)!.push(r.toId);

                if (!childParentMap.has(r.toId)) childParentMap.set(r.toId, []);
                childParentMap.get(r.toId)!.push(r.fromId);
            }
        });

        // 1b. Infer Spouses from Shared Children (Layout Consistency)
        // If two people share a child, treat them as spouses for layout purposes, 
        // even if no explicit spouse relationship exists.
        childParentMap.forEach((parents, childId) => {
            if (parents.length === 2) {
                const [p1, p2] = parents;
                if (!spouseMap.has(p1)) spouseMap.set(p1, []);
                if (!spouseMap.has(p2)) spouseMap.set(p2, []);

                if (!spouseMap.get(p1)!.includes(p2)) spouseMap.get(p1)!.push(p2);
                if (!spouseMap.get(p2)!.includes(p1)) spouseMap.get(p2)!.push(p1);
            }
        });

        // 2. Identify Roots (No parents in tree, or oldest generation)
        // CRITICAL FIX: Do not treat someone as a root if they have a spouse who HAS parents.
        // This ensures we traverse from the "blood" ancestry (e.g. Egil) down to the child (Geir Ole),
        // rather than starting from the in-law (Line) and "capturing" Geir Ole before Egil gets to him.

        const hasParents = (id: string) => {
            const p = childParentMap.get(id);
            return p && p.length > 0;
        };

        const roots = members.filter(m => {
            // Must have no parents
            if (hasParents(m.id)) return false;

            // Check spouses
            const spouseIds = spouseMap.get(m.id) || [];
            const spouseHasParents = spouseIds.some(sId => hasParents(sId));

            // If spouse has parents, let that tree handle this cluster (unless I am older? No, bloodline priority)
            // Actually, if BOTH have parents, it's two merging trees. We pick one as primary or show both.
            // But if I have NO parents and spouse HAS parents, I am definitely an in-law.
            if (spouseHasParents) return false;

            return true;
        });

        // Sort roots by birth date (Oldest first)
        roots.sort((a, b) => {
            const dateA = a.birthDate ? new Date(a.birthDate).getTime() : Number.MAX_SAFE_INTEGER; // No date = youngest/last
            const dateB = b.birthDate ? new Date(b.birthDate).getTime() : Number.MAX_SAFE_INTEGER;
            return dateA - dateB;
        });

        // 3. Build Tree Structure (Recursive)
        const visited = new Set<string>();

        const buildTree = (memberId: string, generation: number): TreeNode => {
            visited.add(memberId);
            const member = memberMap.get(memberId)!;

            // Get Spouses
            const spouseIds = spouseMap.get(memberId) || [];
            const spouses: TreeNode[] = [];
            spouseIds.forEach(sId => {
                if (!visited.has(sId)) {
                    visited.add(sId);
                    spouses.push({
                        id: sId,
                        member: memberMap.get(sId)!,
                        spouses: [], // Spouses of spouse? usually just back to member
                        children: [],
                        width: NODE_WIDTH,
                        x: 0, y: 0, generation,
                        childrenWidth: 0,
                        spouseGroupWidth: NODE_WIDTH
                    });
                }
            });

            // Get Children (from this member AND their spouses)
            const childrenIds = parentChildMap.get(memberId) || [];

            const children: TreeNode[] = [];
            childrenIds.forEach(cId => {
                if (!visited.has(cId)) {
                    children.push(buildTree(cId, generation + 1));
                }
            });

            // Sort children by birth date
            children.sort((a, b) => {
                if (a.member.birthDate && b.member.birthDate)
                    return new Date(a.member.birthDate).getTime() - new Date(b.member.birthDate).getTime();
                return 0;
            });

            return {
                id: memberId,
                member,
                spouses,
                children,
                width: 0, x: 0, y: 0, generation,
                childrenWidth: 0,
                spouseGroupWidth: 0
            };
        };

        const forest: TreeNode[] = roots.map(r => {
            if (visited.has(r.id)) return null;
            return buildTree(r.id, 0);
        }).filter(Boolean) as TreeNode[];

        // 4. Calculate Widths (Recursive)
        const calculateWidth = (node: TreeNode) => {
            // 1. Calculate Spouse Group Width (Node + Spouses)
            node.spouseGroupWidth = NODE_WIDTH + (node.spouses.length * (NODE_WIDTH + SPOUSE_GAP));

            // 2. Calculate Children Width
            let childrenTotalWidth = 0;
            if (node.children.length > 0) {
                node.children.forEach(child => {
                    calculateWidth(child);
                    childrenTotalWidth += child.width;
                });
                childrenTotalWidth += (node.children.length - 1) * SIBLING_GAP;
            }
            node.childrenWidth = childrenTotalWidth;

            // 3. Total Width is Max of SpouseGroup and Children
            node.width = Math.max(node.spouseGroupWidth, node.childrenWidth);
        };

        forest.forEach(root => calculateWidth(root));

        // 5. Assign Positions (Recursive)
        const assignPositions = (node: TreeNode, startX: number, startY: number) => {
            node.x = startX;
            node.y = startY;

            // Distribute Spouses: Left and Right
            // We alternate to keep the main node central-ish
            const leftSpouses = node.spouses.filter((_, i) => i % 2 !== 0);
            const rightSpouses = node.spouses.filter((_, i) => i % 2 === 0);

            const leftSpousesWidth = leftSpouses.length * (NODE_WIDTH + SPOUSE_GAP);
            // const rightSpousesWidth = rightSpouses.length * (NODE_WIDTH + SPOUSE_GAP);

            // Center the Spouse Group within the Total Width
            // The "Spouse Group" now includes LeftSpouses + Main + RightSpouses
            const spouseGroupStartX = startX + (node.width - node.spouseGroupWidth) / 2;

            // Main Member Position
            const memberX = spouseGroupStartX + leftSpousesWidth;
            const memberY = startY;

            nodes.push({
                id: node.id,
                type: 'familyMember',
                data: { label: node.member.firstName, avatarUrl: node.member.avatarUrl, member: node.member },
                position: { x: memberX, y: memberY }
            });

            // Helper to add spouse and edge
            const addSpouseNodeAndEdge = (spouse: TreeNode, x: number, direction: 'left' | 'right') => {
                nodes.push({
                    id: spouse.id,
                    type: 'familyMember',
                    data: { label: spouse.member.firstName, avatarUrl: spouse.member.avatarUrl, member: spouse.member },
                    position: { x, y: memberY }
                });

                // Union Node
                const sortedIds = [node.id, spouse.id].sort();
                const unionId = `union-${sortedIds.join('-')}`;

                // Position Union exactly between them
                // If direction is left: Spouse (x) ... Main (memberX). Union at x + WIDTH + GAP/2 - 5
                // If direction is right: Main (memberX) ... Spouse (x). Union at memberX + WIDTH + GAP/2 - 5

                let unionX = 0;
                if (direction === 'left') {
                    unionX = x + NODE_WIDTH + (SPOUSE_GAP / 2) - 5;
                } else {
                    unionX = memberX + NODE_WIDTH + (SPOUSE_GAP / 2) - 5;
                }

                const unionY = memberY + 27;

                if (!nodes.find(n => n.id === unionId)) {
                    nodes.push({
                        id: unionId,
                        type: 'union',
                        data: { label: '' },
                        position: { x: unionX, y: unionY },
                        style: { width: 1, height: 1, opacity: 0 }
                    });
                }

                // Spouse Edge
                edges.push({
                    id: `spouse-${node.id}-${spouse.id}`,
                    source: node.id,
                    target: spouse.id,
                    type: 'spouse',
                    sourceHandle: direction === 'left' ? 'left-source' : 'right-source',
                    targetHandle: direction === 'left' ? 'right-target' : 'left-target'
                });

                // Connect Union to Children
                const mutualChildren = node.children.filter(child => {
                    const parents = childParentMap.get(child.id) || [];
                    return parents.includes(spouse.id);
                });

                mutualChildren.forEach(child => {
                    edges.push({
                        id: `edge-${unionId}-${child.id}`,
                        source: unionId,
                        target: child.id,
                        type: 'organic',
                        sourceHandle: 'source',
                        targetHandle: 'top-target'
                    });
                });
            };

            // Position Left Spouses (growing outwards to the left)
            // S3 - S1 - Main
            // S1 is at memberX - (WIDTH + GAP)
            // S3 is at memberX - 2*(WIDTH + GAP)
            leftSpouses.forEach((spouse, i) => {
                const x = memberX - ((i + 1) * (NODE_WIDTH + SPOUSE_GAP));
                addSpouseNodeAndEdge(spouse, x, 'left');
            });

            // Position Right Spouses (growing outwards to the right)
            // Main - S0 - S2
            // S0 is at memberX + (WIDTH + GAP)
            rightSpouses.forEach((spouse, i) => {
                const x = memberX + ((i + 1) * (NODE_WIDTH + SPOUSE_GAP));
                addSpouseNodeAndEdge(spouse, x, 'right');
            });

            // Position Children
            if (node.children.length > 0) {
                const childrenStartY = startY + LEVEL_HEIGHT;
                // Center the children group within the Total Width
                const childrenGroupStartX = startX + (node.width - node.childrenWidth) / 2;

                let currentChildX = childrenGroupStartX;
                node.children.forEach(child => {
                    assignPositions(child, currentChildX, childrenStartY);
                    currentChildX += child.width + SIBLING_GAP;
                });
            }
        };

        let currentRootX = 0;
        forest.forEach(root => {
            assignPositions(root, currentRootX, 0);
            currentRootX += root.width + 100; // Gap between trees
        });

        // 6. Handle Single Parents (No Spouse, but has children)
        const addSingleParentEdges = (node: TreeNode) => {
            node.children.forEach(child => {
                const parents = childParentMap.get(child.id) || [];
                // If only 1 parent is known/in-tree
                if (parents.length === 1 && parents[0] === node.id) {
                    edges.push({
                        id: `edge-${node.id}-${child.id}`,
                        source: node.id,
                        target: child.id,
                        type: 'organic',
                        sourceHandle: 'bottom-source',
                        targetHandle: 'top-target'
                    });
                }
                addSingleParentEdges(child);
            });
        };
        forest.forEach(root => addSingleParentEdges(root));

        return { nodes, edges };

    }, []);

    // Update nodes/edges when props change
    useEffect(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = buildAndLayoutGraph(localMembers, localRelationships);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [localMembers, localRelationships, buildAndLayoutGraph]);

    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    // Handlers
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (node.type === 'union') return;
        const member = node.data.member as FamilyMember;
        setSelectedPerson(member);
        setIsDetailsOpen(true);
    }, []);

    const handleAddRelativeClick = () => {
        setIsDetailsOpen(false);
        setIsSelectionOpen(true);
    };

    const handleRelationSelect = (type: RelationType) => {
        setRelationType(type);
        setIsSelectionOpen(false);
        setIsFormOpen(true);
    };

    const handleEditClick = () => {
        setRelationType(null);
        setIsDetailsOpen(false);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        const isEditing = !relationType && selectedPerson;

        try {
            if (isEditing && selectedPerson) {
                const result = await updateFamilyMember(selectedPerson.id, data);
                if (result.error) {
                    alert("Feil ved oppdatering: " + result.error);
                } else {
                    setLocalMembers((prev) => prev.map(m =>
                        m.id === selectedPerson.id ? { ...m, ...data } : m
                    ));
                    if (onRefresh) onRefresh();
                }
            } else {
                const result = await addFamilyMember(familyId, {
                    ...data,
                    relationType: relationType,
                    relativeId: selectedPerson?.id,
                });

                if (result.error) {
                    alert("Feil ved opprettelse: " + result.error);
                } else if (result.member) {
                    setLocalMembers((prev) => [...prev, result.member!]);
                    if (result.relationships) {
                        setLocalRelationships((prev) => [...prev, ...result.relationships!]);
                    }
                    if (onRefresh) onRefresh();
                }
            }
        } catch (e) {
            console.error(e);
            alert("En uventet feil oppstod");
        }
        setIsFormOpen(false);
    };

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteFamilyMember(id);
            if (result.error) {
                alert("Feil ved sletting: " + result.error);
            } else {
                setLocalMembers((prev) => prev.filter(m => m.id !== id));
                setLocalRelationships((prev) => prev.filter(r => r.fromId !== id && r.toId !== id));
                if (onRefresh) onRefresh();
            }
        } catch (e) {
            console.error("Exception in handleDelete:", e);
            alert("En uventet feil oppstod");
        }
        setIsFormOpen(false);
        setIsDetailsOpen(false);
        setSelectedPerson(null);
    };

    return (
        <div style={{ width: '100%', height: '80vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
                <PersonDetailsModal
                    member={selectedPerson}
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    onAddRelative={handleAddRelativeClick}
                    onEdit={handleEditClick}
                />
                <AddMemberSelection
                    isOpen={isSelectionOpen}
                    onClose={() => setIsSelectionOpen(false)}
                    onSelect={handleRelationSelect}
                />
                {isFormOpen && (
                    <AddMemberForm
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSubmit={handleFormSubmit}
                        onDelete={handleDelete}
                        relationType={relationType}
                        relativeName={selectedPerson?.firstName || ''}
                        relativeId={selectedPerson?.id}
                        initialData={!relationType ? selectedPerson : null}
                        existingMembers={localMembers}
                        relationships={localRelationships}
                    />
                )}
            </ReactFlow>
        </div>
    );
}
