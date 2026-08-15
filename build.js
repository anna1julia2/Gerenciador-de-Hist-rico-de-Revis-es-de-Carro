const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");

function copy(source, destination) {
    const sourcePath = path.join(root, source);
    const destinationPath = path.join(dist, destination);

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.cpSync(sourcePath, destinationPath, { recursive: true });
}

if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
}

fs.mkdirSync(dist);

copy("index.html", "index.html");
copy("css", "css");
copy("js", "js");
copy("DESIGN.md", "DESIGN.md");

console.log("Build concluído com sucesso!");
console.log("Arquivos gerados na pasta: dist");
