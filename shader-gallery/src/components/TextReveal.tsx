// File: components/TextRevealShader.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function TextRevealShader({
  text = "Vaporwave",
  width = 512,
  height = 256,
}: {
  text?: string;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Generate texture from text
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "bold 64px Courier New";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(text, width / 2, height / 2 + 20);
    const newTexture = new THREE.Texture(canvas);
    newTexture.needsUpdate = true;
    setTexture(newTexture);
  }, [text, width, height]);

  useEffect(() => {
    if (!texture) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000,
    );
    camera.position.z = 10;

    const uniforms = {
      u_time: { value: 0.0 },
      u_texture: { value: texture },
      u_resolution: { value: new THREE.Vector2(width, height) },
    };

    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D u_texture;
        uniform float u_time;
        uniform vec2 u_resolution;
        varying vec2 vUv;

        float circle(vec2 uv, vec2 center, float radius) {
          return smoothstep(radius, radius - 0.01, distance(uv, center));
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution;
          float mask = circle(uv, vec2(0.5 + 0.2 * sin(u_time), 0.5 + 0.2 * cos(u_time)), 0.3);
          vec4 texColor = texture2D(u_texture, vUv);
          gl_FragColor = vec4(texColor.rgb, texColor.a * mask);
        }
      `,
      transparent: true,
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const clock = new THREE.Clock();
    const animate = () => {
      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [texture]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width,
        height,
        background: "#000",
        borderRadius: 12,
        boxShadow: "0 0 12px #ff77ff",
        margin: "1rem auto",
        display: "block",
      }}
    />
  );
}
