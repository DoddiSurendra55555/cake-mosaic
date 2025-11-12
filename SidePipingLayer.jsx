import React from 'react';
import * as THREE from 'three';

// Helper component
function PipingElement({ shape, args, color, position, rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      {shape === 'cone' && <coneGeometry args={args} />}
      {shape === 'box' && <boxGeometry args={args} />}
      {shape === 'sphere' && <sphereGeometry args={args} />}
      <meshPhysicalMaterial color={color} roughness={0.5} metalness={0} />
    </mesh>
  );
}

// Helper function for square bottom points
function getSquareBottomPoints(countPerSide, size, yPos) {
  const points = [];
  const halfSize = size / 2;
  
  for (let i = 0; i < countPerSide; i++) {
    const p = (i / (countPerSide - 1)) * size - halfSize;
    points.push({ pos: [p, yPos, halfSize] }); // Front
    points.push({ pos: [p, yPos, -halfSize] }); // Back
  }
  for (let i = 1; i < countPerSide - 1; i++) {
    const p = (i / (countPerSide - 1)) * size - halfSize;
    points.push({ pos: [halfSize, yPos, p] }); // Right
    points.push({ pos: [-halfSize, yPos, p] }); // Left
  }
  return points;
}

export function SidePipingLayer({ style, shape, pipingColor }) {
  if (style === 'none') return null;

  let elements = [];
  const yPos = 0.1; // Height from ground
  // --- FIX: Use pipingColor, fallback to white ---
  const color = pipingColor || "#FFFFFF";

  // --- 1. Bottom Shell Border ---
  if (style === 'shell') {
    const props = { shape: "cone", args: [0.15, 0.2, 8], color: color };
    
    if (shape === 'circle') {
      const count = 24;
      const radius = 2.05;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        elements.push(
          <PipingElement
            key={i}
            {...props}
            position={[x, yPos, z]}
            rotation={[Math.PI / 2.5, 0, -angle]} // Angled outward
          />
        );
      }
    }
    
    if (shape === 'square') {
      const countPerSide = 8;
      const cakeSize = 3.7;
      const halfSize = cakeSize / 2;

      for (let i = 0; i < countPerSide; i++) {
        const p = (i / (countPerSide - 1)) * cakeSize - halfSize;
        elements.push(
          <PipingElement key={`front-${i}`} {...props} position={[p, yPos, halfSize]} rotation={[Math.PI / 2.5, 0, 0]} />
        );
        elements.push(
          <PipingElement key={`back-${i}`} {...props} position={[p, yPos, -halfSize]} rotation={[Math.PI / 2.5, 0, 0]} />
        );
        if (i > 0 && i < countPerSide - 1) {
          elements.push(
            <PipingElement key={`right-${i}`} {...props} position={[halfSize, yPos, p]} rotation={[Math.PI / 2.5, 0, Math.PI / 2]} />
          );
        }
        if (i > 0 && i < countPerSide - 1) {
          elements.push(
            <PipingElement key={`left-${i}`} {...props} position={[-halfSize, yPos, p]} rotation={[Math.PI / 2.5, 0, -Math.PI / 2]} />
          );
        }
      }
    }
    return <group>{elements}</group>;
  }

  // --- 2. Bead Border ---
  if (style === 'beads') {
    const props = { shape: "sphere", args: [0.12, 16, 16], color: color };
    
    if (shape === 'circle') {
      const count = 30;
      const radius = 2.05;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        elements.push(
          <PipingElement
            key={i}
            {...props}
            position={[x, yPos, z]}
          />
        );
      }
    }
    
    if (shape === 'square') {
      const countPerSide = 10;
      const cakeSize = 3.6;
      const points = getSquareBottomPoints(countPerSide, cakeSize, yPos);
      
      return (
        <group>
          {points.map((p, i) => (
            <PipingElement
              key={i}
              {...props}
              position={p.pos}
            />
          ))}
        </group>
      );
    }
    return <group>{elements}</group>;
  }

  return null;
}