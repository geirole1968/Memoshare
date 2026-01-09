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
import dagre from "dagre";
import { FamilyMember, Relationship } from "@memoshare/core";
import CustomNode from "./custom-node";
import CustomEdge from "./custom-edge";
import SpouseEdge from "./spouse-edge";
import { PersonDetailsModal } from "./person-details-modal";
import { AddMemberSelection } from "./add-member-selection";
import { RelationType } from "./types";
import AddMemberForm from "./add-member-form";
import { addFamilyMember, deleteFamilyMember, updateFamilyMember } from "./actions";

interface FamilyTreeProps {
    members: FamilyMember[];
    relationships: Relationship[];
    familyId: string;
}

export default function FamilyTree({ members, relationships, familyId }: FamilyTreeProps) {
    console.log("FamilyTree rendered with:", { membersCount: members?.length, relationshipsCount: relationships?.length });
    // State for modals
    const [selectedPerson, setSelectedPerson] = useState<FamilyMember | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isSelectionOpen, setIsSelectionOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [relationType, setRelationType] = useState<RelationType | null>(null);

    // Initial Nodes and Edges
    // We use useMemo to avoid recalculating on every render, but we need to handle updates if props change
    // Layout Graph
    const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[]) => {
        console.log("getLayoutedElements called with:", { nodesCount: nodes.length, edgesCount: edges.length });
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        const nodeWidth = 150; // Increased width for better spacing
        const nodeHeight = 100;
        const rankSep = 100; // Vertical spacing
        const nodeSep = 50;  // Horizontal spacing

        dagreGraph.setGraph({
            rankdir: 'TB',
            ranksep: rankSep,
            nodesep: nodeSep
        });

        // 1. Add all real nodes
        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });

        // 2. Identify unions (spouse relationships)
        const unions: Record<string, { id: string, spouses: string[] }> = {};
        const spouseEdges = edges.filter(e => e.type === 'spouse');

        spouseEdges.forEach(edge => {
            const spouses = [edge.source, edge.target].sort();
            const unionId = `union-${spouses.join('-')}`;

            if (!unions[unionId]) {
                unions[unionId] = { id: unionId, spouses };
                // Add virtual union node
                dagreGraph.setNode(unionId, { width: 10, height: 10 }); // Tiny node

                // Connect spouses to union node
                // Setting minlen to 0 or 1. If 1, union is below spouses.
                // We want spouses on same rank. 
                // Dagre doesn't support 'same rank' constraint easily without subgraphs.
                // Standard trick: Spouses -> Union -> Children. 
                // This puts Union at Rank+1, Children at Rank+2.
                dagreGraph.setEdge(edge.source, unionId, { weight: 10, minlen: 1 });
                dagreGraph.setEdge(edge.target, unionId, { weight: 10, minlen: 1 });
            }
        });

        // 3. Handle Parent-Child relationships
        const parentEdges = edges.filter(e => e.type !== 'spouse');
        const childParents: Record<string, string[]> = {};

        // Group parents for each child
        parentEdges.forEach(edge => {
            if (!childParents[edge.target]) {
                childParents[edge.target] = [];
            }
            childParents[edge.target].push(edge.source);
        });

        // Connect children to appropriate source (Union or Parent)
        Object.entries(childParents).forEach(([childId, parents]) => {
            let connectedToUnion = false;

            // Check if parents are in a union
            if (parents.length === 2) {
                const sortedParents = [...parents].sort();
                const unionId = `union-${sortedParents.join('-')}`;
                if (unions[unionId]) {
                    // Connect Union -> Child
                    dagreGraph.setEdge(unionId, childId, { weight: 10, minlen: 1 });
                    connectedToUnion = true;
                }
            }

            // If not connected via union (single parent or parents not married), connect directly
            if (!connectedToUnion) {
                parents.forEach(parentId => {
                    dagreGraph.setEdge(parentId, childId, { weight: 1, minlen: 1 });
                });
            }
        });

        // 4. Run Layout
        dagre.layout(dagreGraph);

        // 5. Map positions back
        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            return {
                ...node,
                position: {
                    x: nodeWithPosition.x - nodeWidth / 2,
                    y: nodeWithPosition.y - nodeHeight / 2,
                },
            };
        });

        // 6. Update spouse edges to use side handles
        const layoutedEdges = edges.map(edge => {
            if (edge.type === 'spouse') {
                const sourceNode = layoutedNodes.find(n => n.id === edge.source);
                const targetNode = layoutedNodes.find(n => n.id === edge.target);

                if (sourceNode && targetNode) {
                    if (sourceNode.position.x < targetNode.position.x) {
                        // Source is Left, Target is Right
                        return {
                            ...edge,
                            sourceHandle: 'right-source',
                            targetHandle: 'left-target'
                        };
                    } else {
                        // Source is Right, Target is Left
                        return {
                            ...edge,
                            sourceHandle: 'left-source',
                            targetHandle: 'right-target'
                        };
                    }
                }
            }
            return edge;
        });

        return { nodes: layoutedNodes, edges: layoutedEdges };
    }, []);

    // ...



    // Initial Nodes and Edges
    // We use useMemo to avoid recalculating on every render, but we need to handle updates if props change
    const initialNodes: Node[] = useMemo(() => members.map((member) => ({
        id: member.id,
        type: "familyMember",
        data: {
            label: member.firstName, // Reverted to only firstName as requested
            avatarUrl: member.avatarUrl,
            member,
            onAddRelative: (member: FamilyMember) => {
                setSelectedPerson(member);
                setIsSelectionOpen(true);
            }
        },
        position: { x: 0, y: 0 },
    })), [members]);



    const initialEdges: Edge[] = useMemo(() => relationships
        .map((rel) => ({
            id: rel.id,
            source: rel.fromId,
            target: rel.toId,
            type: rel.type === 'spouse' ? "spouse" : "organic",
            animated: rel.type === 'parent', // Only animate parent-child flow
        })), [relationships]);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // ...

    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    const nodeTypes = useMemo(() => ({ familyMember: CustomNode }), []);
    const edgeTypes = useMemo(() => ({ organic: CustomEdge, spouse: SpouseEdge }), []);

    // Update nodes/edges when props change
    useEffect(() => {
        console.log("useEffect triggered. InitialNodes:", initialNodes.length, "InitialEdges:", initialEdges.length);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges
        );
        console.log("Setting nodes and edges:", { nodes: layoutedNodes.length, edges: layoutedEdges.length });
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges, getLayoutedElements]);

    // Handlers
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
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
        setRelationType(null); // Editing existing
        setIsDetailsOpen(false);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        console.log("Form submitted:", data);

        // Determine if we are editing or adding based on if we have a selected person AND no relation type (editing)
        // OR if we passed initialData to the form.
        // The form returns data.

        // We need to know if we are editing.
        // In handleEditClick we set relationType to null and selectedPerson is set.
        const isEditing = !relationType && selectedPerson;

        try {
            if (isEditing && selectedPerson) {
                // Edit existing
                const result = await updateFamilyMember(selectedPerson.id, data);
                if (result.error) {
                    alert("Feil ved oppdatering: " + result.error);
                }
            } else {
                // Add new
                const additionalRelationships: any[] = [];

                // Logic for inferring relationships
                if (selectedPerson) {
                    // Case 1: Adding a child. Check if selectedPerson (parent) has a spouse.
                    if (['son', 'daughter'].includes(relationType || '')) {
                        const spouseEdges = relationships.filter(r =>
                            r.type === 'spouse' &&
                            (r.fromId === selectedPerson.id || r.toId === selectedPerson.id)
                        );

                        for (const edge of spouseEdges) {
                            const spouseId = edge.fromId === selectedPerson.id ? edge.toId : edge.fromId;
                            const spouse = members.find(m => m.id === spouseId);

                            if (spouse) {
                                if (window.confirm(`Er ${spouse.firstName} også forelder til ${data.firstName}?`)) {
                                    additionalRelationships.push({
                                        relativeId: spouse.id,
                                        relationType: 'child', // New person is child of spouse
                                    });
                                }
                            }
                        }
                    }

                    // Case 2: Adding a parent. Check if selectedPerson (child) already has a parent.
                    if (['father', 'mother'].includes(relationType || '')) {
                        const parentEdges = relationships.filter(r =>
                            r.type === 'parent' && r.toId === selectedPerson.id
                        );

                        for (const edge of parentEdges) {
                            const parentId = edge.fromId;
                            const parent = members.find(m => m.id === parentId);

                            if (parent) {
                                if (window.confirm(`Er ${data.firstName} partner med ${parent.firstName}?`)) {
                                    additionalRelationships.push({
                                        relativeId: parent.id,
                                        relationType: 'spouse', // New person is spouse of existing parent
                                        status: 'gift' // Default
                                    });
                                }
                            }
                        }
                    }
                }

                const result = await addFamilyMember(familyId, {
                    ...data,
                    relationType: relationType,
                    relativeId: selectedPerson?.id,
                    additionalRelationships
                });
                if (result.error) {
                    alert("Feil ved opprettelse: " + result.error);
                }
            }
        } catch (e) {
            console.error(e);
            alert("En uventet feil oppstod");
        }

        setIsFormOpen(false);
    };

    const handleDelete = async (id: string) => {
        // Confirmation is handled in AddMemberForm
        console.log("handleDelete called for ID:", id);

        try {
            const result = await deleteFamilyMember(id);
            console.log("deleteFamilyMember result:", result);
            if (result.error) {
                alert("Feil ved sletting: " + result.error);
            } else {
                // Remove from local state immediately
                setNodes((nds) => nds.filter((node) => node.id !== id));
                setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
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

                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={() => {
                            setRelationType(null);
                            setSelectedPerson(null);
                            setIsFormOpen(true);
                        }}
                        className="bg-[var(--primary)] text-white px-4 py-2 rounded-full shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Legg til person
                    </button>
                </div>

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
                        existingMembers={members}
                        relationships={relationships}
                    />
                )}
            </ReactFlow>
        </div>
    );
}
