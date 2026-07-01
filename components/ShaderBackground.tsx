"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

type Props = {
  color1: string;
  color2: string;
  color3: string;
  animate: "on" | "off";
};

export default function ShaderBackground({ color1, color2, color3, animate }: Props) {
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
        color1={color1}
        color2={color2}
        color3={color3}
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
        cDistance={4.6}
        cameraZoom={1}
        positionY={0}
        rotationX={0}
        rotationY={0}
        rotationZ={0}
      />
    </ShaderGradientCanvas>
  );
}
