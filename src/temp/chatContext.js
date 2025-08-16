export const historyContext = [
  { role: "user", parts: [{ text: process.env.CHAT_CONTEXT }] },
  {
    role: "model",
    parts: [
      {
        text: "[id:undefined | from:model | reply_to_message:undefined]\nListo, tratare mensajes con humor o informare.",
      },
    ],
  },
];

export const chatContext = [
  // This array will hold the chat context for the AI responses
];

export function addChatContext(text, isBot = false) {
  chatContext.push({
    role: isBot ? "model" : "user",
    parts: [{ text }],
  });
}

export function formatChatContextText(text, message) {
  const replyId = message.reply_to_message?.message_id;

  if (replyId) {
    const index = chatContext.findIndex((item) => {
      const header = item.parts[0].text.split("\n")[0]; // primera línea
      return (
        // es mensaje del modelo, tiene el .text del mensaje al que responde y el header contiene "id:undefined"
        item.role === "model" &&
        item.parts[0].text.includes(message.reply_to_message.text) &&
        header.includes("id:undefined")
      );
    });
    if (index !== -1) {
      // reemplazar el id en el header por el id del message al que responde
      chatContext[index].parts[0].text = chatContext[
        index
      ].parts[0].text.replace("id:undefined", `id:${replyId}`);
    }
  }
  return `[id:${message.message_id} | from:${message.from.first_name} @${message.from.username} | reply_to_message:${replyId}] \n${text}`;
}

export function parseResponse(response) {
  // extrae el id del mensaje al que responde el modelo
  const [header, ...bodyParts] = response.split("\n");
  const body = bodyParts.join("\n").trim() || header;
  const idMatch = header.match(/reply_to_message:(\d+)/);
  const replyId = idMatch ? parseInt(idMatch[1], 10) : undefined;
  return { replyId, body };
}

export default async function chatContextCount(ctx, bot) {
  // Returns the number of messages in the chat context
  const mainId = ctx.update.message.message_id;
  const chatId = ctx.update.message.chat.id;

  await bot.telegram.deleteMessage(chatId, mainId);

  ctx.reply(`*Context count:* ${chatContext.length}`, {
    parse_mode: "MarkdownV2",
  });
}
