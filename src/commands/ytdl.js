import fs from "fs";
import handleMessageText from "../utils/handleMessageText.js";
import { fetchWithRetry } from "../utils/fetchWithRetray.js";
import { escapeMarkdownV2 } from "../utils/escapeMarkdownV2.js";

export default async function downloader(ctx, bot) {
  const { text } = handleMessageText(ctx.update.message); // command string and text
  const messageContent = text.trim(" ").split(" ");
  const chatId = ctx.update.message.chat.id;
  const msgId = ctx.update.message.message_id;

  if (!(messageContent[0].length > 22)) {
    try {
      bot.telegram.setMessageReaction(chatId, msgId, [
        { type: "emoji", emoji: "😡" },
      ]);
    } catch (error) {}
    return;
  }

  const loadingMsg = await ctx.reply("⏳ Espere...");

  setImmediate(async () => {
    try {
      // Make the request to the downloader API
      await bot.telegram.editMessageText(
        chatId,
        loadingMsg.message_id,
        null,
        "⏳ Descargando...",
      );

      // Download the video using the downloader API
      const response = await fetchWithRetry(
        `${process.env.DOWNLOADER_API}/api/v1/download?postUrl=${messageContent[0]}`,
      );

      await bot.telegram.editMessageText(
        chatId,
        loadingMsg.message_id,
        null,
        "⚙ Procesando...",
      );

      fs.writeFileSync("src/temp/video.mp4", Buffer.from(response.data));

      // Send the video to the user
      await bot.telegram.editMessageText(
        chatId,
        loadingMsg.message_id,
        null,
        "📤 Enviando...",
      );

      await ctx.replyWithVideo(
        { source: "src/temp/video.mp4" },
        {
          caption: `*${escapeMarkdownV2(ctx.update.message.from.username)}*: ${escapeMarkdownV2(
            messageContent.slice(1).join(" "),
          )}`,
          parse_mode: "MarkdownV2",
          supports_streaming: true,
        },
      );

      try {
        await bot.telegram.deleteMessage(chatId, msgId);
      } catch (deleteError) {}
    } catch (error) {
      let errorMsg = "⚠ Error al descargar el video.";

      if (error.code === "ECONNABORTED") {
        errorMsg =
          "⏳ El servidor tardó demasiado en responder. Intenta nuevamente.";
      } else if (error.response) {
        if (error.response.description) {
          errorMsg += `\nTelegram: ${error.response.error_code} ${error.response.description}`;
        } else {
          errorMsg += `\nServidor: ${error.response.status} ${error.response.statusText}`;
        }
      }

      try {
        await ctx.reply(errorMsg, {
          reply_to_message_id: msgId,
        });
      } catch (replyError) {}
    }

    await bot.telegram.deleteMessage(chatId, loadingMsg.message_id);
  });
}
