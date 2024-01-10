export default function alias(ctx, commandList) {
  // message object
  const message = ctx.update.message;
  // text after the command
  const payload = ctx.payload.trim().split(" ");
  const chatId = message.chat.id;


  if (payload[0].length < 1) {
    // message hasn't a command name
    ctx.reply(
      "*Atención:* Por favor introduce el nombre del comando despues de /alias\nPor ejemplo: `/alias command`\n\n*\\(No te olvides de responder al mensaje que quieres que se mande al ejecutar el comando creado\\)*",
      { parse_mode: "MarkdownV2", reply_to_message_id: message.message_id }
    );
    return;
  }

  if (!message.hasOwnProperty("reply_to_message")) {
    // message isn't replying to another message
    ctx.reply(
      "*Atención:* Por favor, no te olvides de responder al mensaje que quieres que se mande al ejecutar el comando creado",
      { parse_mode: "MarkdownV2", reply_to_message_id: message.message_id }
    );
    return;
  }

  // does the chat already have a command prompt?
  if (!commandList.checkChatId(chatId)) {
    commandList.addChat(chatId);
  }

  // Verify that the command doesn't exist
  if (commandList.findCommand(chatId, payload[0]) != "command doesn't exist") {
    ctx.reply("⚠️ *El comando esta reservado, intenta con otro nombre\\.*", {
      parse_mode: "MarkdownV2",
      reply_to_message_id: message.message_id,
    });
    return;
  }

  // add the command
  if (message.reply_to_message.hasOwnProperty("text")) {
    // type text
    textCommand(
      ctx,
      commandList,
      chatId,
      payload[0],
      message.reply_to_message.text,
      payload.slice(1).join(" ")
    );
  } else if (message.reply_to_message.hasOwnProperty("sticker")) {
    // type stiker
    stickerCommand(
      ctx,
      commandList,
      chatId,
      payload[0],
      message.reply_to_message.sticker.file_id,
      payload.slice(1).join(" ")
    )
  }
}

function textCommand(ctx, commandList, chatId, name, command, description) {
  commandList.addCommand(chatId, "text", name, command, description);

  ctx.reply("✨ *El comando ha sido creado\\!*", {
    parse_mode: "MarkdownV2",
    reply_to_message_id: ctx.update.message.message_id,
  });
}

function stickerCommand(ctx, commandList, chatId, name, stikerId, description) {
  commandList.addCommand(chatId, "sticker", name, stikerId, description);

  ctx.reply("✨ *El comando ha sido creado\\!*", {
    parse_mode: "MarkdownV2",
    reply_to_message_id: ctx.update.message.message_id,
  });
}
