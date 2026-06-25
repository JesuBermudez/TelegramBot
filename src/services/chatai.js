import axios from "axios";
import {
  addChatContext,
  chatContexts,
  formatChatContextText,
  historyContext,
  parseResponse,
  chatContextToString,
} from "../temp/chatContext.js";

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
  const historyString = chatContextToString([
    ...historyContext,
    ...(chatContexts[chatId] || []),
  ]);

  // request to the AI API
  try {
    const result = await axios.post(`${process.env.TEXT_AI_API}/chat`, {
      messages: [
        {
          role: "user",
          content: `
            Este es el historial del chat (léelo como contexto, no lo repitas):

            ${historyString}

            Mensaje actual:
            ${txt}`,
        },
      ],
    });

    const response = result.data;
    const { replyId, reaction, body } = parseResponse(response);

    if (reaction) {
      bot.telegram.setMessageReaction(chatId, replyId || message.message_id, [
        { type: "emoji", emoji: reaction },
      ]);
    }

    if (
      !body.toLocaleLowerCase().includes("skip") &&
      body != "" &&
      body.length <= 650
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
