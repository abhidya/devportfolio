import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "../..");
const inventory = JSON.parse(readFileSync(join(root, "_portfolio-rehab/repo-inventory.json"), "utf8"));
const generatedAt = new Date().toISOString().slice(0, 10);

const caseStudyNames = [
  "CustomCard",
  "CarryOkie",
  "WorldPrize",
  "Karachi-Coup",
  "Wazir",
  "RobloxAIDev",
  "WallDisplay",
  "nano-dlna",
];

const curated = {
  CustomCard: {
    title: "AI greeting-card production system",
    outcome: "Turns customer intent into printable card concepts with a modern React/Vite workflow and production-minded demo data.",
    why: "Shows product thinking, AI workflow design, and frontend execution in one inspectable app.",
    path: ["Start with seeded demo data", "Inspect the card workflow", "Review print-production constraints"],
    tags: ["AI product", "React", "Vite", "Docker"],
  },
  CarryOkie: {
    title: "Serverless karaoke room",
    outcome: "A static-first karaoke room with QR pairing, phones as remotes, WebRTC/P2P coordination, and cast-oriented playback.",
    why: "Demonstrates real-time UX, multi-device orchestration, and deployable static architecture.",
    path: ["Open the room", "Pair a phone or second tab", "Walk through queue and playback control"],
    tags: ["P2P", "WebRTC", "Static app", "Media"],
  },
  WorldPrize: {
    title: "World ID protected instant-win demo",
    outcome: "A polished web monorepo for a protected promotion/free-entry style product demo.",
    why: "Strong systems narrative: identity gate, product flow, docs, and deployment-ready web structure.",
    path: ["Open the live demo", "Review the eligibility flow", "Read the architecture notes"],
    tags: ["Product demo", "Identity", "Monorepo"],
  },
  "Karachi-Coup": {
    title: "Culturally themed multiplayer browser game",
    outcome: "A Vite/React TypeScript game with rules, flow, and a static-friendly demo surface.",
    why: "Shows how playful ideas become maintainable browser game systems.",
    path: ["Play the browser demo", "Inspect game rules", "Compare with Wazir as a sibling design"],
    tags: ["Game", "React", "TypeScript", "Vite"],
  },
  Wazir: {
    title: "Peer-assisted social deduction game",
    outcome: "A modern Vite/React game with live demo intent and multiplayer/social interaction framing.",
    why: "Good example of shipping compact, playable, culturally specific web experiences.",
    path: ["Open the demo", "Start a local round", "Review multiplayer/readiness notes"],
    tags: ["Game", "P2P", "React", "Vite"],
  },
  RobloxAIDev: {
    title: "AI-assisted Roblox creation pipeline",
    outcome: "A tooling-heavy repo for asset-driven Roblox generation, headless assembly, and validation workflows.",
    why: "Shows advanced automation around creative tools, not just app CRUD.",
    path: ["Read the pipeline overview", "Inspect Rojo/project files", "Review validation scripts"],
    tags: ["Roblox", "AI tooling", "Automation"],
  },
  WallDisplay: {
    title: "Local media control plane",
    outcome: "A multi-surface media stack combining Python services, Docker, web UI, and mobile/control surfaces.",
    why: "Shows full-stack hardware-adjacent engineering and real-world media-control constraints.",
    path: ["Review the README", "Inspect service entrypoints", "Compare with nano-dlna"],
    tags: ["FastAPI", "Docker", "Media", "Mobile"],
  },
  "nano-dlna": {
    title: "Tiny DLNA/media server lab",
    outcome: "A Python/Docker media-service project with dashboard/tooling potential and sustained activity.",
    why: "Good backend/devtool story for packaging, local networking, and media workflow automation.",
    path: ["Run the service locally", "Inspect Docker setup", "Review dashboard/demo affordances"],
    tags: ["Python", "Docker", "DLNA", "Backend"],
  },
};

const tour = [
  {
    id: "systems",
    title: "Inspect systems",
    copy: "Product-shaped repos with architecture, deployment, and maintainability signals.",
    repos: ["CustomCard", "WorldPrize", "WallDisplay", "nano-dlna"],
  },
  {
    id: "play",
    title: "Play demos",
    copy: "Static-safe and browser-first projects visitors can try without credentials.",
    repos: ["CarryOkie", "Karachi-Coup", "Wazir", "Chameleon", "serabunni"],
  },
  {
    id: "game-tools",
    title: "Explore game tooling",
    copy: "Roblox, Unity, and asset-driven workflows where automation meets creative tools.",
    repos: ["RobloxAIDev", "GroanTubeHero", "eggBreakers", "ChickenCoop"],
  },
  {
    id: "data",
    title: "Trace the data/ML origin",
    copy: "Older research, notebooks, classifiers, and data-cleaning work framed as the learning arc.",
    repos: ["ML-for-Software-Engineering", "microbiology_malaria", "Koth-character-identifier", "Movies_ETL"],
  },
  {
    id: "automation",
    title: "Review practical automations",
    copy: "Small utilities, scrapers, and scripts best presented with careful setup and safety notes.",
    repos: ["Safeway-Coupon-Auto-Clipper", "UTK_Prints", "Jochen2Canvas", "aws-python-lambdas"],
  },
];

function demoUrl(repo) {
  return repo.homepage || repo.pagesUrl || "";
}

function demoKind(repo) {
  if (["CarryOkie", "Karachi-Coup", "Wazir", "QR-Tag"].includes(repo.name)) return "multi-device";
  if (repo.stack.includes("roblox") || repo.stack.includes("unity") || ["WallDisplay", "nano-dlna"].includes(repo.name)) return "hardware-gated";
  if (/coupon|scraper|automater|bot|canvas/i.test(repo.name)) return "script-install";
  if (demoUrl(repo)) return "live-hosted";
  if (repo.stack.includes("vite") || repo.stack.includes("react") || repo.stack.includes("static-web")) return "static-safe";
  return "narrated";
}

function friendlyDescription(repo) {
  if (curated[repo.name]) return curated[repo.name].outcome;
  if (repo.description) return repo.description;
  const stack = repo.stack.length ? repo.stack.join(", ") : "source";
  return `${repo.category} repo with ${repo.portfolioRole} portfolio posture and ${stack} evidence.`;
}

const repos = inventory.map((repo) => ({
  name: repo.name,
  title: curated[repo.name]?.title || repo.name.replaceAll("-", " ").replaceAll("_", " "),
  description: friendlyDescription(repo),
  category: repo.category,
  role: repo.portfolioRole,
  maturity: repo.maturity,
  demoPotential: repo.demoPotential,
  demoKind: demoKind(repo),
  demoUrl: demoUrl(repo),
  githubUrl: repo.url,
  language: repo.language || "",
  stack: repo.stack,
  tags: curated[repo.name]?.tags || [...new Set([repo.category, repo.portfolioRole, ...repo.stack])].slice(0, 5),
  updatedAt: repo.updatedAt,
  pushedAt: repo.pushedAt,
  riskNotes: repo.riskNotes,
  readmePath: repo.readmePath,
  featured: caseStudyNames.includes(repo.name),
}));

const byName = new Map(repos.map((repo) => [repo.name, repo]));

const caseStudies = caseStudyNames
  .map((name) => {
    const repo = byName.get(name);
    if (!repo) return null;
    return {
      ...repo,
      outcome: curated[name].outcome,
      why: curated[name].why,
      walkthrough: curated[name].path,
    };
  })
  .filter(Boolean);

const categories = [...new Set(repos.map((repo) => repo.category))].sort();
const liveDemoCount = repos.filter((repo) => repo.demoUrl || ["static-safe", "multi-device"].includes(repo.demoKind)).length;
const data = {
  generatedAt,
  owner: {
    name: "Manny Bhidya",
    github: "https://github.com/abhidya",
    linkedin: "https://www.linkedin.com/in/abhidya/",
    headline: "Developer portfolio across systems, games, data, automation, and AI-assisted tooling",
  },
  stats: {
    repoCount: repos.length,
    liveDemoCount,
    featuredCount: caseStudies.length,
    categoryCount: categories.length,
  },
  categories,
  filters: ["All", "Live Demo", "Featured", "Games", "AI / ML", "Automation", "Web", "Backend", "Archive"],
  tour,
  caseStudies,
  repos,
};

writeFileSync(join(root, "devportfolio/data/portfolio-data.json"), `${JSON.stringify(data, null, 2)}\n`);
console.log(JSON.stringify(data.stats, null, 2));
