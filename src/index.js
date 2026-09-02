import "dotenv/config";
import { Telegraf } from "telegraf";
import { start, help, commandsList } from "./commands/primary.js";
import { all, add } from "./commands/mention.js";
import alias from "./commands/alias.js";
import remove from "./commands/remove.js";
import purge from "./commands/purge.js";
import laughter from "./commands/laughter.js";
import createdCommands from "./commands/createdCommands.js";
import translator from "./commands/translate.js";
import weather from "./commands/weather.js";
import { foreignExchange } from "./commands/exchangeRate.js";
import downloader from "./commands/ytdl.js";
import toPdf from "./commands/toPdf.js";
import chatContextCount from "./temp/chatContext.js";
import { fetchUrlAsString } from "./commands/fetchUrl.js";
import transcription from "./commands/transcription.js";
import resume from "./commands/resume.js";
import singleAIPetition from "./commands/singleAIPetition.js";

const log = (tag, msg) => console.error(`[${new Date().toISOString()}] [${tag}] ${msg}`);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => start(ctx));
bot.help((ctx) => help(ctx, bot));

bot.command("all", (ctx) => all(ctx, bot));
bot.command("add", (ctx) => add(ctx));
bot.command("alias", (ctx) => alias(ctx));
bot.command("commands", (ctx) => commandsList(ctx, bot));
bot.command("remove", (ctx) => remove(ctx, bot));
bot.command("purge", (ctx) => purge(ctx, bot));
bot.command("risa", (ctx) => laughter(ctx, bot));
bot.command("tr", (ctx) => translator(ctx));
bot.command("clima", (ctx) => weather(ctx));
bot.command("coin", (ctx) => foreignExchange(ctx));
bot.command("get", (ctx) => downloader(ctx, bot));
bot.command("pdf", (ctx) => toPdf(ctx, bot));
bot.command("ctx", (ctx) => chatContextCount(ctx, bot));
bot.command("fetch", (ctx) => fetchUrlAsString(ctx));
bot.command("tran", (ctx) => transcription(ctx));
bot.command("resume", (ctx) => resume(ctx));
bot.command("ask", (ctx) => singleAIPetition(ctx));

bot.on("message", (ctx) => createdCommands(ctx, bot));

// Un error en un handler NUNCA debe matar el proceso
bot.catch((err, ctx) => {
  const desc = ctx?.updateType ?? "update";
  log("handler", `Error en ${desc}: ${err.message ?? err}`);
});

// Promesas rechazadas / excepciones no capturadas: log, no morir
process.on("unhandledRejection", (reason) => {
  log("process", `UnhandledRejection: ${reason?.message ?? reason}`);
});
process.on("uncaughtException", (err) => {
  log("process", `UncaughtException: ${err.message}`);
});

// ─── Launch con backoff ────────────────────────────────────────────────────
const LAUNCH_MAX_DELAY = 5 * 60_000;
const LAUNCH_BASE_DELAY = 5_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let stopping = false;

async function launchWithRetry() {
  for (let attempt = 0; !stopping; attempt++) {
    try {
      await bot.launch();
      log("launch", "Polling terminó inesperadamente (bot.launch() resolvió)");
    } catch (err) {
      if (stopping) break;
      log("launch", `Error en launch: ${err.code ?? err.message}`);
    }
    if (stopping) break;
    const delay = Math.min(LAUNCH_BASE_DELAY * 2 ** attempt, LAUNCH_MAX_DELAY);
    log("launch", `Reintentando launch en ${Math.round(delay / 1000)}s...`);
    await sleep(delay);
  }
  log("launch", "Loop de launch terminado");
}

// Graceful shutdown
process.once("SIGINT", () => { stopping = true; bot.stop("SIGINT"); });
process.once("SIGTERM", () => { stopping = true; bot.stop("SIGTERM"); });

launchWithRetry();
