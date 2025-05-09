import { GoogleGenerativeAI } from "@google/generative-ai";
import handleMessageText from "../utils/handleMessageText.js";

export default async function chatai(ctx, txt) {
  const message = ctx.update.message;
  const contextMessage = [];
  // Validations to respond with AI
  const isReplyToBot = message.reply_to_message?.from?.id === 6780284659;
  const mentionsBot = txt.includes("TeamCodersBot");
  const randomChance = Math.floor(Math.random() * 100 + 1) <= 4;

  if (!(isReplyToBot || mentionsBot || randomChance)) return;

  // if the message is a reply to other message
  if (message.reply_to_message) {
    const { text, isBot } = handleMessageText(message.reply_to_message);
    if (text) {
      contextMessage.push({
        role: isBot ? "model" : "user",
        parts: [{ text }],
      });
    }
  }

  // respond to the message
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: process.env.CHAT_CONTEXT }] },
      {
        role: "model",
        parts: [
          {
            text: "Listo, yo respondo relajado como si fuera uno más del grupo.",
          },
        ],
      },
      ...contextMessage,
    ],
  });

  // request to the Gemini API
  try {
    const result = await chat.sendMessage(txt);
    const response = result.response.text();

    console.log(response);

    if (response.toLocaleLowerCase().includes("skip")) return;

    ctx.reply(response, {
      reply_to_message_id: ctx.update.message.message_id,
    });
  } catch (err) {
    console.error("Error con Gemini:", err);
  }
}
