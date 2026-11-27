import { GoogleGenAI } from "@google/genai";
import {
  addChatContext,
  chatContexts,
  formatChatContextText,
  historyContext,
  parseResponse,
  chatContextToString,
} from "../utils/chatContext.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function chatai(ctx, bot, txt) {
  const message = ctx.update.message;
  const chatId = message.chat.id;

  // Validations to respond with AI
  const isReplyToBot = message.reply_to_message?.from?.id === 6780284659;
  const mentionsBot = txt.includes("TeamCodersBot");
  const randomChance = Math.floor(Math.random() * 100 + 1) <= 8; // 8% chance to respond randomly
  await addChatContext(chatId, formatChatContextText(txt, message));

  if (!(isReplyToBot || mentionsBot || randomChance)) return;

  // chat context history
  const history = [
    ...historyContext,
    ...(chatContexts[chatId] || []),
    { role: "user", parts: [{ text: txt }] },
  ];

  const primaryModel =
    process.env.GEMINI_2_5_FLASH_LITE || "gemini-2.5-flash-lite";
  const fallbackModel =
    process.env.GEMINI_3_5_FLASH_LITE || "gemini-3.5-flash-lite";

  // request to the AI API
  try {
    let result;
    try {
      result = await genAI.models.generateContent({
        model: primaryModel,
        store: false,
        contents: history,
      });
    } catch (primaryError) {
      console.log(
        `Error con ${primaryModel} en ChatAI, intentando con ${fallbackModel}:`,
        primaryError.response?.data || primaryError.message,
      );
      result = await genAI.models.generateContent({
        model: fallbackModel,
        store: false,
        contents: history,
      });
    }

    const response = result.text.trim();
    const { replyId, reaction, body } = parseResponse(response);

    if (reaction) {
      bot.telegram.setMessageReaction(chatId, replyId || message.message_id, [
        { type: "emoji", emoji: reaction },
      ]);
    }

    if (
      !body.toLocaleLowerCase().includes("skip") &&
      body != "" &&
      body.length <= 350
    ) {
      ctx.reply(body, {
        reply_to_message_id: replyId,
      });

      addChatContext(chatId, response, true);
    }
  } catch (err) {
    console.log(
      "Error en ChatAI: ",
      err.response?.data || err.message || "Internal error",
    );
  }
}
