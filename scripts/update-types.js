#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "..", "dist");
const mainDeclarationFile = path.resolve(distDir, "index.d.ts");

fs.readdir(distDir, (err, files) => {
  if (err) throw err;

  const declarationFiles = files.filter((file) => file.endsWith(".d.ts") && file !== "index.d.ts");

  const combinedDeclarations = declarationFiles
    .map((file) => {
      let content = fs.readFileSync(path.resolve(distDir, file), "utf-8");
      // Rimuove la keyword "default" se presente
      content = content.replace(/import .+ from ['"].+['"];/g, "");
      content = content.replace(/export default /g, "export ");

      return content;
    })
    .join("\n");

  fs.writeFileSync(mainDeclarationFile, combinedDeclarations);

  console.log("File index.d.ts aggiornato con successo.");
});
