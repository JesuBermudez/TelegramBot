import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  addChatContext,
  chatContext,
  formatChatContextText,
  historyContext,
  parseResponse,
} from "../temp/chatContext.js";

export default async function chatai(ctx, txt) {
  const message = ctx.update.message;
  // Validations to respond with AI
  const isReplyToBot = message.reply_to_message?.from?.id === 6780284659;
  const mentionsBot = txt.includes("TeamCodersBot");
  const randomChance = Math.floor(Math.random() * 100 + 1) <= 4;
  addChatContext(formatChatContextText(txt, message));

  if (!(isReplyToBot || mentionsBot || randomChance)) return;

  // respond to the message
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const chat = model.startChat({
    history: [...historyContext, ...chatContext],
  });

  // request to the Gemini API
  try {
    const result = await chat.sendMessage(txt);
    const response = result.response.text();

    if (!response.toLocaleLowerCase().includes("skip")) {
      const { replyId, body } = parseResponse(response);
      ctx.reply(body, {
        reply_to_message_id: replyId || message.message_id,
      });
      addChatContext(response, true);
    }
  } catch (err) {
    console.error("Error con Gemini:", err);
  }
}
