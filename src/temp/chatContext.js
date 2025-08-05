export const historyContext = [
  { role: "user", parts: [{ text: process.env.CHAT_CONTEXT }] },
  {
    role: "model",
    parts: [
      {
        text: "Listo, entendido.",
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

export function removeChatContext(text) {
  const index = chatContext.findIndex((item) => item.parts[0].text === text);
  if (index !== -1) {
    chatContext.splice(index, 1);
  }
}

export default function chatContextCount(ctx) {
  // Returns the number of messages in the chat context
  ctx.reply(`*Context count:* ${chatContext.length}`, {
    reply_to_message_id: ctx.update.message.message_id,
    markdown: "MarkdownV2",
  });
}
