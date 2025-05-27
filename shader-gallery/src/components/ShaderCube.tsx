"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  shaderName: string;
  width?: number;
  height?: number;
};

export default function ShaderCube({
  shaderName,
  width = 400,
  height = 400,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fragSource, setFragSource] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shaders/${shaderName}`)
      .then((res) => res.text())
      .then(setFragSource)
      .catch((err) => console.error("Failed to load shader:", err));
  }, [shaderName]);

  useEffect(() => {
    if (!fragSource) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true, // <-- Enable transparent background
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // <-- Fully transparent

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 2;

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: fragSource,
      uniforms,
    });

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();
      uniforms.u_time.value = elapsed;

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [fragSource, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width,
        height,
        display: "block",
        background: "transparent",
      }}
    />
  );
}
