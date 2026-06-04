import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "../..");
const outDir = join(root, "_portfolio-rehab");
mkdirSync(outDir, { recursive: true });

const rawApiInventoryPath = join(root, "repos.raw.json");
const apiInventoryPath = join(root, "repos.inventory.json");
const apiInventory = existsSync(rawApiInventoryPath)
  ? JSON.parse(readFileSync(rawApiInventoryPath, "utf8"))
  : existsSync(apiInventoryPath)
    ? JSON.parse(readFileSync(apiInventoryPath, "utf8"))
    : [];
const apiByName = new Map(apiInventory.map((repo) => [repo.name, repo]));

const repoDirs = readdirSync(root)
  .filter((name) => !name.startsWith("_"))
  .map((name) => join(root, name))
  .filter((dir) => {
    try {
      return statSync(dir).isDirectory() && existsSync(join(dir, ".git"));
    } catch {
      return false;
    }
  })
  .sort((a, b) => basename(a).localeCompare(basename(b)));

const fileExists = (dir, names) => names.find((name) => existsSync(join(dir, name))) || null;

function git(dir, args) {
  try {
    return execFileSync("git", ["-C", dir, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function listFiles(dir) {
  try {
    return execFileSync("find", [dir, "-maxdepth", "3", "-type", "f", "-not", "-path", "*/.git/*"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .filter(Boolean)
      .map((file) => file.slice(dir.length + 1));
  } catch {
    return [];
  }
}

function readJsonMaybe(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function detectStack(dir, files) {
  const stack = new Set();
  const packageJson = readJsonMaybe(join(dir, "package.json"));
  if (packageJson) {
    stack.add("node");
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps.react || deps["@vitejs/plugin-react"] || files.some((file) => file.endsWith(".jsx"))) stack.add("react");
    if (deps.vite || existsSync(join(dir, "vite.config.js"))) stack.add("vite");
    if (deps.next) stack.add("next");
    if (deps.gulp) stack.add("gulp");
    if (deps.expo || deps["react-native"]) stack.add("mobile");
  }
  if (existsSync(join(dir, "pyproject.toml"))) stack.add("python");
  if (existsSync(join(dir, "requirements.txt")) || existsSync(join(dir, "Pipfile"))) stack.add("python");
  if (files.some((file) => file.endsWith(".ipynb"))) stack.add("notebook");
  if (existsSync(join(dir, "Dockerfile")) || files.some((file) => basename(file) === "docker-compose.yml")) stack.add("docker");
  if (existsSync(join(dir, "Cargo.toml"))) stack.add("rust");
  if (existsSync(join(dir, "Assets")) && existsSync(join(dir, "ProjectSettings"))) stack.add("unity");
  if (files.some((file) => file.endsWith(".rbxm") || file.endsWith(".rbxlx") || file.endsWith(".luau"))) stack.add("roblox");
  if (files.some((file) => /(^|\/)(index|main)\.html$/i.test(file))) stack.add("static-web");
  if (files.some((file) => file.endsWith(".cpp") || file.endsWith(".c"))) stack.add("cpp");
  if (files.some((file) => file.endsWith(".xlsm") || file.endsWith(".xlsx"))) stack.add("spreadsheet");
  return [...stack].sort();
}

function detectCategory(name, api, files, stack) {
  const lower = `${name} ${api.description || ""} ${files.slice(0, 80).join(" ")}`.toLowerCase();
  const has = (pattern) => pattern.test(lower);
  if (has(/\broblox\b/) || stack.includes("roblox")) return "AI-assisted game/tooling";
  if (stack.includes("unity")) return "Games and interactive apps";
  if (has(/\b(game|pygame|wazir|qr-tag|tetris|chameleon|alien invasion|karachi coup|carryokie)\b/)) return "Games and interactive apps";
  if (has(/\b(scraper|crawler|coupon|automater|automation|bot|etl|pipeline|lambda|aws|canvas)\b/)) return "Automation and data pipelines";
  if (has(/\b(machine learning|data science|doc2vec|model|classifier|malaria|bioinformatics|prediction|spam|iris|notebook)\b/) || stack.includes("notebook")) return "Machine learning and data science";
  if (stack.includes("react") || stack.includes("vite") || stack.includes("static-web")) return "Web apps and frontend";
  if (stack.includes("python") || stack.includes("docker")) return "Backend services and developer tools";
  if (stack.includes("cpp") || lower.includes("encrypt")) return "Systems and algorithms";
  return "Archive / learning artifact";
}

function detectDemo(name, files, stack) {
  if (stack.includes("vite") || stack.includes("react")) return "high";
  if (files.some((file) => /^(index|main)\.html$/i.test(file))) return "high";
  if (stack.includes("static-web") || stack.includes("unity") || stack.includes("roblox")) return "medium";
  if (stack.includes("docker") || existsSync(join(root, name, "server.py")) || existsSync(join(root, name, "app.py"))) return "medium";
  if (stack.includes("notebook")) return "medium";
  return "low";
}

function detectMaturity(files, stack, readmePath, api) {
  let score = 0;
  if (readmePath) score += 2;
  if (files.length > 10) score += 1;
  if (stack.includes("docker")) score += 2;
  if (stack.includes("vite") || stack.includes("react") || stack.includes("pyproject.toml")) score += 2;
  if (files.some((file) => /(^|\/)(test|tests|spec)\b/i.test(file))) score += 2;
  if (api.archived) score -= 1;
  if (files.length <= 2) score -= 2;
  if (score >= 6) return "high";
  if (score >= 3) return "medium";
  return "low";
}

function readmeSignals(dir, readmePath) {
  if (!readmePath) return { hasReadme: false, readmeBytes: 0, hasRunInstructions: false, hasDemoLink: false };
  const text = readFileSync(join(dir, readmePath), "utf8");
  return {
    hasReadme: true,
    readmeBytes: Buffer.byteLength(text),
    hasRunInstructions: /\b(npm|pnpm|yarn|pip|python|docker|cargo|run|install)\b/i.test(text),
    hasDemoLink: /https?:\/\/|github\.io|netlify|vercel/i.test(text),
  };
}

function riskNotes(repo, files, stack, readme) {
  const notes = [];
  if (!readme.hasReadme) notes.push("missing README");
  if (readme.hasReadme && readme.readmeBytes < 500) notes.push("thin README");
  if (!readme.hasRunInstructions && files.length > 2) notes.push("no obvious run instructions");
  if (files.length <= 2) notes.push("empty or near-empty repository");
  if (repo.archived) notes.push("archived upstream");
  if (stack.includes("python") && !files.some((file) => /(^|\/)(test|tests)\b/i.test(file))) notes.push("python repo lacks visible tests");
  if (stack.includes("node") && !files.some((file) => file === "package-lock.json" || file === "pnpm-lock.yaml" || file === "yarn.lock")) notes.push("node repo lacks lockfile");
  if (files.some((file) => /account|secret|token|credential|\.ini$/i.test(file))) notes.push("check config/credential hygiene");
  return notes;
}

function portfolioRole(category, maturity, demo) {
  if (maturity === "high" && demo === "high") return "featured case study";
  if (demo === "high" || maturity === "high") return "interactive demo";
  if (maturity === "medium") return "supporting project";
  return "archive/reference";
}

const repos = repoDirs.map((dir) => {
  const name = basename(dir);
  const api = apiByName.get(name) || {};
  const files = listFiles(dir);
  const readmePath = fileExists(dir, ["README.md", "ReadMe.md", "readme.md"]);
  const stack = detectStack(dir, files);
  const readme = readmeSignals(dir, readmePath);
  const category = detectCategory(name, api, files, stack);
  const maturity = detectMaturity(files, stack, readmePath, api);
  const demoPotential = detectDemo(name, files, stack);
  const notes = riskNotes(api, files, stack, readme);
  return {
    name,
    path: dir,
    url: api.html_url || git(dir, ["config", "--get", "remote.origin.url"]),
    homepage: api.homepage || "",
    pagesUrl: api.has_pages ? `https://abhidya.github.io/${name}/` : "",
    hasPages: Boolean(api.has_pages),
    topics: api.topics || [],
    description: api.description || "",
    language: api.language || "",
    fork: Boolean(api.fork),
    archived: Boolean(api.archived),
    defaultBranch: api.default_branch || git(dir, ["branch", "--show-current"]),
    pushedAt: api.pushed_at || "",
    updatedAt: api.updated_at || "",
    stack,
    category,
    maturity,
    demoPotential,
    portfolioRole: portfolioRole(category, maturity, demoPotential),
    fileCount: files.length,
    readmePath,
    readme,
    packageManager: fileExists(dir, ["pnpm-lock.yaml", "yarn.lock", "package-lock.json", "Pipfile.lock", "requirements.txt", "pyproject.toml", "Cargo.lock"]),
    testHints: files.filter((file) => /(^|\/)(test|tests|spec)\b/i.test(file)).slice(0, 8),
    entrypoints: files
      .filter((file) => /(^|\/)(index\.html|package\.json|server\.py|app\.py|main\.py|pyproject\.toml|Dockerfile|Cargo\.toml)$/i.test(file))
      .slice(0, 12),
    riskNotes: notes,
  };
});

writeFileSync(join(outDir, "repo-inventory.json"), `${JSON.stringify(repos, null, 2)}\n`);

const tsvHeader = [
  "repo",
  "category",
  "role",
  "maturity",
  "demo",
  "stack",
  "readme",
  "risks",
  "url",
].join("\t");
const tsvRows = repos.map((repo) =>
  [
    repo.name,
    repo.category,
    repo.portfolioRole,
    repo.maturity,
    repo.demoPotential,
    repo.stack.join(","),
    repo.readme.hasReadme ? repo.readmePath : "missing",
    repo.riskNotes.join("; "),
    repo.url,
  ]
    .map((cell) => String(cell || "").replace(/\t|\n/g, " "))
    .join("\t"),
);
writeFileSync(join(outDir, "repo-health.tsv"), `${tsvHeader}\n${tsvRows.join("\n")}\n`);

const grouped = Map.groupBy(repos, (repo) => repo.category);
let markdown = "# Abhidya Public Repo Portfolio Map\n\n";
markdown += `Generated from ${repos.length} public repositories cloned under \`${root}\`.\n\n`;
markdown += "## Portfolio Story\n\n";
markdown += "- Lead with recent, runnable systems that show product thinking and end-to-end engineering.\n";
markdown += "- Use older course, scraper, notebook, and utility repos as an archive that demonstrates range without overclaiming polish.\n";
markdown += "- Convert the strongest repos into walkthrough cards with problem, approach, stack, demo path, and cleanup status.\n\n";
markdown += "## Featured Candidates\n\n";
for (const repo of repos
  .filter((repo) => repo.portfolioRole === "featured case study" || repo.portfolioRole === "interactive demo")
  .sort((a, b) => `${a.demoPotential}${a.maturity}`.localeCompare(`${b.demoPotential}${b.maturity}`))
  .slice(0, 14)) {
  markdown += `- **${repo.name}** (${repo.category}) — ${repo.portfolioRole}; stack: ${repo.stack.join(", ") || "unknown"}; risks: ${repo.riskNotes.join("; ") || "none flagged"}.\n`;
}
markdown += "\n## Categories\n\n";
for (const [category, items] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  markdown += `### ${category}\n\n`;
  for (const repo of items.sort((a, b) => a.name.localeCompare(b.name))) {
    markdown += `- **${repo.name}** — ${repo.portfolioRole}; maturity: ${repo.maturity}; demo: ${repo.demoPotential}; stack: ${repo.stack.join(", ") || "unknown"}.\n`;
  }
  markdown += "\n";
}
writeFileSync(join(outDir, "portfolio-map.md"), markdown);

const counts = repos.reduce((acc, repo) => {
  acc.total += 1;
  acc.roles[repo.portfolioRole] = (acc.roles[repo.portfolioRole] || 0) + 1;
  acc.categories[repo.category] = (acc.categories[repo.category] || 0) + 1;
  return acc;
}, { total: 0, roles: {}, categories: {} });

console.log(JSON.stringify(counts, null, 2));
