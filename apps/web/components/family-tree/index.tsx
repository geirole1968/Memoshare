"use client";

import React, { useCallback, useMemo } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { FamilyMember, Relationship } from "@memoshare/core";
import FamilyMemberNode from "./node";
import { PersonDetailsModal } from "./person-details-modal";
import { AddMemberSelection, RelationType } from "./add-member-selection";
import { AddMemberForm } from "./add-member-form";

const nodeWidth = 280; // Wider for the new design
const nodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: "TB" });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

interface FamilyTreeProps {
    members: FamilyMember[];
    relationships: Relationship[];
}

export default function FamilyTree({ members: initialMembers, relationships: initialRelationships }: FamilyTreeProps) {
    const [members, setMembers] = React.useState<FamilyMember[]>(initialMembers);
    const [relationships, setRelationships] = React.useState<Relationship[]>(initialRelationships);

    // Modal States
    const [selectedPerson, setSelectedPerson] = React.useState<FamilyMember | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
    const [isSelectionOpen, setIsSelectionOpen] = React.useState(false);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [relationType, setRelationType] = React.useState<RelationType | null>(null);

    // Node Click Handler
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        const member = node.data.member as FamilyMember;
        setSelectedPerson(member);
        setIsDetailsOpen(true);
    }, []);

    // Flow Handlers
    const handleAddRelativeClick = (member: FamilyMember) => {
        setIsDetailsOpen(false); // Close details
        setIsSelectionOpen(true); // Open selection
        // Reset edit state
        setRelationType(null);
    };

    const handleEditClick = (member: FamilyMember) => {
        setSelectedPerson(member);
        setIsDetailsOpen(false);
        setRelationType(null); // No relation type when editing self
        setIsFormOpen(true);
    };

    const handleRelationSelect = (type: RelationType) => {
        setRelationType(type);
        setIsSelectionOpen(false); // Close selection
        setIsFormOpen(true); // Open form
    };

    const handleDelete = (id: string) => {

        setMembers(prev => prev.filter(m => m.id !== id));
        setRelationships(prev => prev.filter(r => r.fromId !== id && r.toId !== id));
        setIsFormOpen(false);
        setSelectedPerson(null);
    };

    const handleFormSubmit = (data: Partial<FamilyMember>) => {
        // CASE 1: Editing existing member
        if (selectedPerson && !relationType) {
            setMembers(prev => prev.map(m => m.id === selectedPerson.id ? { ...m, ...data } : m));
            setIsFormOpen(false);
            return;
        }

        // CASE 2: Adding new relative
        if (!selectedPerson || !relationType) return;

        const newMember: FamilyMember = {
            id: Math.random().toString(36).substr(2, 9),
            firstName: data.firstName || "Ukjent",
            lastName: data.lastName || "Ukjent",
            ...data
        } as FamilyMember;

        // Add new member
        setMembers(prev => [...prev, newMember]);

        // Create relationship
        const newRelationship: Relationship = {
            id: Math.random().toString(36).substr(2, 9),
            fromId: selectedPerson.id,
            toId: newMember.id,
            type: relationType === 'partner' ? 'spouse' :
                ['son', 'daughter'].includes(relationType) ? 'parent' : // Selected is parent OF new
                    ['father', 'mother'].includes(relationType) ? 'child' : // Selected is child OF new
                        'sibling' // Brother/Sister
        };

        // If adding parent, relation is FROM new TO selected (New is parent of Selected)
        if (['father', 'mother'].includes(relationType)) {
            newRelationship.fromId = newMember.id;
            newRelationship.toId = selectedPerson.id;
            newRelationship.type = 'parent';
        }

        setRelationships(prev => [...prev, newRelationship]);
        setIsFormOpen(false);
    };

    // --- Graph Layout Logic (Re-run when members/relationships change) ---
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
        const nodes: Node[] = members.map((member) => ({
            id: member.id,
            type: "familyMember",
            data: { label: member.firstName, member },
            position: { x: 0, y: 0 },
        }));

        const edges: Edge[] = relationships
            .filter((r) => r.type === "parent")
            .map((rel) => ({
                id: rel.id,
                source: rel.fromId,
                target: rel.toId,
                type: "smoothstep",
                animated: true,
            }));

        return getLayoutedElements(nodes, edges);
    }, [members, relationships]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    // Update nodes/edges when layout changes
    React.useEffect(() => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const nodeTypes = useMemo(() => ({ familyMember: FamilyMemberNode }), []);

    return (
        <div style={{ width: "100%", height: "600px" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
            >
                <Controls />
                <MiniMap />
                <Background gap={12} size={1} />
            </ReactFlow>

            {/* Modals */}
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

            <AddMemberForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                onDelete={handleDelete}
                relationType={relationType}
                relativeName={selectedPerson?.firstName || ''}
                initialData={!relationType ? selectedPerson : null}
            />
        </div>
    );
}
