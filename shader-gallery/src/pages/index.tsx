import React from "react";
import fs from "fs";
import path from "path";
import ShaderCard from "@/components/ShaderCard";
import ShaderCube from "@/components/ShaderCube";
import Head from "next/head";

export async function getStaticProps() {
  const shadersDir = path.join(process.cwd(), "public", "shaders");
  const shaders = fs
    .readdirSync(shadersDir)
    .filter((file) => file.endsWith(".frag"));
  return { props: { shaders } };
}

export default function Home({ shaders }: { shaders: string[] }) {
  return (
    <>
      <Head>
        <meta name="color-scheme" content="dark" />
        <title>🌀 Shader Gallery</title>
      </Head>
      <div className="hero">
        <h1>🌀 Shader Gallery</h1>
        <p>Explore GLSL shaders in aesthetic bliss.</p>
      </div>
      <div className="shader-grid">
        {shaders.map((shader) => (
          <div className="shader-entry" key={shader}>
            <div className="shader-card-container">
              <ShaderCard shaderName={shader.replace(/\.frag$/, "")} />
              <div className="shader-name">{shader}</div>
            </div>
            <ShaderCube
              shaderName={shader.replace(/\.frag$/, "")}
              className="shader-cube"
            />
          </div>
        ))}
      </div>
    </>
  );
}
