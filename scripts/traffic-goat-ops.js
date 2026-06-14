#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const opsDir = path.join(root, "ops");
const dailyDir = path.join(opsDir, "daily");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(opsDir, file), "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(opsDir, file), `${JSON.stringify(value, null, 2)}\n`);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nextIndex(current, length) {
  if (!length) return -1;
  return (current + 1) % length;
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function generateDailyPacket({ advance }) {
  const date = todayIso();
  const content = readJson("content-queue.json");
  const outreach = readJson("outreach-queue.json");
  const state = readJson("state.json");

  const contentIndex = nextIndex(state.last_content_index, content.length);
  const outreachIndex = nextIndex(state.last_outreach_index, outreach.length);
  const contentItem = content[contentIndex];
  const outreachItem = outreach[outreachIndex];

  if (!contentItem) throw new Error("No content items configured.");
  if (!outreachItem) throw new Error("No outreach campaigns configured.");

  fs.mkdirSync(dailyDir, { recursive: true });
  const packetPath = path.join(dailyDir, advance ? `${date}.md` : `PREVIEW-${date}.md`);

  const packet = `# Traffic Goat Daily Traction Packet - ${date}

## Status
- Day 1 launch posts: live.
- Day 2 revenue leaks article/post: live.
- Today's content: ${contentItem.title}
- Today's outreach segment: ${outreachItem.segment}

## Publish Queue

### LinkedIn
${contentItem.linkedin}

### Facebook
${contentItem.facebook}

## Outreach Queue

Segment: ${outreachItem.segment}

Target count today: 5 prospects.

Source queries:
${outreachItem.source_queries.map((q) => `- ${q}`).join("\n")}

First message:
${outreachItem.first_message}

Day 3 follow-up:
${outreachItem.follow_up_day_3}

Day 7 follow-up:
${outreachItem.follow_up_day_7}

## Commenting Targets
Find 5 LinkedIn posts from founders, growth leads, affiliate managers, or SaaS operators.

Comment pattern:
1. Add one specific operator-level insight.
2. Do not pitch unless the post asks for help.
3. Keep it useful and short.

Example comment:
The hidden issue is usually not partner recruitment. It is partner activation. If a partner signs up and does not know the first campaign, first audience, and first asset to use, the program quietly stalls.

## Daily Checklist
- [ ] Publish LinkedIn post from Traffic Goat.
- [ ] Publish Facebook post from Traffic Goat.
- [ ] Add 5 prospects to prospect-tracker.csv.
- [ ] Send 3-5 personalized audit offers.
- [ ] Comment on 5 relevant LinkedIn posts.
- [ ] Record results in WEEKLY_TRACTION_SCORECARD.md.
`;

  fs.writeFileSync(packetPath, packet);

  if (advance) {
    state.last_generated_date = date;
    state.last_content_index = contentIndex;
    state.last_outreach_index = outreachIndex;
    writeJson("state.json", state);
  }

  return { packetPath, contentItem, outreachItem };
}

function addProspect(args) {
  const [
    company,
    website = "",
    contact = "",
    role = "",
    source = "",
    observedLeak = "",
    nextStep = "Personalize and send audit offer",
    notes = ""
  ] = args;

  if (!company) {
    throw new Error("Usage: node scripts/traffic-goat-ops.js add-prospect Company [website] [contact] [role] [source] [observedLeak] [nextStep] [notes]");
  }

  const tracker = path.join(root, "prospect-tracker.csv");
  const row = [
    company,
    website,
    contact,
    role,
    source,
    observedLeak,
    "",
    "Not contacted",
    "No",
    "No",
    "No",
    nextStep,
    notes
  ].map(csvEscape).join(",");

  fs.appendFileSync(tracker, `${row}\n`);
  return tracker;
}

function printUsage() {
  console.log(`Traffic Goat ops

Commands:
  today              Generate today's packet and advance the queue
  preview            Generate today's packet without advancing the queue
  add-prospect ...   Append a prospect to prospect-tracker.csv
`);
}

const command = process.argv[2] || "today";

try {
  if (command === "today" || command === "preview") {
    const result = generateDailyPacket({ advance: command === "today" });
    console.log(`Daily packet: ${path.relative(root, result.packetPath)}`);
    console.log(`Content: ${result.contentItem.title}`);
    console.log(`Outreach: ${result.outreachItem.segment}`);
  } else if (command === "add-prospect") {
    const tracker = addProspect(process.argv.slice(3));
    console.log(`Prospect added to ${path.relative(root, tracker)}`);
  } else {
    printUsage();
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
