import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function tran(ctx) {
  const message = ctx.update.message;
  const chatId = message.chat.id;
  const msgId = message.message_id;
  const replied = message.reply_to_message;

  // debe responder a un mensaje, y ese mensaje debe ser audio o nota de voz
  if (!replied || !(replied.voice || replied.audio)) {
    ctx.reply(
      "⚠ *Atención:* Este comando solo funciona respondiendo a un audio o nota de voz.",
      { parse_mode: "MarkdownV2", reply_to_message_id: msgId },
    );
    return;
  }

  const fileId = replied.voice?.file_id || replied.audio?.file_id;
  const mimeType =
    replied.voice?.mime_type || replied.audio?.mime_type || "audio/ogg";

  const loadingMsg = await ctx.reply("⏳ Transcribiendo audio...", {
    reply_to_message_id: msgId,
  });

  try {
    // descarga el archivo de audio desde Telegram
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const fileResponse = await axios.get(fileLink.href, {
      responseType: "arraybuffer",
    });
    const base64Audio = Buffer.from(fileResponse.data).toString("base64");

    // envia el audio a Gemini para transcribirlo
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Audio,
          mimeType,
        },
      },
      {
        text: "Transcribe el audio completo de forma literal, en el idioma original. No agregues comentarios, resúmenes ni notas adicionales, solo el texto transcrito.",
      },
    ]);

    const text = result.response.text().trim();

    try {
      await ctx.telegram.deleteMessage(chatId, loadingMsg.message_id);
    } catch (_) {}

    if (!text) {
      ctx.reply("⚠ No se pudo obtener texto del audio.", {
        reply_to_message_id: replied.message_id,
      });
      return;
    }

    ctx.reply(`📝 Transcripción:\n\n${text}`, {
      reply_to_message_id: replied.message_id,
    });
  } catch (error) {
    console.log(
      "Error en /transcription:",
      error.response?.data || error.message,
    );

    try {
      await ctx.telegram.deleteMessage(chatId, loadingMsg.message_id);
    } catch (_) {}

    ctx.reply("⚠ Error al transcribir el audio.", {
      reply_to_message_id: msgId,
    });
  }
}