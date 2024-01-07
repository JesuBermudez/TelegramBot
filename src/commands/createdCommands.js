export default function createdCommands(ctx, commandList) {
    // if there is no message text
    if (!ctx.update.message.text) return
    
    // message object
    const message = ctx.update.message
    // only the command (string)
    const cmd = message.text.trim().split(" ")[0]
    const chatId = message.chat.id

    // message has a command
    if (cmd.startsWith('/') && cmd.length > 1 && !commandList.reserved.includes(cmd)) {
        // there is no commands
        if (!commandList.checkChatId(chatId)) return

        // search the command
        const command = commandList.findCommand(chatId, cmd.substring(1));

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