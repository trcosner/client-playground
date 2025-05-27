import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  shaderName: string;
  width?: number;
  height?: number;
};

export default function ShaderCard({
  shaderName,
  width = 400,
  height = 400,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fragSource, setFragSource] = useState<string | null>(null);

  // Load shader from API
  useEffect(() => {
    fetch(`/api/shaders/${shaderName}`)
      .then((res) => res.text())
      .then(setFragSource)
      .catch((err) => console.error("Failed to load shader:", err));
  }, [shaderName]);

  // Hot reload
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000/ws");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "shader-update" && data.file === `${shaderName}.frag`) {
        fetch(`/api/shaders/${shaderName}?t=${Date.now()}`)
          .then((res) => res.text())
          .then(setFragSource);
      }
    };
    return () => socket.close();
  }, [shaderName]);

  // Render with Three.js
  useEffect(() => {
    if (!fragSource || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = ""; // Clear existing canvas or React artifacts

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
    };

    let material: THREE.ShaderMaterial;
    try {
      material = new THREE.ShaderMaterial({
        vertexShader: `
          void main() {
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: fragSource,
        uniforms,
      });
    } catch (err) {
      console.error("Error creating shader material:", err);
      return;
    }

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId: number;
    const animate = (time: number) => {
      uniforms.u_time.value = time * 0.001;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.innerHTML = ""; // Remove canvas
    };
  }, [fragSource, width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        backgroundColor: "#0f0f1a",
      }}
    />
  );
}
