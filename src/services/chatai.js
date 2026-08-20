import { GoogleGenAI } from "@google/genai";
import {
  addChatContext,
  chatContexts,
  formatChatContextText,
  historyContext,
  parseResponse,
  chatContextToString,
} from "../temp/chatContext.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function chatai(ctx, bot, txt) {
  const message = ctx.update.message;
  const chatId = message.chat.id;

  // Validations to respond with AI
  const isReplyToBot = message.reply_to_message?.from?.id === 6780284659;
  const mentionsBot = txt.includes("TeamCodersBot");
  const randomChance = Math.floor(Math.random() * 100 + 1) <= 10; // 10% chance to respond randomly
  addChatContext(chatId, formatChatContextText(txt, message));

  if (!(isReplyToBot || mentionsBot || randomChance)) return;

  // chat context history
  const history = [
    ...historyContext,
    ...(chatContexts[chatId] || []),
    { role: "user", parts: [{ text: txt }] },
  ];

  // request to the AI API
  try {
    const result = await genAI.models.generateContent({
      model: "gemini-3.6-flash",
      store: false,
      contents: history,
    });

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
