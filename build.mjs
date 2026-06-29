import { cp, mkdir, rm } from "node:fs/promises";

const output = new URL("./dist/", import.meta.url);
const publicFiles = ["index.html", "styles.css", "app.js"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await Promise.all(
  publicFiles.map((file) => cp(new URL(file, import.meta.url), new URL(file, output)))
);

console.log(`Built ${publicFiles.length} files in dist/`);
