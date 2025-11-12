import React from 'react';
import * as THREE from 'three';

// Helper component for a single piping element
function PipingElement({ shape, args, color, position, rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      {shape === 'cone' && <coneGeometry args={args} />}
      {shape === 'torus' && <torusGeometry args={args} />}
      {shape === 'sphere' && <sphereGeometry args={args} />}
      <meshPhysicalMaterial color={color} roughness={0.6} metalness={0} />
    </mesh>
  );
}

// Helper to get square points
function getSquarePoints(countPerSide, size, yPos) {
  const points = [];
  const halfSize = size / 2;
  for (let i = 0; i < countPerSide; i++) {
    const p = (i / (countPerSide - 1)) * size - halfSize;
    points.push(new THREE.Vector3(p, yPos, halfSize)); // Front
    points.push(new THREE.Vector3(p, yPos, -halfSize)); // Back
    if (i > 0 && i < countPerSide - 1) { // Avoid corners
      points.push(new THREE.Vector3(halfSize, yPos, p)); // Right
      points.push(new THREE.Vector3(-halfSize, yPos, p)); // Left
    }
  }
  return points;
}

// Helper for 5-petal drop flower
function DropFlower({ position, color }) {
  const petals = [];
  const radius = 0.1;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    petals.push(
      <PipingElement
        key={i}
        shape="sphere"
        args={[0.08, 8, 8]}
        color={color}
        position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
      />
    );
  }
  return <group position={position}>{petals}</group>;
}


export function TopPipingLayer({ style, shape, pipingColor }) {
  if (style === 'none') return null;

  let elements = [];
  // --- FIX: Use pipingColor, fallback to white ---
  const baseColor = pipingColor || "#FFFFFF";
  let elementProps = {};
  const yPos = 0.75;

  // --- 1. Define the element style ---
  switch (style) {
    case 'shell':
      elementProps = { shape: "cone", args: [0.2, 0.3, 8], rotation: [Math.PI, 0, 0], color: baseColor };
      break;
    case 'rosette':
      elementProps = { shape: "torus", args: [0.15, 0.1, 8, 16], rotation: [Math.PI / 2, 0, 0], color: baseColor };
      break;
    case 'dots':
      elementProps = { shape: "sphere", args: [0.15, 16, 16], rotation: [0, 0, 0], color: baseColor };
      break;
    case 'leaf':
      // Leaf is the only one that keeps its own color
      elementProps = { shape: "cone", args: [0.1, 0.4, 8], rotation: [Math.PI / 1.5, 0, 0], color: "#2E8B57" };
      break;
    case 'flower':
      break; // Handled in layout section
    default:
      return null;
  }
  
  const elementY = yPos; // All sit at the same height

  // --- 2. Create the layout based on shape ---
  if (shape === 'circle') {
    const count = 16;
    const radius = 1.7;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      if (style === 'flower') {
        elements.push(<DropFlower key={i} position={[x, elementY, z]} color={baseColor} />);
      } else {
        elements.push(
          <PipingElement key={i} {...elementProps} position={[x, elementY, z]} />
        );
      }
    }
  } 
  
  if (shape === 'square') {
    const countPerSide = 5;
    const edgeSize = 2.9;
    const points = getSquarePoints(countPerSide, edgeSize, elementY);
    
    elements = points.map((pos, i) => {
      if (style === 'flower') {
        return <DropFlower key={i} position={pos} color={baseColor} />;
      } else {
        return <PipingElement key={i} {...elementProps} position={pos} />;
      }
    });
  }

  return <group>{elements}</group>;
}