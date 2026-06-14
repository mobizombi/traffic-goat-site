#!/usr/bin/env node
"use strict";

require("dotenv").config();
const { Telegraf } = require("telegraf");
const Anthropic = require("@anthropic-ai/sdk");
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is required");
if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required");

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OPS_DIR = path.join(PROJECT_ROOT, "ops");
const DAILY_DIR = path.join(OPS_DIR, "daily");
const NODE_BIN = process.execPath;
const OPS_SCRIPT = path.join(PROJECT_ROOT, "scripts", "traffic-goat-ops.js");

const conversations = {};
const MAX_HISTORY = 40;

const TOOLS = [
  {
    name: "run_ops_today",
    description:
      "Generate today's daily traction packet and advance the content/outreach queue. " +
      "Use this when the user wants to start the day, get today's content, or run the daily ops.",
    input_schema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "preview_ops",
    description:
      "Preview today's daily traction packet without advancing the queue. " +
      "Use this when the user wants to see what today's packet would look like without committing.",
    input_schema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "get_project_status",
    description:
      "Get the current state of the Traffic Goat ops system: last run date, queue positions, " +
      "posted items, content queue size, and outreach queue size.",
    input_schema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "add_prospect",
    description:
      "Add a new prospect to the prospect tracker CSV. " +
      "At minimum requires the company name; other fields are optional.",
    input_schema: {
      type: "object",
      properties: {
        company: { type: "string", description: "Company name (required)" },
        website: { type: "string", description: "Company website URL" },
        contact: { type: "string", description: "Contact person name" },
        role: { type: "string", description: "Contact's role/title" },
        source: { type: "string", description: "How you found this prospect (e.g. LinkedIn, Product Hunt)" },
        observed_leak: { type: "string", description: "Revenue leak you observed at this company" },
        next_step: { type: "string", description: "Next action to take (default: Personalize and send audit offer)" },
        notes: { type: "string", description: "Any additional notes" }
      },
      required: ["company"]
    }
  },
  {
    name: "list_daily_packets",
    description:
      "List all generated daily traction packets (both committed and preview packets). " +
      "Returns dates and filenames.",
    input_schema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "read_packet",
    description:
      "Read the contents of a specific daily traction packet by date. " +
      "Use list_daily_packets first to see available dates. " +
      "For today's preview use the date with 'preview' set to true.",
    input_schema: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format (e.g. 2026-06-14)"
        },
        preview: {
          type: "boolean",
          description: "If true, read the PREVIEW packet for that date instead of the committed one"
        }
      },
      required: ["date"]
    }
  }
];

function runOpsScript(args) {
  return execFileSync(NODE_BIN, [OPS_SCRIPT, ...args], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    timeout: 30000
  });
}

function getLatestPacket(prefix) {
  if (!fs.existsSync(DAILY_DIR)) return null;
  const files = fs.readdirSync(DAILY_DIR).filter((f) => f.startsWith(prefix) && f.endsWith(".md"));
  if (!files.length) return null;
  files.sort();
  return path.join(DAILY_DIR, files[files.length - 1]);
}

function executeTool(name, input) {
  switch (name) {
    case "run_ops_today": {
      const output = runOpsScript(["today"]);
      const packetPath = getLatestPacket(new Date().toISOString().slice(0, 10));
      const packetContent = packetPath ? fs.readFileSync(packetPath, "utf8") : "";
      return { success: true, script_output: output.trim(), packet: packetContent };
    }

    case "preview_ops": {
      const output = runOpsScript(["preview"]);
      const today = new Date().toISOString().slice(0, 10);
      const previewPath = path.join(DAILY_DIR, `PREVIEW-${today}.md`);
      const packetContent = fs.existsSync(previewPath) ? fs.readFileSync(previewPath, "utf8") : "";
      return { success: true, script_output: output.trim(), packet: packetContent };
    }

    case "get_project_status": {
      const statePath = path.join(OPS_DIR, "state.json");
      const contentPath = path.join(OPS_DIR, "content-queue.json");
      const outreachPath = path.join(OPS_DIR, "outreach-queue.json");

      const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
      const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
      const outreach = JSON.parse(fs.readFileSync(outreachPath, "utf8"));

      const dailyFiles = fs.existsSync(DAILY_DIR) ? fs.readdirSync(DAILY_DIR).filter((f) => f.endsWith(".md")) : [];

      return {
        last_generated_date: state.last_generated_date,
        last_content_index: state.last_content_index,
        last_outreach_index: state.last_outreach_index,
        next_content: content[(state.last_content_index + 1) % content.length]?.title ?? "none",
        next_outreach: outreach[(state.last_outreach_index + 1) % outreach.length]?.segment ?? "none",
        posted_count: state.posted?.length ?? 0,
        posted_items: state.posted ?? [],
        content_queue_size: content.length,
        outreach_queue_size: outreach.length,
        daily_packets_generated: dailyFiles.length
      };
    }

    case "add_prospect": {
      const { company, website = "", contact = "", role = "", source = "", observed_leak = "", next_step = "", notes = "" } = input;
      const args = ["add-prospect", company, website, contact, role, source, observed_leak, next_step, notes];
      const output = runOpsScript(args);
      return { success: true, output: output.trim() };
    }

    case "list_daily_packets": {
      if (!fs.existsSync(DAILY_DIR)) return { packets: [] };
      const files = fs.readdirSync(DAILY_DIR)
        .filter((f) => f.endsWith(".md"))
        .sort()
        .map((f) => ({
          filename: f,
          date: f.replace(/^PREVIEW-/, "").replace(/\.md$/, ""),
          is_preview: f.startsWith("PREVIEW-")
        }));
      return { packets: files };
    }

    case "read_packet": {
      const { date, preview = false } = input;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { error: "Invalid date format. Use YYYY-MM-DD." };
      }
      const filename = preview ? `PREVIEW-${date}.md` : `${date}.md`;
      const filePath = path.join(DAILY_DIR, filename);
      // Prevent path traversal: ensure resolved path stays within DAILY_DIR
      const resolved = path.resolve(filePath);
      if (!resolved.startsWith(DAILY_DIR + path.sep) && resolved !== DAILY_DIR) {
        return { error: "Invalid path." };
      }
      if (!fs.existsSync(resolved)) {
        return { error: `Packet not found: ${filename}` };
      }
      return { filename, content: fs.readFileSync(resolved, "utf8") };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function chatWithClaude(userId, userMessage) {
  if (!conversations[userId]) conversations[userId] = [];

  conversations[userId].push({ role: "user", content: userMessage });

  if (conversations[userId].length > MAX_HISTORY) {
    conversations[userId] = conversations[userId].slice(-MAX_HISTORY);
  }

  let response = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system:
      "You are a helpful assistant for Traffic Goat, an AI-powered revenue growth consultancy. " +
      "You help the operator manage daily content publishing, outreach campaigns, and prospect tracking via Telegram. " +
      "Use the available tools to perform operations when asked. " +
      "Be concise and practical. Format responses for mobile viewing — prefer short paragraphs and bullet points over long prose. " +
      "When reporting tool results, summarize the key information rather than dumping raw JSON.",
    tools: TOOLS,
    messages: conversations[userId]
  });

  while (response.stop_reason === "tool_use") {
    const assistantMessage = { role: "assistant", content: response.content };
    conversations[userId].push(assistantMessage);

    const toolResults = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      let result;
      try {
        result = executeTool(block.name, block.input);
      } catch (err) {
        result = { error: err.message };
      }
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result)
      });
    }

    conversations[userId].push({ role: "user", content: toolResults });

    if (conversations[userId].length > MAX_HISTORY) {
      conversations[userId] = conversations[userId].slice(-MAX_HISTORY);
    }

    response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system:
        "You are a helpful assistant for Traffic Goat, an AI-powered revenue growth consultancy. " +
        "You help the operator manage daily content publishing, outreach campaigns, and prospect tracking via Telegram. " +
        "Use the available tools to perform operations when asked. " +
        "Be concise and practical. Format responses for mobile viewing — prefer short paragraphs and bullet points over long prose. " +
        "When reporting tool results, summarize the key information rather than dumping raw JSON.",
      tools: TOOLS,
      messages: conversations[userId]
    });
  }

  const textBlocks = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  conversations[userId].push({ role: "assistant", content: response.content });

  if (conversations[userId].length > MAX_HISTORY) {
    conversations[userId] = conversations[userId].slice(-MAX_HISTORY);
  }

  return textBlocks || "(no response)";
}

async function sendLong(ctx, text) {
  const LIMIT = 4000;
  if (text.length <= LIMIT) {
    await ctx.reply(text);
    return;
  }
  const lines = text.split("\n");
  let chunk = "";
  for (const line of lines) {
    if (chunk.length + line.length + 1 > LIMIT) {
      await ctx.reply(chunk);
      chunk = "";
    }
    chunk += (chunk ? "\n" : "") + line;
  }
  if (chunk) await ctx.reply(chunk);
}

bot.start((ctx) => {
  ctx.reply(
    "Traffic Goat Bot ready.\n\n" +
    "Commands:\n" +
    "/today — generate today's traction packet\n" +
    "/preview — preview today's packet\n" +
    "/status — show ops status\n" +
    "/clear — reset conversation history\n" +
    "/help — show this help\n\n" +
    "Or just chat with me about your Traffic Goat ops."
  );
});

bot.help((ctx) => {
  ctx.reply(
    "Commands:\n" +
    "/today — generate today's traction packet and advance queue\n" +
    "/preview — preview today's packet without advancing queue\n" +
    "/status — show ops status (last run, next content, next outreach)\n" +
    "/clear — reset conversation history\n\n" +
    "You can also chat naturally — ask me to add a prospect, read a packet, check what's queued, etc."
  );
});

bot.command("today", async (ctx) => {
  await ctx.sendChatAction("typing");
  try {
    const reply = await chatWithClaude(ctx.from.id, "Run today's ops and give me the key content to publish.");
    await sendLong(ctx, reply);
  } catch (err) {
    await ctx.reply(`Error: ${err.message}`);
  }
});

bot.command("preview", async (ctx) => {
  await ctx.sendChatAction("typing");
  try {
    const reply = await chatWithClaude(ctx.from.id, "Preview today's packet without advancing the queue.");
    await sendLong(ctx, reply);
  } catch (err) {
    await ctx.reply(`Error: ${err.message}`);
  }
});

bot.command("status", async (ctx) => {
  await ctx.sendChatAction("typing");
  try {
    const reply = await chatWithClaude(ctx.from.id, "Show me the current project status.");
    await sendLong(ctx, reply);
  } catch (err) {
    await ctx.reply(`Error: ${err.message}`);
  }
});

bot.command("clear", (ctx) => {
  delete conversations[ctx.from.id];
  ctx.reply("Conversation history cleared.");
});

bot.on("text", async (ctx) => {
  await ctx.sendChatAction("typing");
  try {
    const reply = await chatWithClaude(ctx.from.id, ctx.message.text);
    await sendLong(ctx, reply);
  } catch (err) {
    await ctx.reply(`Error: ${err.message}`);
  }
});

bot.launch({ dropPendingUpdates: true });
console.log("Traffic Goat Telegram bot started.");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
