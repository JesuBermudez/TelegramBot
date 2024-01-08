export default function createdCommands(ctx, bot, commandList) {
  // if there is no message text
  if (!ctx.update.message.text) return;

  // message object
  const message = ctx.update.message;
  // only the command (string)
  const cmd = message.text.trim().split(" ")[0];
  const chatId = message.chat.id;

  // message has a command
  if (
    cmd.startsWith("/") &&
    cmd.length > 1 &&
    !commandList.reserved.includes(cmd)
  ) {
    // there is no commands
    if (!commandList.checkChatId(chatId)) return;

    // search the command
    const command = commandList.findCommand(chatId, cmd.substring(1));

    // if found
    if (command != "command doesn't exist") {
      switch (command.type) {
        case "text":
          textCommand(ctx, command, message.hasOwnProperty("reply_to_message"));
          break;
        case "sticker":
          stickerCommand(
            ctx,
            bot,
            chatId,
            command,
            message.hasOwnProperty("reply_to_message")
          );
          break;

        default:
          textCommand(ctx, command, message.hasOwnProperty("reply_to_message"));
          break;
      }
    }
  }
}

function textCommand(ctx, command, reply = false) {
  // checking if is replying to another message
  if (reply) {
    ctx.reply(command.command, {
      parse_mode: "MarkdownV2",
      reply_to_message_id: ctx.update.message.reply_to_message.message_id,
    });
  } else {
    ctx.reply(command.command, { parse_mode: "MarkdownV2" });
  }
}

function stickerCommand(ctx, bot, chatId, command, reply = false) {
  // checking if is replying to another message
  if (reply) {
    bot.telegram.sendSticker(chatId, command.command, {
      reply_to_message_id: ctx.update.message.reply_to_message.message_id,
    });
  } else {
    bot.telegram.sendSticker(chatId, command.command);
  }
}
