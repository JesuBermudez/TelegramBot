import getFile from "../utils/getFile.js";

export default async function toPdf(ctx) {
  const message = ctx.update.message;
  const chatId = message.chat.id;
  const msgId = message.message_id;

  const fileInfo = await getFile(ctx);

  if (!fileInfo) {
    ctx.reply("⚠ No se encontro archivo a convertir.", {
      reply_to_message_id: msgId,
    });
    return;
  }

  const { data, fileName } = fileInfo;
  const pdfBuffer = Buffer.from(data);

  ctx.replyWithDocument(
    { source: pdfBuffer, filename: fileName },
    {
      chat_id: chatId,
      caption: fileName,
    }
  );
}
