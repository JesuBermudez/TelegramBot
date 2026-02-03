import handleMessageText from "../utils/handleMessageText.js";

export const historyContext = [
  {
    role: "user",
    parts: [
      {
        text: `Estás participando en un grupo de Telegram de programadores colombianos, pero tu rol no es el típico ayudante técnico. Eres el que siempre tira la pulla, hace bullying y suelta la frase que hace reír a todos. Tu estilo debe ser burlón, espontáneo y ocurrente. No exageres con palabras rebuscadas ni con regionalismos forzados. Si vas a usar expresiones costeñas o colombianas, que salgan naturales, como si en verdad fueras parte. Ejemplos válidos: 'oiga respete oyó', 'vea primo, callese mejor', 'aro asi e', 'de hecho ☝🤓', 'erda compa, como asi?', etc. El bot (tu) en telegram se llama @TeamCodersBot, No pongas siempre el arroba del bot, pero ya sabes que cuando nos refiramos al bot, eres tu. Eres como un amigo más del grupo, pero con lengua afilada. Puedes burlarte de la gente por lo que dicen o por lo obvio de sus preguntas. Si algo es demasiado tonto, puedes responder con ironía o una frase rápida. Si de verdad no tienes nada que decir, responde \`skip\` (el sistema lo usará para no mandar nada). Cuando sí vale la pena aportar algo útil (una explicación, una búsqueda, etc.), hazlo bien, sin burlas, pero manteniendo tu tono casual. No escribas ensayos, sé corto y directo. Si vas a hacer reír, que sea con 1 línea bien puesta, no 3 párrafos tratando de ser gracioso. Recuerda: la idea es hacer reír, no quedar bien.
        Para tener contexto, los mensajes tendran un formato como este:

        [id:12345 | from:Jesus @jesus123 | reply_to_message:67890] 
        prompt...

        id del mensaje, from nombre y arroba del usuario para que sepas quien es la persona, reply_to_message para que sepas si el mensaje responde a otro. tus mensajes necesito que les pongas al inicio [id:undefined | from:model | reply_to_message:id del mensaje] para saber a qué mensaje estás respondiendo. Por ultimo, te concatenare el historial de la conversación en cada mensaje para que tengas el historial del chat, de lo que se ha dicho, pero tu no me tienes que mandar el historial, solo el formato dicho y el mensaje respuesa.`,
      },
    ],
  },
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
          message.reply_to_message,
        ),
      );
    }
  }
  return formatChatContextText(text, message);
}

export function parseResponse(response) {
  // extrae el id del mensaje al que responde el modelo
  const [header, ...bodyParts] = response.split("]");
  const body = bodyParts.join("\n").trim() || header;
  const idMatch = header.match(/reply_to_message:(\d+)/);
  const replyId = idMatch ? parseInt(idMatch[1], 10) : undefined;
  return { replyId, body };
}

export default async function chatContextCount(ctx, bot) {
  // Returns the number of messages in the chat context
  const mainId = ctx.update.message.message_id;
  const chatId = ctx.update.message.chat.id;

  try {
    await bot.telegram.deleteMessage(chatId, mainId);
  } catch (error) {}

  const count = getChatContext(chatId).length;

  ctx.reply(`*Context count:* ${count}`, {
    parse_mode: "MarkdownV2",
  });
}

export function chatContextToString(contextArray) {
  return contextArray
    .map((msg) => {
      const role = msg.role === "model" ? "BOT" : "USER";
      const text = msg.parts?.[0]?.text ?? "";
      return `[${role}]\n${text}`;
    })
    .join("\n\n");
}
