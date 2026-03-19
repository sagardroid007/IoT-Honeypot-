/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AttackRecord } from '../types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NetworkGraphProps {
  attacks: AttackRecord[];
  onSelectAttack: (attack: AttackRecord) => void;
  selectedAttackId?: string;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: 'source' | 'target';
}

interface Link extends d3.SimulationLinkDatum<Node> {
  attackId: string;
  severity: string;
  attackerDevice?: string;
  attackerLocation?: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ attacks, onSelectAttack, selectedAttackId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [hoveredLink, setHoveredLink] = useState<Link | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || attacks.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = 400;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; cursor: grab;");

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Prepare data
    const nodesMap = new Map<string, Node>();
    const links: Link[] = [];

    attacks.forEach(attack => {
      if (!nodesMap.has(attack.sourceIp)) {
        nodesMap.set(attack.sourceIp, { id: attack.sourceIp, type: 'source' });
      }
      if (!nodesMap.has(attack.targetDevice)) {
        nodesMap.set(attack.targetDevice, { id: attack.targetDevice, type: 'target' });
      }
      links.push({
        source: attack.sourceIp,
        target: attack.targetDevice,
        attackId: attack.id,
        severity: attack.severity,
        attackerDevice: attack.attackerDevice,
        attackerLocation: attack.attackerLocation
      });
    });

    const nodes = Array.from(nodesMap.values());

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    const link = g.append("g")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => {
        if (d.attackId === selectedAttackId) return "#00FF9C";
        switch (d.severity) {
          case 'Critical': return "#FF4D4D";
          case 'High': return "#FFB347";
          case 'Medium': return "#4D96FF";
          default: return "#4B4E54";
        }
      })
      .attr("stroke-width", d => d.attackId === selectedAttackId ? 3 : 1)
      .attr("stroke-dasharray", d => d.severity === 'Critical' ? "none" : "4 2")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        const attack = attacks.find(a => a.id === d.attackId);
        if (attack) onSelectAttack(attack);
      })
      .on("mouseover", (event, d) => {
        setHoveredLink(d);
        setTooltipPos({ x: event.pageX, y: event.pageY });
        d3.select(event.currentTarget).attr("stroke-opacity", 1).attr("stroke-width", d.attackId === selectedAttackId ? 4 : 2);
      })
      .on("mousemove", (event) => {
        setTooltipPos({ x: event.pageX, y: event.pageY });
      })
      .on("mouseout", (event, d) => {
        setHoveredLink(null);
        d3.select(event.currentTarget).attr("stroke-opacity", 0.4).attr("stroke-width", d.attackId === selectedAttackId ? 3 : 1);
      });

    const node = g.append("g")
      .attr("stroke", "#2D2E33")
      .attr("stroke-width", 1)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.type === 'target' ? 12 : 8)
      .attr("fill", d => d.type === 'target' ? "#0A0A0B" : "#1C1D21")
      .style("cursor", "grab")
      .on("mouseover", (event, d) => {
        setHoveredNode(d);
        setTooltipPos({ x: event.pageX, y: event.pageY });
        d3.select(event.currentTarget).attr("stroke", "#00FF9C").attr("stroke-width", 2).attr("fill", "#151619");
      })
      .on("mousemove", (event) => {
        setTooltipPos({ x: event.pageX, y: event.pageY });
      })
      .on("mouseout", (event, d) => {
        setHoveredNode(null);
        d3.select(event.currentTarget).attr("stroke", "#2D2E33").attr("stroke-width", 1).attr("fill", d.type === 'target' ? "#0A0A0B" : "#1C1D21");
      })
      .call(d3.drag<SVGCircleElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Add labels
    const label = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("font-size", "8px")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("font-weight", "bold")
      .attr("fill", "#8E9299")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .attr("dy", d => d.type === 'target' ? 24 : -16)
      .text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      label
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      d3.select(svgRef.current).style("cursor", "grabbing");
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      d3.select(svgRef.current).style("cursor", "grab");
    }

    return () => {
      simulation.stop();
    };
  }, [attacks, selectedAttackId, onSelectAttack]);

  return (
    <div ref={containerRef} className="w-full border border-border bg-bg p-6 overflow-hidden relative hardware-card min-h-[500px]">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] italic font-serif text-white/90">Network Relationship Matrix</h4>
          <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Interactive vector visualization</p>
        </div>
        <div className="flex gap-6 text-[9px] uppercase font-bold tracking-widest text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-bg border border-accent" />
            <span>Target Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-surface border border-border" />
            <span>Source Origin</span>
          </div>
        </div>
      </div>
      
      <svg ref={svgRef} className="w-full h-[400px] bg-transparent relative z-10" />

      {/* Tooltips */}
      {hoveredNode && (
        <div 
          className="fixed z-[100] bg-surface text-text-primary p-3 text-[10px] font-mono pointer-events-none border border-accent/30 shadow-2xl backdrop-blur-md"
          style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
        >
          <p className="font-bold border-b border-border pb-2 mb-2 text-accent tracking-widest uppercase">{hoveredNode.type === 'source' ? 'SOURCE_IP' : 'TARGET_NODE'}</p>
          <p className="text-white/80">{hoveredNode.id}</p>
        </div>
      )}

      {hoveredLink && (
        <div 
          className="fixed z-[100] bg-surface text-text-primary p-4 text-[10px] font-mono pointer-events-none border border-accent/30 shadow-2xl backdrop-blur-md min-w-[200px]"
          style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
        >
          <p className="font-bold border-b border-border pb-2 mb-2 text-accent tracking-widest uppercase">VECTOR_ANALYSIS</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="opacity-40">ID:</span>
              <span className="text-white/80">{hoveredLink.attackId}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-40">SEVERITY:</span>
              <span className={cn(
                "font-bold",
                hoveredLink.severity === 'Critical' ? 'text-danger' : 
                hoveredLink.severity === 'High' ? 'text-warning' : 
                hoveredLink.severity === 'Medium' ? 'text-info' : 'text-text-dim'
              )}>{hoveredLink.severity}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-40">DEVICE:</span>
              <span className="text-white/80">{hoveredLink.attackerDevice}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-40">LOCATION:</span>
              <span className="text-white/80">{hoveredLink.attackerLocation}</span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 right-6 text-[9px] font-mono opacity-20 uppercase tracking-[0.3em] pointer-events-none">
        SCROLL_TO_ZOOM • DRAG_TO_PAN
      </div>
      
      {/* Decorative grid overlay */}
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-20" />
    </div>
  );
};
