import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function chatai(ctx) {
  const message = ctx.update.message;
  const pass = false;

  // validations to respond with AI
  if (
    message.reply_to_message &&
    message.reply_to_message.from.id === 6780284659
  ) {
    pass = true;
  }

  if (message.text.includes("TeamCodersBot")) {
    pass = true;
  }

  if (Math.floor(Math.random() * 100 + 1) <= 4) {
    pass = true;
  }

  if (pass === false) return;

  // has to respond to the message
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

  // request to the Gemini API
  try {
    const result = await chat.sendMessage(message.text);
    const response = result.response.text();

    if (response.includes("Skip")) return;

    ctx.reply(response, {
      reply_to_message_id: ctx.update.message.message_id,
    });
  } catch (err) {
    console.error("Error con Gemini:", err);
  }
}
