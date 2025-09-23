import "dotenv/config";
import { Telegraf } from "telegraf";
import { start, help } from "./commands/primary.js";
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

const bot = new Telegraf(process.env.token);

// todo: functions
bot.start((ctx) => start(ctx));
bot.help((ctx) => help(ctx, bot));

// todo: response commands
bot.command("all", (ctx) => all(ctx, bot));
bot.command("add", (ctx) => add(ctx));
bot.command("alias", (ctx) => alias(ctx));
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

bot.on("message", (ctx) => createdCommands(ctx, bot));

bot.launch({
  webhook: {
    domain: process.env.DOMAIN,
    port: process.env.PORT,
  },
});
