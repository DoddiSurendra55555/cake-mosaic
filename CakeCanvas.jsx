import React, { Suspense, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Model } from './Model.jsx';
import { TopPipingLayer } from './TopPipingLayer.jsx';
import { SidePipingLayer } from './SidePipingLayer.jsx';
import { ToppingLayer } from './ToppingLayer.jsx';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';

const CakeCanvas = forwardRef(({ 
  flavorProps, 
  coatingProps,
  pipingColor,
  customText, 
  cakeSize,
  cakeShape,
  topDecoration,
  sideDecoration,
  topping
}, ref) => {

  const scale = useMemo(() => {
    if (cakeSize === '1kg') return 1.0;
    if (cakeSize === '½ kg') return 0.7;
    if (cakeSize === '2kg') return 1.3;
    return 1;
  }, [cakeSize]);

  const textMaxWidth = useMemo(() => {
    if (cakeShape === 'circle') return 3.5;
    if (cakeShape === 'square') return 3.0;
    return 3.0;
  }, [cakeShape]);
  
  const Scene = () => {
    const { gl } = useThree();
    
    // --- Expose snapshot function ---
    useImperativeHandle(ref, () => ({
      takeSnapshot: () => {
        return gl.domElement.toDataURL('image/png');
      }
    }));
    
    return (
      <>
        {/* Lighting */}
        <ambientLight intensity={1.0} /> 
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5}
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
        />
        <directionalLight 
          position={[-10, 10, -5]} 
          intensity={0.5}
        />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          maxPolarAngle={Math.PI / 2.1}
          minDistance={1.5}
          maxDistance={20}
        />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.05, -0.81, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>

        <Suspense fallback={null}>
          <group scale={scale} position={[0, 0, 0]}>

            <Model 
              flavorProps={flavorProps} 
              cakeShape={cakeShape} 
              coatingProps={coatingProps} 
            />
            <Text
              position={[0, 0.76, 0]} 
              rotation-x={-Math.PI / 2}
              fontSize={0.5} 
              color="#ffffff"
              maxWidth={textMaxWidth}
              textAlign="center"
              anchorY="middle"
            >
              {customText}
            </Text>
            <TopPipingLayer style={topDecoration} shape={cakeShape} pipingColor={pipingColor} />
            <SidePipingLayer style={sideDecoration} shape={cakeShape} pipingColor={pipingColor} />
            <ToppingLayer style={topping} shape={cakeShape} />
            
          </group>
          
          <EffectComposer>
            <DepthOfField
              focusDistance={0.01}
              focalLength={0.2}
              bokehScale={2}
              height={480}
            />
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.5}
              luminanceSmoothing={0.9}
              height={300}
            />
          </EffectComposer>
        </Suspense>
      </>
    );
  };
  
  return (
    <Canvas 
      shadows
      camera={{ position: [5, 5, 5], fov: 30 }}
      gl={{ preserveDrawingBuffer: true }} // --- Required for snapshot ---
    >
      <color attach="background" args={['#FFFBF5']} />
      <Scene />
    </Canvas>
  );
});

export default CakeCanvas;