import { Telegraf } from "telegraf";
import 'dotenv/config';
import CommandList from "./models/commandList.js";
import { start, help, all } from "./commands/primary.js";
import alias from "./commands/alias.js";
import remove from "./commands/remove.js";
import purge from "./commands/purge.js";
import laughter from "./commands/laughter.js";
import createdCommands from "./commands/createdCommands.js";

const bot = new Telegraf(process.env.token);
const comandList = new CommandList();

// todo: functions
bot.start((ctx) => start(ctx))
bot.help((ctx) => help(ctx, comandList))

// todo: response commands
bot.command('all', (ctx) => all(ctx))
bot.command('alias', (ctx) => alias(ctx, comandList))
bot.command('remove', (ctx) => remove(ctx, bot, comandList))
bot.command('purge', (ctx) => purge(ctx, bot))
bot.command('risa', (ctx) => laughter(ctx, bot))

bot.on('message', (ctx) => createdCommands(ctx, bot, comandList))


bot.launch({
    /*webhook: {
        domain: process.env.DOMAIN,
        port: process.env.PORT
    }*/
});