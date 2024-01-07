export default function remove(ctx, bot, commandList) {
  const messageId = ctx.update.message.message_id;
  const chatId = ctx.update.message.chat.id;
  // array of text (where should be the command)
  const cmd = ctx.update.message.text.trim().split(" ");

  // verify that the member is an admin
  bot.telegram
    .getChatMember(chatId, ctx.update.message.from.id)
    .then((chatMember) => {
      // if is not
      if (chatMember.status != "administrator") {
        ctx.reply("⚠ Solo *Administradores*", {
          parse_mode: "MarkdownV2",
          reply_to_message_id: messageId,
        });
        return;
      }

      if (cmd.length < 2) {
        // message hasn't a command name
        ctx.reply(
          "*Atención:* Por favor introduce el nombre del comando despues de /remove\nPor ejemplo: `/remove command`",
          { parse_mode: "MarkdownV2", reply_to_message_id: messageId }
        );
        return;
      }

      // does the chat already have a command prompt?
      if (!commandList.checkChatId(chatId)) {
        ctx.reply("*Atención:* No hay comandos aún, trata creando alguno.", {
          parse_mode: "MarkdownV2",
          reply_to_message_id: messageId,
        });
        return;
      }

      // try to remove it
      const rm = commandList.removeCommand(chatId, cmd[1]);

      if (rm == "removed") {
        ctx.reply("✨ *El comando ha sido eliminado\\!*", {
          parse_mode: "MarkdownV2",
          reply_to_message_id: messageId,
        });
      } else {
        ctx.reply("*Atención:* Comando no existe.", {
          parse_mode: "MarkdownV2",
          reply_to_message_id: messageId,
        });
      }
    });
}
