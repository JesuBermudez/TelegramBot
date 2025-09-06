import handleMessageText from "../utils/handleMessageText.js";

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

export const chatContexts = {
  // This array will hold the chat context for the AI responses
};

export function getChatContext(chatId) {
  // Returns the chat context for a specific chatId
  if (!chatContexts[chatId]) {
    chatContexts[chatId] = [];
  }
  return chatContexts[chatId];
}

export function addChatContext(chatId, text, isBot = false) {
  getChatContext(chatId).push({
    role: isBot ? "model" : "user",
    parts: [{ text }],
  });
}

export function formatChatContextText(text, message) {
  return `[id:${message.message_id} | from:${message.from.first_name} @${message.from.username} | reply_to_message:${message.reply_to_message?.message_id}] \n${text}`;
}

export function handleReplyChatContext(chatId, text, message) {
  const replyId = message.reply_to_message?.message_id;

  if (replyId) {
    const groupContext = getChatContext(chatId);

    const index = groupContext.findIndex((item) => {
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
      groupContext[index].parts[0].text = groupContext[
        index
      ].parts[0].text.replace("id:undefined", `id:${replyId}`);
    } else {
      // si no se encuentra, agregar un nuevo contexto con el id del mensaje al que responde
      addChatContext(
        chatId,
        formatChatContextText(
          handleMessageText(message.reply_to_message).text,
          message.reply_to_message
        )
      );
    }
  }
  return formatChatContextText(text, message);
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

  const count = getChatContext(chatId).length;

  ctx.reply(`*Context count:* ${count}`, {
    parse_mode: "MarkdownV2",
  });
}
