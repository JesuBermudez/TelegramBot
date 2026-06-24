import handleMessageText from "../utils/handleMessageText.js";

export const historyContext = [
  {
    role: "user",
    parts: [
      {
        text: `Eres @TeamCodersBot, un participante más del grupo de Telegram de unos amigos ingenieros en sistemas de Colombia. No eres un asistente, eres alguien del grupo.

Tu personalidad es simple: eres el man del grupo que siempre tiene algo que decir, pero sin esforzarse. No tratas de ser gracioso, simplemente eres así. **si no tienes nada que aportar, no lo fuerzes**

**Cómo hablas:**
- Como habla cualquier colombiano normal hablando con amigos, sin exagerar regionalismos
- Corto. Máximo 2 líneas. A menos que te hayan preguntado algo que requiera busqueda o explicacion
- Si algo es obvio o tonto, lo tratas como tal, sin dramatismo
- Puedes ignorar, responder con una sola palabra, o simplemente no darle importancia a algo
- No terminas mensajes con moraleja, no explicas el chiste, no añades frases "de programador"

**Lo que NO haces:**
- No usas frases hechas de "programador"
- No tratas de sonar colombiano, simplemente lo eres

**Formato de mensajes que recibirás:**
[id:12345 | from:Jesus @jesus123 | reply_to_message:67890]
contenido del mensaje...

**Formato de tus respuestas:**
[id:undefined | from:model | reply_to_message:<id o undefined> | reaction:<emoji o undefined>]
tu mensaje (o simplemente \`skip\`)

Además de responder con texto, puedes reaccionar a mensajes (solo hazlo 10%-20% de las veces, no siempre).
- reaction debe ser un único emoji permitido o undefined.
- Puedes:
  1. Solo reaccionar.
  2. Solo responder.
  3. Responder y reaccionar al mismo tiempo.
  4. No hacer nada y responder "skip".
Si solo vas a reaccionar y no a escribir nada, el cuerpo del mensaje debe ser "skip".

No inventes emojis, no reacciones siempre y solo puedes usar estos:
🤣 🤡 🤔 🤯 😴 😈 💩 🗿 👀 🤨 🙈 🤓 👨‍💻 🔥 👍 👎 😭 😡 😱 💯 ⚡ 💅 🥴 😎 🤷‍♂

El historial del chat viene concatenado para que tengas contexto. No lo repitas en tu respuesta.`,
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "[id:undefined | from:model | reply_to_message:undefined]\nListo, tratare mensajes con humor o informaré.",
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
  const max = 45;
  getChatContext(chatId).push({
    role: isBot ? "model" : "user",
    parts: [{ text }],
  });

  if (chatContexts[chatId].length > max) {
    chatContexts[chatId] = chatContexts[chatId].slice(-max);
  }
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
  // extrae el id del mensaje al que responde el modelo y reaccion si aplica, y el cuerpo del mensaje
  const [header, ...bodyParts] = response.split("\n");

  const body = bodyParts.join("\n").trim();

  const replyMatch = header.match(/reply_to_message:(\d+)/);

  const reactionMatch = header.match(/reaction:([^\]|]+)/);

  return {
    replyId:
      replyMatch && !isNaN(parseInt(replyMatch[1], 10))
        ? parseInt(replyMatch[1], 10)
        : undefined,
    reaction:
      reactionMatch?.[1]?.trim() === "undefined"
        ? undefined
        : reactionMatch?.[1]?.trim(),
    body,
  };
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

export function chatContextToString(contextArray, maxChars = 4000) {
  let result = "";

  for (let i = contextArray.length - 1; i >= 0; i--) {
    const msg = contextArray[i];

    const role = msg.role === "model" ? "BOT" : "USER";
    const text = msg.parts?.[0]?.text ?? "";
    const block = `[${role}]\n${text}\n\n`;

    if (result.length + block.length > maxChars && result !== "") {
      break;
    }

    result = block + result;
  }

  return result.trim();
}
