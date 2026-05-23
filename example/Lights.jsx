export default function Lights() {
  return (
    <>
      {/* Warm golden sun — matches Sky sunPosition */}
      <directionalLight
        castShadow
        color="#ffe4b0"
        shadow-normalBias={0.06}
        position={[100, 50, 100]}
        intensity={4}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-top={60}
        shadow-camera-right={60}
        shadow-camera-bottom={-60}
        shadow-camera-left={-60}
        name="followLight"
      />
      {/* Cool sky-blue fill — simulates sky light bouncing from above */}
      <ambientLight color="#a8c8e8" intensity={1.4} />
      {/* Subtle warm ground bounce */}
      <hemisphereLight
        skyColor="#a8c8e8"
        groundColor="#6a9a50"
        intensity={0.6}
      />
    </>
  );
}
