import ytdl from "ytdl-core";
import fs from "fs";

export default async function downloader(ctx) {
  const videoUrl = ctx.payload.trim(" ");
  const replyId = ctx.update.message.message_id;

  if (!ytdl.validateURL(videoUrl)) {
    ctx.reply("⚠ Enlace no valido.", {
      reply_to_message_id: replyId,
    });
    return;
  }

  const info = await ytdl.getInfo(videoUrl);

  if (info.length_seconds > 600) {
    ctx.reply("⚠ El video dura mas de 10m.", {
      reply_to_message_id: replyId,
    });
    return;
  }

  try {
    // Descarga el video
    const videoStream = ytdl(videoUrl);

    const fileName = `src/temp/video.mp4`;

    // Guarda el video en una ubicación temporal
    const writeStream = fs.createWriteStream(fileName);
    videoStream.pipe(writeStream);

    // Espera a que se complete la descarga
    writeStream.on("finish", () => {
      // Envía el video al chat
      ctx.replyWithVideo({ source: fileName }, { supports_streaming: true });
    });
  } catch (error) {
    ctx.reply("⚠ Error al descargar el video.", {
      reply_to_message_id: replyId,
    });
  }
}
