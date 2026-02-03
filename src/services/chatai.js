import axios from "axios";
import {
  addChatContext,
  chatContexts,
  formatChatContextText,
  historyContext,
  parseResponse,
  chatContextToString,
} from "../temp/chatContext.js";

export default async function chatai(ctx, txt) {
  const message = ctx.update.message;
  const chatId = message.chat.id;

  // Validations to respond with AI
  const isReplyToBot = message.reply_to_message?.from?.id === 6780284659;
  const mentionsBot = txt.includes("TeamCodersBot");
  const randomChance = Math.floor(Math.random() * 100 + 1) <= 4;
  addChatContext(chatId, formatChatContextText(txt, message));

  if (!(isReplyToBot || mentionsBot || randomChance)) return;

  // chat context history
  const historyString = chatContextToString([
    ...historyContext,
    ...(chatContexts[chatId] || []),
  ]);

  // request to the AI API
  try {
    const result = await axios.post(`${process.env.AI_API}/chat`, {
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

    if (!response.toLocaleLowerCase().includes("skip")) {
      const { replyId, body } = parseResponse(response);

      ctx.reply(body, {
        reply_to_message_id: replyId || message.message_id,
      });

      addChatContext(chatId, response, true);
    }
  } catch (err) {
    console.error("Error en ChatAI: ", err);
  }
}
