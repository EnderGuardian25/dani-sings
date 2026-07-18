"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export type ShaderColors = { color1: string; color2: string; color3: string };

type Props = {
  /**
   * Live colour target — mutated by Ambience's scroll handler, read every frame
   * by <ColorSync/> below. Deliberately a ref, NOT state/props: re-rendering
   * <ShaderGradient/> with new colour props costs ~65ms per change (the library
   * rebuilds its internal material), which was the root cause of scroll jank.
   */
  colorsRef: React.MutableRefObject<ShaderColors>;
  animate: "on" | "off";
};

/** #rrggbb → [0..1, 0..1, 0..1] (matches the shader's normalised uC*r/g/b uniforms) */
function hexToUnit(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

type UniformMap = Record<string, { value: number }>;

type GradientMaterial = {
  userData?: Record<string, unknown>;
  onBeforeCompile?: (shader: { uniforms: UniformMap }, renderer: unknown) => void;
  needsUpdate?: boolean;
};

/**
 * Runs inside the R3F canvas. Each frame, if the colour target changed, writes
 * the shader's per-channel colour uniforms (uC1r..uC3b) directly on the GPU
 * program — no React re-render, no material rebuild. This is what keeps
 * scrolling smooth while the background shifts hue: re-rendering
 * <ShaderGradient/> with new colour props rebuilds + recompiles its material
 * (~65ms main-thread stall per colour change — the original scroll jank).
 *
 * The library keeps those uniforms in a closure that's only reachable inside
 * the material's `onBeforeCompile`, so on mount we wrap it, force one shader
 * recompile, and capture the live `shader.uniforms` object.
 */
function ColorSync({ colorsRef }: { colorsRef: Props["colorsRef"] }) {
  const uniformsRef = useRef<UniformMap | null>(null);
  const hookedRef = useRef(false);
  const lastApplied = useRef<string>("");

  useFrame(({ scene }) => {
    // One-time: find the gradient material (it owns a uTime uniform in userData)
    // and hook its compile step to capture the merged uniforms.
    if (!hookedRef.current) {
      scene.traverse((obj) => {
        if (hookedRef.current) return;
        const mat = (obj as unknown as { material?: GradientMaterial }).material;
        if (!mat?.userData?.uTime) return;
        hookedRef.current = true;
        const prev = mat.onBeforeCompile;
        mat.onBeforeCompile = (shader, renderer) => {
          prev?.call(mat, shader, renderer);
          if (shader.uniforms?.uC1r) uniformsRef.current = shader.uniforms;
        };
        mat.needsUpdate = true; // force a recompile so the wrapper runs (once, at load)
      });
      return;
    }
    if (!uniformsRef.current) return; // recompile hasn't landed yet

    const { color1, color2, color3 } = colorsRef.current;
    const key = color1 + color2 + color3;
    if (key === lastApplied.current) return;
    lastApplied.current = key;

    const u = uniformsRef.current;
    const [r1, g1, b1] = hexToUnit(color1);
    const [r2, g2, b2] = hexToUnit(color2);
    const [r3, g3, b3] = hexToUnit(color3);
    u.uC1r.value = r1; u.uC1g.value = g1; u.uC1b.value = b1;
    u.uC2r.value = r2; u.uC2g.value = g2; u.uC2b.value = b2;
    u.uC3r.value = r3; u.uC3g.value = g3; u.uC3b.value = b3;
  });

  return null;
}

export default function ShaderBackground({ colorsRef, animate }: Props) {
  // Mount-time colours only — <ShaderGradient/> must never re-render with new
  // colour props (see colorsRef doc above). ColorSync takes over from here.
  const initial = useRef(colorsRef.current).current;

  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0 }}
      pointerEvents="none"
      pixelDensity={1}
      powerPreference="default"
    >
      <ShaderGradient
        type="waterPlane"
        animate={animate}
        color1={initial.color1}
        color2={initial.color2}
        color3={initial.color3}
        uSpeed={0.15}
        uStrength={0.9}
        uDensity={1.2}
        uAmplitude={0.6}
        uFrequency={3.2}
        grain="off"
        lightType="3d"
        brightness={1.3}
        reflection={0.03}
        cAzimuthAngle={180}
        cPolarAngle={90}
        cDistance={3.2}
        cameraZoom={1}
        positionY={0}
        rotationX={0}
        rotationY={0}
        rotationZ={0}
      />
      <ColorSync colorsRef={colorsRef} />
    </ShaderGradientCanvas>
  );
}
