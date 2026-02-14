import fs from "fs";
import handleMessageText from "../utils/handleMessageText.js";
import { fetchWithRetry } from "../utils/fetchWithRetray.js";
import { escapeMarkdownV2 } from "../utils/escapeMarkdownV2.js";

export default async function downloader(ctx, bot) {
  const { text } = handleMessageText(ctx.update.message); // command string and text
  const messageContent = text.trim(" ").split(" ");
  const mainId = ctx.update.message.chat.id;
  const msgId = ctx.update.message.message_id;

  if (!(messageContent[0].length > 22)) {
    ctx.reply("⚠ Enlace no valido.", {
      reply_to_message_id: msgId,
    });
    return;
  }

  try {
    // Download the video using the downloader API
    const response = await fetchWithRetry(
      `${process.env.DOWNLOADER_API}${messageContent[0]}`,
    );

    fs.writeFileSync("src/temp/video.mp4", Buffer.from(response.data));

    // Send the video to the user
    await ctx.replyWithVideo(
      { source: "src/temp/video.mp4" },
      {
        caption: `*_${escapeMarkdownV2(ctx.update.message.from.username)}_*: ${escapeMarkdownV2(
          messageContent.slice(1).join(" "),
        )}`,
        parse_mode: "MarkdownV2",
        supports_streaming: true,
      },
    );

    try {
      await bot.telegram.deleteMessage(mainId, msgId);
    } catch (deleteError) {}
  } catch (error) {
    // console.log(error);
    let errorMsg = "⚠ Error al descargar el video.";

    if (error.code === "ECONNABORTED") {
      errorMsg =
        "⏳ El servidor tardó demasiado en responder. Intenta nuevamente.";
    } else if (error.response) {
      errorMsg += `\nServidor: ${error.response}`;
    }

    try {
      await ctx.reply(errorMsg, {
        reply_to_message_id: msgId,
      });
    } catch (replyError) {}
  }
}
