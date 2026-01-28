import axios from "axios";
import fs from "fs";
import handleMessageText from "../utils/handleMessageText.js";

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
    const response = await axios.get(
      `${process.env.DOWNLOADER_API}${messageContent[0]}`,
      {
        responseType: "arraybuffer",
      },
    );

    fs.writeFileSync("src/temp/video.mp4", Buffer.from(response.data));

    // Send the video to the user
    ctx.replyWithVideo(
      { source: "src/temp/video.mp4" },
      {
        caption: `*_${ctx.update.message.from.username}_*: ${messageContent
          .slice(1)
          .join(" ")}`,
        parse_mode: "MarkdownV2",
        supports_streaming: true,
      },
    );
    await bot.telegram.deleteMessage(mainId, msgId);
  } catch (error) {
    console.log("Error downloading video: ", error);
    ctx.reply(
      `⚠ Error al descargar el video. (Error: ${error.response.statusText})`,
      {
        reply_to_message_id: msgId,
      },
    );
  }
}
