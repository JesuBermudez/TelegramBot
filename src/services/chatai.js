import { GoogleGenerativeAI } from "@google/generative-ai";
import handleMessageText from "../utils/handleMessageText.js";
import {
  addChatContext,
  chatContext,
  historyContext,
  removeChatContext,
} from "../temp/chatContext.js";

export default async function chatai(ctx, txt) {
  const message = ctx.update.message;
  // Validations to respond with AI
  const isReplyToBot = message.reply_to_message?.from?.id === 6780284659;
  const mentionsBot = txt.includes("TeamCodersBot");
  const randomChance = Math.floor(Math.random() * 100 + 1) <= 4;
  addChatContext(txt);

  if (!(isReplyToBot || mentionsBot || randomChance)) return;

  // if the message is a reply to other message
  if (message.reply_to_message) {
    const { text, isBot } = handleMessageText(message.reply_to_message);
    if (text) {
      removeChatContext(text);
      addChatContext(text, isBot);
    }
  }

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
      ctx.reply(response, {
        reply_to_message_id: message.message_id,
      });
      addChatContext(response, true);
    }
  } catch (err) {
    console.error("Error con Gemini:", err);
  }
}
