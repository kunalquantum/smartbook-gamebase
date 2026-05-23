import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export default function PostProcessing() {
  return (
    <EffectComposer multisampling={4}>
      {/* Makes glowing eyes, orbs, zone beacons actually glow */}
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.65}
        luminanceSmoothing={0.85}
        mipmapBlur
      />
      {/* Subtle cinematic edge darkening */}
      <Vignette
        offset={0.38}
        darkness={0.42}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
