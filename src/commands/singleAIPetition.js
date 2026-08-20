import { GoogleGenAI } from "@google/genai";
import handleMessageText from "../utils/handleMessageText.js";

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

const INSTRUCTION =
  "Responde la siguiente pregunta o instrucción en español, de forma breve y " +
  "directa (máximo 4-6 líneas), sin rodeos ni texto de relleno. Si la " +
  "pregunta requiere pasos, usa una lista corta:\n\n";

export default async function singleIAPetition(ctx) {
  const message = ctx.update.message;
  const msgId = message.message_id;
  const { text } = handleMessageText(message);
  const prompt = text.trim();

  if (!prompt) {
    ctx.reply(
      "⚠ *Atención:* Debes escribir una pregunta. Ejemplo: `/ask Qué cocino hoy?`",
      { parse_mode: "MarkdownV2", reply_to_message_id: msgId },
    );
    return;
  }

  if (prompt.length > 1000) {
    ctx.reply("⚠ La pregunta es demasiado larga (máximo 1000 caracteres).", {
      reply_to_message_id: msgId,
    });
    return;
  }

  const loadingMsg = await ctx.reply("🤖 Pensando...", {
    reply_to_message_id: msgId,
  });

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        { role: "user", parts: [{ text: `${INSTRUCTION}${prompt}` }] },
      ],
    });

    const answer = result.text.trim();

    try {
      await ctx.telegram.deleteMessage(message.chat.id, loadingMsg.message_id);
    } catch (_) {}

    if (!answer) {
      ctx.reply("⚠ La IA no devolvió ninguna respuesta.", {
        reply_to_message_id: msgId,
      });
      return;
    }

    ctx.reply(`🤖 ${answer}`, {
      reply_to_message_id: msgId,
    });
  } catch (error) {
    console.log("Error en /ia:", error.response?.data || error.message);

    try {
      await ctx.telegram.deleteMessage(message.chat.id, loadingMsg.message_id);
    } catch (_) {}

    ctx.reply("⚠ Error al consultar la IA.", {
      reply_to_message_id: msgId,
    });
  }
}
