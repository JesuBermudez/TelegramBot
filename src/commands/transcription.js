import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { escapeMarkdownV2 } from "../utils/escapeMarkdownV2.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function transcription(ctx) {
  const message = ctx.update.message;
  const chatId = message.chat.id;
  const msgId = message.message_id;
  const replied = message.reply_to_message;

  // debe responder a un mensaje, y ese mensaje debe ser audio o nota de voz
  if (!replied || !(replied.voice || replied.audio)) {
    ctx.reply(
      escapeMarkdownV2(
        "⚠ *Atención:* Este comando solo funciona respondiendo a un audio o nota de voz.",
        true,
      ),
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

  const primaryModel =
    process.env.GEMINI_3_6_FLASH || "gemini-3.6-flash";
  const fallbackModel =
    process.env.GEMINI_3_5_FLASH_LITE || "gemini-3.5-flash-liteh";

  try {
    // descarga el archivo de audio desde Telegram
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const fileResponse = await axios.get(fileLink.href, {
      responseType: "arraybuffer",
    });
    const base64Audio = Buffer.from(fileResponse.data).toString("base64");

    const contents = [
      {
        inlineData: {
          data: base64Audio,
          mimeType,
        },
      },
      {
        text: "Transcribe el audio completo de forma literal, en el idioma original. No agregues comentarios, resúmenes ni notas adicionales, solo el texto transcrito.",
      },
    ];

    let result;
    try {
      result = await genAI.models.generateContent({
        model: primaryModel,
        contents,
      });
    } catch (primaryError) {
      console.log(
        `Error con ${primaryModel} en /tran, intentando con ${fallbackModel}:`,
        primaryError.response?.data || primaryError.message,
      );
      result = await genAI.models.generateContent({
        model: fallbackModel,
        contents,
      });
    }

    const text = result.text.trim();

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
