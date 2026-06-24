import axios from "axios";
import { escapeMarkdownV2 } from "../utils/escapeMarkdownV2.js";
import { sendLongMessage } from "../utils/sendLongMessages.js";

export function start(ctx) {
  ctx.reply(
    "Este es el bot de *TeamCoder's*💻 🚀\n\n" +
      "Este se encarga de la _administración_ asi como de responder a los _mensajes_ y a _comandos_\\.\n\n",
    { parse_mode: "MarkdownV2" },
  );
}

export function help(ctx, bot) {
  const memberId = ctx.update.message.from.id;

  const helpMessage =
    "🚀 *Comandos* del bot:\n\n" +
    "   *1*. */help*   - Muestra la lista de comandos.\n\n" +
    "   *2*. */all*      - Menciona a todos los integrantes.\n\n" +
    "   *3*. */add*      - Añade al usuario al comando `/all`.\n\n" +
    "   *4*. */commands*   - Muestra la lista de comandos creados en ese chat.\n\n" +
    "   *5*. */purge*  - Borra mensajes. (Administradores)\n" +
    "__Uso__: - Responder al mensaje desde donde se quiera empezar a borrar\n    - Usar el comando en la respuesta del mensaje\n\n" +
    "   *6*. */alias*   - Crea comandos.\n" +
    "__Uso__: - Responder al Mensaje o Stiker que se quiere guardar\n    - Responder con: `/alias nombre descripción` (nombre sin espacios)\n\n" +
    "   *7*. */remove* - Elimina un comando.\n" +
    "__Uso__: `/remove nombre`\n\n" +
    "   *8*. */clima* - Dice el clima actual.\n" +
    "__Uso__: `/clima ciudad`\n\n" +
    "   *9*. */risa*   - Envia un mensaje junto con risas.\n" +
    "__Uso__: - `/risa numero_de_letras mensaje_extra` (respondiendo o no a un mensaje)\n\n" +
    "   *10*. */tr*   - Traduce oraciones.\n" +
    "__Uso__: - `/tr oracion`\n    - Responder con: `/tr` a un mensaje\n\n" +
    "   *11*. */coin*  - Conversor de divisas.\n" +
    "__Uso__: - `/coin | /coin EUR | /coin 10 | /coin EUR 10`\n\n" +
    "   *12*. */get*  - Descargar videos de _X_, _Instagram_ o _Youtube_.\n" +
    "__Uso__: - `/get link texto_extra`\n\n" +
    "   *13*. */fetch*  - Hace una petición a una URL y devuelve la respuesta o el error.\n" +
    "__Uso__: - `/fetch https://ejemplo.com/api`\n\n";

  const finalMessage = escapeMarkdownV2(helpMessage, true);

  bot.telegram.sendMessage(memberId, finalMessage, {
    parse_mode: "MarkdownV2",
  });
}

export async function commandsList(ctx, bot) {
  const memberId = ctx.update.message.from.id;
  const chatId = ctx.update.message.chat.id;
  let result = "    (Ninguno aún)"; // string final
  let commArray = []; // array of commands

  // make the api request
  try {
    const response = await axios.get(
      `${process.env.BOT_COMMAND_API}/chat/${chatId}`,
    );

    commArray = response.data.list;
  } catch (error) {
    console.log(error.response);
  }

  if (commArray?.length === 0 || commArray == undefined) {
    bot.telegram.sendMessage(
      memberId,
      "Aun no hay comandos creados en este chat.",
    );
    return;
  }

  // make a list of the created commands
  if (commArray.length > 8) {
    result = commArray
      .map((item, i) => {
        // the 8 first commands are skiped
        if (i < 8) return "";

        return `    *${i - 7}*. (${item.type}) \`/${item.name}\`\n      \`${item.description}\`\n`;
      })
      .join("");
  }

  const finalMessage = escapeMarkdownV2(
    `🔹 *Comandos creados*:\n\n${result}`,
    true,
  );

  await sendLongMessage(bot, memberId, finalMessage, {
    parse_mode: "MarkdownV2",
  });
}
