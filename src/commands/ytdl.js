import axios from "axios";
import fs from "fs";

export default async function downloader(ctx, bot) {
  const videoUrl = ctx.payload.trim(" ").split(" ")[0];
  const mainId = ctx.update.message.chat.id;
  const msgId = ctx.update.message.message_id;

  if (!videoUrl.length > 22) {
    ctx.reply("⚠ Enlace no valido.", {
      reply_to_message_id: msgId,
    });
    return;
  }

  try {
    // Descarga el video
    const response = await axios.get(
      `${process.env.DOWNLOADER_API}${videoUrl}`,
      {
        responseType: "arraybuffer",
      }
    );

    fs.writeFileSync("src/download/video.mp4", Buffer.from(response.data));

    // Envía el video al chat
    ctx.replyWithVideo(
      { source: "src/download/video.mp4" },
      { supports_streaming: true }
    );
    await bot.telegram.deleteMessage(mainId, msgId);
  } catch (error) {
    console.log(error);
    ctx.reply("⚠ Error al descargar el video.", {
      reply_to_message_id: msgId,
    });
  }
}
