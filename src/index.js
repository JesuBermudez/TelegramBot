import { Telegraf } from "telegraf";
import "dotenv/config";
import { start, help, all } from "./commands/primary.js";
import alias from "./commands/alias.js";
import remove from "./commands/remove.js";
import purge from "./commands/purge.js";
import laughter from "./commands/laughter.js";
import createdCommands from "./commands/createdCommands.js";
import translator from "./commands/translate.js";

const bot = new Telegraf(process.env.token);

// todo: functions
bot.start((ctx) => start(ctx));
bot.help((ctx) => help(ctx));

// todo: response commands
bot.command("all", (ctx) => all(ctx));
bot.command("alias", (ctx) => alias(ctx));
bot.command("remove", (ctx) => remove(ctx, bot));
bot.command("purge", (ctx) => purge(ctx, bot));
bot.command("risa", (ctx) => laughter(ctx, bot));
bot.command("tr", (ctx) => translator(ctx));

bot.on("message", (ctx) => createdCommands(ctx, bot));

bot.launch({
  /*webhook: {
        domain: process.env.DOMAIN,
        port: process.env.PORT
    }*/
});
