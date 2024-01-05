export default function createdCommands(ctx, commandList) {
    const message = ctx.update.message
    const cmd = message.text.trim().split(" ")[0]

    // message has a command
    if (cmd.startsWith('/') &&
        cmd.length > 1 &&
        cmd != "/start" &&
        cmd != "/help" &&
        cmd != "/all") {

        // search the command
        const command = commandList.findCommand(cmd.substring(1));

        // if found
        if (command && command.command) {
            // checking if is replying to another message
            if (message.hasOwnProperty("reply_to_message")) {
                ctx.reply(command.command, {parse_mode: 'MarkdownV2', reply_to_message_id: message.reply_to_message.message_id})
            } else {
                ctx.reply(command.command, {parse_mode: 'MarkdownV2'})
            }
        }
    }
}