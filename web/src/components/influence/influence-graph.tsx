"use client";

import { useMemo, useRef, useState } from "react";
import type { GraphContact, InfluenceRelationship } from "@/types/influence";
import {
  labelFor,
  RELATIONSHIP_TYPES,
  strengthColor,
  ubuntuStanceVariant,
} from "@/lib/constants/influence";
import { Badge } from "@/components/ui/badge";

type LayoutNode = GraphContact & { x: number; y: number };

function layoutNodes(nodes: GraphContact[], width: number, height: number): LayoutNode[] {
  if (nodes.length === 0) return [];
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    return {
      ...node,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

export function InfluenceGraph({
  nodes,
  edges,
  hiddenTypes = new Set<string>(),
}: {
  nodes: GraphContact[];
  edges: InfluenceRelationship[];
  hiddenTypes?: Set<string>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });

  const width = 960;
  const height = 560;

  const visibleEdges = useMemo(
    () => edges.filter((e) => !hiddenTypes.has(e.relationship_type)),
    [edges, hiddenTypes]
  );

  const layout = useMemo(() => layoutNodes(nodes, width, height), [nodes, width, height]);
  const nodeById = useMemo(() => new Map(layout.map((n) => [n.id, n])), [layout]);

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({ ...t, scale: Math.min(2.5, Math.max(0.4, t.scale * delta)) }));
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    setDragging(true);
    setLastPan({ x: e.clientX, y: e.clientY });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    const dx = e.clientX - lastPan.x;
    const dy = e.clientY - lastPan.y;
    setLastPan({ x: e.clientX, y: e.clientY });
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }

  function onMouseUp() {
    setDragging(false);
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
        No contacts in graph scope. Add relationships or stakeholders to visualize the network.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
        Scroll to zoom · drag to pan · {nodes.length} contacts · {visibleEdges.length} relationships
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ height: 560, minWidth: 640 }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="28" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" />
            </marker>
          </defs>

          {visibleEdges.map((edge) => {
            const source = nodeById.get(edge.source_contact_id);
            const target = nodeById.get(edge.target_contact_id);
            if (!source || !target) return null;
            const color = strengthColor(edge.strength);
            return (
              <g key={edge.id}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={color}
                  strokeWidth={edge.strength}
                  strokeOpacity={0.6}
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2 - 6}
                  textAnchor="middle"
                  className="fill-gray-500 text-[10px]"
                >
                  {labelFor(RELATIONSHIP_TYPES, edge.relationship_type)} ({edge.strength})
                </text>
              </g>
            );
          })}

          {layout.map((node) => {
            const name = `${node.first_name} ${node.last_name}`;
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r={26}
                  fill={node.ubuntu_stance === "CHAMPION" ? "#9035F4" : node.ubuntu_stance === "BLOCKER" ? "#FEE2E2" : "#F3F4F6"}
                  stroke={node.ubuntu_stance === "CHAMPION" ? "#9035F4" : "#D1D5DB"}
                  strokeWidth={2}
                />
                <text textAnchor="middle" y={4} className="fill-gray-800 text-[10px] font-semibold">
                  {node.first_name[0]}
                  {node.last_name[0]}
                </text>
                <text textAnchor="middle" y={42} className="fill-gray-900 text-[11px] font-medium">
                  {name.length > 18 ? `${name.slice(0, 16)}…` : name}
                </text>
                {node.title && (
                  <text textAnchor="middle" y={55} className="fill-gray-500 text-[9px]">
                    {node.title.length > 22 ? `${node.title.slice(0, 20)}…` : node.title}
                  </text>
                )}
                {node.organization?.name && (
                  <text textAnchor="middle" y={67} className="fill-brand-purple text-[9px]">
                    {node.organization.name.length > 20
                      ? `${node.organization.name.slice(0, 18)}…`
                      : node.organization.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {nodes.some((n) => n.ubuntu_stance) && (
        <div className="flex flex-wrap gap-2 border-t border-gray-100 px-4 py-3">
          {nodes
            .filter((n) => n.ubuntu_stance)
            .map((n) => (
              <Badge key={n.id} variant={ubuntuStanceVariant(n.ubuntu_stance)}>
                {n.first_name} {n.last_name}: {n.ubuntu_stance}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
