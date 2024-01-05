import { Telegraf } from "telegraf";
import CommandList from "./models/commandList.js";
import { start, help, all } from "./commands/primary.js";
import alias from "./commands/alias.js";
import createdCommands from "./commands/createdCommands.js";

const bot = new Telegraf('6780284659:AAHwr5iSfILopOiPTL5rHFWq5wTxdFnHcbU');

const comandList = new CommandList();


bot.start((ctx) => start(ctx))

bot.help((ctx) => help(ctx))

bot.command('all', (ctx) => all(ctx))

bot.command('alias', (ctx) => alias(ctx, comandList))

bot.on('message', (ctx) => createdCommands(ctx, comandList))


bot.launch();