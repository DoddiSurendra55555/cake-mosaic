import React from 'react';
import * as THREE from 'three'; 
// --- NEW: Import RoundedBox for the square cake ---
import { RoundedBox } from '@react-three/drei';

// --- Define the 2D profile points for the CIRCLE cake ---
// This shape will be "spun" 360 degrees
const cakeProfilePoints = [];
cakeProfilePoints.push( new THREE.Vector2( 0, -0.75 ) );    // 1. Center bottom
cakeProfilePoints.push( new THREE.Vector2( 2, -0.75 ) );    // 2. Edge bottom
cakeProfilePoints.push( new THREE.Vector2( 2, 0.65 ) );     // 3. Edge side (just before bevel)
cakeProfilePoints.push( new THREE.Vector2( 1.9, 0.75 ) );   // 4. Beveled top edge
cakeProfilePoints.push( new THREE.Vector2( 0, 0.75 ) );     // 5. Center top
// ----------------------------------------------

export function Model({ cakeShape, flavorProps, coatingProps }) {

  // Get the material properties
  const materialProps = coatingProps.color ? coatingProps : flavorProps;
  const finalMaterialProps = { ...materialProps, metalness: 0 };

  // --- 1. CIRCLE CAKE ---
  if (cakeShape === 'circle') {
    return (
      <group>
        {/* --- Circle Cake Board --- */}
        <mesh position={[0, -0.8, 0]} receiveShadow>
          <cylinderGeometry args={[2.2, 2.2, 0.1, 32]} />
          <meshStandardMaterial color="#cccccc" roughness={0.8} />
        </mesh>
        
        {/* --- THIS IS THE FIX --- */}
        {/* We now use the <latheGeometry> component 
            and pass the points array as the 'args' prop.
            This allows React to manage the geometry and material 
            together correctly on re-renders. */}
        <mesh castShadow>
          <latheGeometry args={[cakeProfilePoints, 32]} />
          <meshPhysicalMaterial {...finalMaterialProps} />
        </mesh>
        {/* ----------------------- */}
      </group>
    );
  }

  // --- 2. SQUARE CAKE ---
  if (cakeShape === 'square') {
    return (
      <group>
        {/* --- Square Cake Board --- */}
        <mesh position={[0, -0.8, 0]} receiveShadow>
          <boxGeometry args={[3.8, 0.1, 3.8]} />
          <meshStandardMaterial color="#cccccc" roughness={0.8} />
        </mesh>

        {/* --- Beveled Square Cake Mesh --- */}
        <RoundedBox 
          args={[3.5, 1.5, 3.5]} // width, height, depth
          radius={0.1} // This creates the soft, beveled edge
          castShadow
        >
          <meshPhysicalMaterial {...finalMaterialProps} />
        </RoundedBox>
      </group>
    );
  }

  return null;
}