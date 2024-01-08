export function start(ctx) {
    ctx.reply("Klk mmgv, que hay pa hace?")
}

export function help(ctx) {
    ctx.reply("Este es el bot de *TeamCoder's*💻 🚀\n\nEste se encarga de la _administración_ asi como de responder a los _mensajes_ y a _comandos_\\.", {parse_mode: 'MarkdownV2'})
}

export function all(ctx) {
    ctx.reply("@kendricita, @Midudevx, @Https_Dev03, @El_Bermudez, @ManuelLegro, @Kespinal, @perralta, @Wilcar03", { reply_to_message_id: ctx.update.message.message_id })
}