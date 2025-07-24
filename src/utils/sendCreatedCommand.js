export default function sendCreatedCommand(bot, ctx, command) {
  const chatId = ctx.update.message.chat.id; // chat id from the message

  switch (command.type) {
    case "sticker":
      bot.telegram.sendSticker(chatId, command.command, {
        reply_to_message_id: ctx.update.message.reply_to_message?.message_id,
      });
      break;

    case "photo":
      bot.telegram.sendPhoto(chatId, command.command, {
        reply_to_message_id: ctx.update.message.reply_to_message?.message_id,
      });
      break;
    case "text":
      ctx.reply(command.command, {
        reply_to_message_id: ctx.update.message.reply_to_message?.message_id,
      });
      break;

    case "video":
      bot.telegram.sendVideo(chatId, command.command, {
        reply_to_message_id: ctx.update.message.reply_to_message?.message_id,
      });
      break;

    case "voice":
      bot.telegram.sendVoice(chatId, command.command, {
        reply_to_message_id: ctx.update.message.reply_to_message?.message_id,
      });
      break;

    case "audio":
      bot.telegram.sendAudio(chatId, command.command, {
        reply_to_message_id: ctx.update.message.reply_to_message?.message_id,
      });
      break;

    case "document":
      bot.telegram.sendDocument(chatId, command.command, {
        reply_to_message_id: ctx.update.message.reply_to_message?.message_id,
      });
      break;

    default:
      ctx.reply("⚠️ Tipo de comando no soportado.");
  }
}
