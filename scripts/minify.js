#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { minify } = require("uglify-js");

// Percorso della cartella dist
const distPath = path.join(__dirname, "..", "dist");

// Leggi tutti i file nella cartella dist
fs.readdir(distPath, (err, files) => {
  if (err) {
    console.error("Errore durante la lettura della cartella dist:", err);
    return;
  }

  // Filtra i file JavaScript (.js)
  const jsFiles = files.filter((file) => path.extname(file) === ".js");

  // Minimizza ciascun file JavaScript
  jsFiles.forEach((file) => {
    const filePath = path.join(distPath, file);
    const code = fs.readFileSync(filePath, "utf8");
    const minified = minify(code);

    // Sovrascrivi il file originale con il codice minimizzato
    fs.writeFileSync(filePath, minified.code, "utf8");

    console.log(`File minimizzato: ${file}`);
  });

  console.log("Minimizzazione completata per tutti i file JavaScript in dist.");
});
