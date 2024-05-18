import ytdl from "ytdl-core";
import path from "path";
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

    // Genera un nombre de archivo único
    const timestamp = Date.now();

    const currentFilePath = new URL(import.meta.url).pathname;
    const currentDirectory = path.dirname(currentFilePath);
    const fileName = path
      .join(currentDirectory, "..", "temp", `video_${timestamp}.mp4`)
      .replace("\\", "");

    // Guarda el video en una ubicación temporal
    const writeStream = fs.createWriteStream(fileName);
    videoStream.pipe(writeStream);

    // Espera a que se complete la descarga
    writeStream.on("finish", () => {
      // Envía el video al chat
      ctx
        .replyWithVideo({ source: fileName }, { supports_streaming: true })
        .then(() => {
          // Borra el archivo localmente
          fs.unlink(fileName, (err) => {
            if (err) console.log("Error al borrar el archivo:", err);
          });
        });
    });
  } catch (error) {
    ctx.reply("⚠ Error al descargar el video.", {
      reply_to_message_id: replyId,
    });
  }
}
