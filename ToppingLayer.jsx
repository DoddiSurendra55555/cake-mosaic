import React from 'react';
import * as THREE from 'three';

// Helper component
function ToppingElement({ shape, args, color, position, rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      {shape === 'sphere' && <sphereGeometry args={args} />}
      <meshPhysicalMaterial color={color} roughness={0.5} metalness={0} />
    </mesh>
  );
}

export function ToppingLayer({ style, shape }) {

  // --- THIS IS THE FIX ---
  // Sprinkles sit just above the surface (0.75)
  const yPos = 0.76;
  // -----------------------

  // --- 1. Chocolate Sprinkles ---
  if (style === 'chocoSprinkles') {
    const count = 150;
    return (
      <group>
        {Array.from({ length: count }).map((_, i) => {
          let x, z;
          if (shape === 'circle') {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.sqrt(Math.random()) * 1.8;
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
          } else { // square
            x = THREE.MathUtils.lerp(-1.6, 1.6, Math.random());
            z = THREE.MathUtils.lerp(-1.6, 1.6, Math.random());
          }
          return (
            <ToppingElement
              key={i}
              shape="sphere" args={[0.03, 8, 8]} color="#3C2F2F"
              position={[x, yPos, z]}
            />
          );
        })}
      </group>
    );
  }
  
  // --- 2. Pineapple Sprinkles ---
  if (style === 'pineSprinkles') {
    const count = 150;
    return (
      <group>
        {Array.from({ length: count }).map((_, i) => {
          let x, z;
          if (shape === 'circle') {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.sqrt(Math.random()) * 1.8;
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
          } else {
            x = THREE.MathUtils.lerp(-1.6, 1.6, Math.random());
            z = THREE.MathUtils.lerp(-1.6, 1.6, Math.random());
          }
          return (
            <ToppingElement
              key={i}
              shape="sphere" args={[0.03, 8, 8]} color="#F9E79F"
              position={[x, yPos, z]}
            />
          );
        })}
      </group>
    );
  }

  return null;
}