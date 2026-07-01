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
      powerPreference="low-power"
    >
      <ShaderGradient
        type="waterPlane"
        animate={animate}
        color1={color1}
        color2={color2}
        color3={color3}
        uSpeed={0.15}
        uStrength={2}
        uDensity={1.2}
        uAmplitude={1}
        uFrequency={5.5}
        grain="off"
        lightType="3d"
        brightness={1.1}
        reflection={0.1}
        cAzimuthAngle={180}
        cPolarAngle={90}
        cDistance={4}
        cameraZoom={1}
        positionY={0}
        rotationX={0}
        rotationY={0}
        rotationZ={0}
      />
    </ShaderGradientCanvas>
  );
}
