import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shader } = req.query;

  if (typeof shader !== "string") {
    return res.status(400).send("Invalid shader name");
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "shaders",
    `${shader}.frag`,
  );
  try {
    const code = fs.readFileSync(filePath, "utf8");
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(code);
  } catch {
    res.status(404).send("Shader not found");
  }
}
