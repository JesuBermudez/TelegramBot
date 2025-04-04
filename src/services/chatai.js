import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function chatai(ctx) {
  const message = ctx.update.message.text;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: process.env.CHAT_CONTEXT }] },
      {
        role: "model",
        parts: [
          {
            text: "Entendido, responderé de forma casual y con humor costeño.",
          },
        ],
      },
    ],
  });

  try {
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    if (response.includes("Skip")) return;

    ctx.reply(response, {
      reply_to_message_id: ctx.update.message.message_id,
    });
  } catch (err) {
    console.error("Error con Gemini:", err);
  }
}
