export default async function purge(ctx, bot) {
  const lastId = ctx.update.message.message_id; // main message id
  const chatId = ctx.update.message.chat.id;

  // verify that the member is an admin
  const chatMember = await bot.telegram.getChatMember(
    chatId,
    ctx.update.message.from.id
  );

  // if is not
  if (!["administrator", "creator"].includes(chatMember.status)) {
    ctx.reply("⚠ Solo *Administradores*", {
      parse_mode: "MarkdownV2",
      reply_to_message_id: lastId,
    });
    return;
  }
  // verify that the bot is admin
  const botMember = await bot.telegram.getChatMember(chatId, ctx.botInfo.id);

  // if is not
  if (botMember.status != "administrator") {
    ctx.reply("⚠ Aun no soy *Administrador*", {
      parse_mode: "MarkdownV2",
      reply_to_message_id: lastId,
    });
    return;
  }

  // if isn't replying to another message
  if (!ctx.update.message.hasOwnProperty("reply_to_message")) {
    ctx.reply("⚠ *Responde a algun mensaje*", {
      parse_mode: "MarkdownV2",
      reply_to_message_id: lastId,
    });
    return;
  }

  // the first message (to which a response was received)
  const firstId = ctx.update.message.reply_to_message.message_id;

  // delete the main message
  try {
    bot.telegram.deleteMessage(chatId, lastId);
  } catch (error) {}

  // delete by id
  deleteMessages(bot, chatId, firstId, lastId);
}

async function deleteMessages(bot, chatId, firstId, lastId) {
  for (let i = firstId; i < lastId; i++) {
    if (i - firstId > 50) {
      break;
    }
    try {
      await bot.telegram.deleteMessage(chatId, i);
    } catch (e) {}
  }
}
