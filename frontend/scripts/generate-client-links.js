const fs = require("fs/promises");
const path = require("path");
const { randomBytes } = require("crypto");

const CLIENT_LIST_PATH = path.join(process.cwd(), "src", "app", "clients.txt");

const CLIENT_DATA_DIR = path.join(process.cwd(), "data", "clients");

const README_PATH = path.join(process.cwd(), "src", "app", "README.md");

function generateSlug() {
  return randomBytes(16).toString("hex");
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function loadClientNames() {
  try {
    const raw = await fs.readFile(CLIENT_LIST_PATH, "utf8");
    return raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`Client list not found at ${CLIENT_LIST_PATH}`);
      return [];
    }
    throw err;
  }
}

async function appendToReadme(lines) {
  let readmeContent = "";
  try {
    readmeContent = await fs.readFile(README_PATH, "utf8");
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  const newContent =
    readmeContent.trimEnd() +
    "\n" +
    lines.map((l) => `- ${l}`).join("\n") +
    "\n";

  await fs.writeFile(README_PATH, newContent, "utf8");
}

async function main() {
  const names = await loadClientNames();
  if (!names.length) {
    console.log("No clients to process. Exiting.");
    return;
  }

  await ensureDir(CLIENT_DATA_DIR);

  const readmeLines = [];

  for (const name of names) {
    const slug = generateSlug();
    const jsonPath = path.join(CLIENT_DATA_DIR, `${slug}.json`);

    const payload = { name };
    await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), "utf8");

    readmeLines.push(`${name}: /c/${slug}`);
    console.log(`Created client record for "${name}" → ${slug}`);
  }

  if (readmeLines.length) {
    await appendToReadme(readmeLines);
  }

  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
