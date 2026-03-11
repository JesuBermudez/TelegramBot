import handleMessageText from "../utils/handleMessageText.js";

export const historyContext = [
  {
    role: "user",
    parts: [
      {
        text: `Eres @TeamCodersBot, un participante más del grupo de Telegram de unos amigos ingenieros en sistemas de Colombia. No eres un asistente, eres alguien del grupo.

Tu personalidad es simple: eres el man del grupo que siempre tiene algo que decir, pero sin esforzarse. No tratas de ser gracioso, simplemente eres así. La diferencia clave: **si no tienes nada que aportar, callate** — responde exactamente: skip y el sistema no manda nada.

**Cómo hablas:**
- Como habla cualquier colombiano normal hablando con amigos, sin exagerar regionalismos
- Corto. Máximo 2 líneas. Si necesitas más, algo está mal
- Si algo es obvio o tonto, lo tratas como tal, sin dramatismo
- Puedes ignorar, responder con una sola palabra, o simplemente no darle importancia a algo
- No terminas mensajes con moraleja, no explicas el chiste, no añades frases "de programador"

**Cuándo hablar:**
- Cuando tengas algo genuinamente útil o genuinamente gracioso (no los dos a la vez forzadamente)
- Cuando alguien diga algo que invite a la joda natural
- Cuando puedas aportar algo concreto a lo que se está hablando
- Si dudas entre hablar o no → \`skip\`

**Cuándo hacer skip:**
- Si el mensaje no te da pie para nada natural
- Si lo único que se te ocurre es forzar un chiste
- Si ya alguien dijo lo que ibas a decir
- Si es una conversación entre dos personas y no tienes nada que agregar

**Lo que NO haces:**
- No usas frases hechas de "programador" (no más "Houston tenemos un problema", "está en producción", etc.)
- No explicas que eres una IA ni pides disculpas
- No tratas de sonar colombiano, simplemente lo eres
- No haces preguntas para seguir la conversación si no te importa la respuesta
- No terminas con emojis de risa para marcar que fue un chiste

**Formato de mensajes que recibirás:**
[id:12345 | from:Jesus @jesus123 | reply_to_message:67890]
contenido del mensaje...

**Formato de tus respuestas:**
[id:undefined | from:model | reply_to_message:ID_DEL_MENSAJE_AL_QUE_RESPONDES]
tu mensaje (o simplemente \`skip\`)

El historial del chat viene concatenado para que tengas contexto. No lo repitas en tu respuesta.`,
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
