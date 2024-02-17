import axios from "axios";

export function start(ctx) {
  ctx.reply(
    "Este es el bot de *TeamCoder's*💻 🚀\n\n" +
      "Este se encarga de la _administración_ asi como de responder a los _mensajes_ y a _comandos_\\.\n\n",
    { parse_mode: "MarkdownV2" }
  );
}

export async function help(ctx, bot) {
  const memberId = ctx.update.message.from.id;
  let result = "    \\(Ninguno aún\\)"; // string final
  let response = ""; // api response
  let commArray = []; // array of commands

  // make the api request
  try {
    response = await axios.get(
      `${process.env.API}/chat/` + ctx.update.message.chat.id
    );
    commArray = response.data.list;
  } catch (error) {
    response = "chat not found";
  }

  // make a list of the created commands
  if (commArray.length > 7) {
    result = commArray
      .map((item, i) => {
        // the seven first commands are skiped
        if (i < 8) return "";

        // command structure
        return (
          `    *${i - 7}*\\. \\(${item.type}\\) */*\`` +
          item.name +
          `\`\n      \`` +
          item.description +
          "`\n"
        );
      })
      .join("");
  }

  bot.telegram.sendMessage(
    memberId,
    "🚀 *Comandos* actuales:\n\n" +
      "   *1*\\. */help*   \\- Muestra la lista de comandos\\.\n\n" +
      "   *2*\\. */all*      \\- Menciona a todos los integrantes\\.\n\n" +
      "   *3*\\. */purge*  \\- Borra mensajes\\. \\(Administradores\\)\n" +
      "__Uso__: \\- Responder a al mensaje desde donde se quiera empezar a borrar\n    \\- Usar el comando en la respuesta del mensaje\n\n" +
      "   *4*\\. */alias*   \\- Crea comandos\\.\n" +
      "__Uso__: \\- Responder al Mensaje o Stiker que se quiere guardar\n    \\- Responder con: `/alias nombre descripción` \\(nombre sin espacios\\)\n\n" +
      "   *5*\\. */remove* \\- Elimina un comando\\.\n" +
      "__Uso__: `/remove nombre`\n\n" +
      "   *6*\\. */risa*   \\- Envia un mesaje junto con risas\\.\n" +
      "__Uso__: \\- `/risa numero_de_letras mensaje_extra` \\(respondiendo o no a un mensaje\\)\n\n" +
      "   *7*\\. */tr*   \\- Traduce oraciones\\.\n" +
      "__Uso__: \\- `/tr oracion`\n\n" +
      "🔹 *Comandos creados*:\n" +
      result,
    { parse_mode: "MarkdownV2" }
  );
}
