import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const INSTRUCTION =
  "Resume brevemente el contenido adjunto (o el texto, si es texto) en español. " +
  "El resumen debe tener como máximo 4-5 líneas, yendo directo a las ideas " +
  "principales, sin agregar opiniones ni información que no esté presente en " +
  "el contenido original.";

// Límite prudente para no exceder el tamaño razonable de una solicitud inline a Gemini.
const MAX_MEDIA_BYTES = 18 * 1024 * 1024;

// Resuelve qué se debe resumir a partir del mensaje respondido.
function resolveTarget(replied) {
  if (replied.text) {
    return { kind: "text", text: replied.text };
  }

  if (replied.voice) {
    return {
      kind: "media",
      fileId: replied.voice.file_id,
      mimeType: replied.voice.mime_type || "audio/ogg",
    };
  }

  if (replied.audio) {
    return {
      kind: "media",
      fileId: replied.audio.file_id,
      mimeType: replied.audio.mime_type || "audio/mpeg",
    };
  }

  if (replied.photo && replied.photo.length > 0) {
    const largest = replied.photo[replied.photo.length - 1];
    return {
      kind: "media",
      fileId: largest.file_id,
      mimeType: "image/jpeg",
    };
  }

  if (replied.video) {
    return {
      kind: "media",
      fileId: replied.video.file_id,
      mimeType: replied.video.mime_type || "video/mp4",
    };
  }

  if (replied.document) {
    return {
      kind: "media",
      fileId: replied.document.file_id,
      mimeType: replied.document.mime_type || "application/octet-stream",
    };
  }

  if (replied.caption) {
    return { kind: "text", text: replied.caption };
  }

  return null;
}

export default async function resumen(ctx) {
  const message = ctx.update.message;
  const chatId = message.chat.id;
  const msgId = message.message_id;
  const replied = message.reply_to_message;

  // debe responder a un mensaje con texto, imagen, audio, video o documento
  if (!replied) {
    ctx.reply(
      "⚠ *Atención:* Debes responder a un mensaje con texto, imagen, audio o video con `/resumen` para poder resumirlo.",
      { parse_mode: "MarkdownV2", reply_to_message_id: msgId },
    );
    return;
  }

  const target = resolveTarget(replied);

  if (!target) {
    ctx.reply(
      "⚠ *Atención:* No pude reconocer contenido resumible en ese mensaje.",
      { parse_mode: "MarkdownV2", reply_to_message_id: msgId },
    );
    return;
  }

  const loadingMsg = await ctx.reply("⏳ Generando resumen...", {
    reply_to_message_id: msgId,
  });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    let result;

    if (target.kind === "text") {
      result = await model.generateContent([
        { text: `${INSTRUCTION}\n\nTexto:\n${target.text}` },
      ]);
    } else {
      // descarga el archivo (imagen, audio, video o documento) desde Telegram
      const fileLink = await ctx.telegram.getFileLink(target.fileId);
      const fileResponse = await axios.get(fileLink.href, {
        responseType: "arraybuffer",
      });

      if (fileResponse.data.byteLength > MAX_MEDIA_BYTES) {
        try {
          await ctx.telegram.deleteMessage(chatId, loadingMsg.message_id);
        } catch (_) {}
        ctx.reply("⚠ El archivo es demasiado pesado para poder resumirlo.", {
          reply_to_message_id: replied.message_id,
        });
        return;
      }

      const base64Data = Buffer.from(fileResponse.data).toString("base64");

      result = await model.generateContent([
        { inlineData: { data: base64Data, mimeType: target.mimeType } },
        { text: INSTRUCTION },
      ]);
    }

    const text = result.response.text().trim();

    try {
      await ctx.telegram.deleteMessage(chatId, loadingMsg.message_id);
    } catch (_) {}

    if (!text) {
      ctx.reply("⚠ No se pudo generar un resumen de ese contenido.", {
        reply_to_message_id: replied.message_id,
      });
      return;
    }

    ctx.reply(`📝 Resumen:\n\n${text}`, {
      reply_to_message_id: replied.message_id,
    });
  } catch (error) {
    console.log("Error en /resumen:", error.response?.data || error.message);

    try {
      await ctx.telegram.deleteMessage(chatId, loadingMsg.message_id);
    } catch (_) {}

    ctx.reply("⚠ Error al generar el resumen.", {
      reply_to_message_id: msgId,
    });
  }
}
