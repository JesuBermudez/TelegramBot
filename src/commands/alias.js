export default function alias(ctx, comandList) {
  // message object
  const message = ctx.update.message;
  // array of text (where should be the command)
  const cmd = message.text.trim().split(" ");
  const chatId = message.chat.id;

  if (cmd.length < 2) {
    // message hasn't a command name
    ctx.reply(
      "*Atención:* Por favor introduce el nombre del comando despues de /alias\nPor ejemplo: `/alias command`\n\n*\\(No te olvides de responder al mensaje que quieres que se mande al ejecutar el comando creado\\)*",
      { parse_mode: "MarkdownV2", reply_to_message_id: message.message_id }
    );
    return
  }

  if (!message.hasOwnProperty("reply_to_message")) {
    // message isn't replying to another message
    ctx.reply(
      "*Atención:* Por favor, no te olvides de responder al mensaje que quieres que se mande al ejecutar el comando creado",
      { parse_mode: "MarkdownV2", reply_to_message_id: message.message_id }
    );
    return
  }

  // does the chat already have a command prompt?
  if (!comandList.checkChatId(chatId)) {
    comandList.addChat(chatId)
  }

  // Verify that the command doesn't exist
  if (comandList.findCommand(chatId, cmd[1]) != "command doesn't exist") {
    ctx.reply("⚠️ *El comando esta reservado, intenta con otro nombre\\.*", {
      parse_mode: "MarkdownV2", reply_to_message_id: message.message_id
    });
  } else {
    // add the command
    const add = comandList.addCommand(
        chatId,
      `${cmd[1]}`,
      `${message.reply_to_message.text}`,
      `${cmd[2]}`
    );

    if (add == "added") {
      ctx.reply("✨ *El comando ha sido creado\\!*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: message.message_id,
      });
    }
  }
}
