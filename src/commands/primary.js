import axios from "axios";

export function start(ctx) {
  ctx.reply(
    "Este es el bot de *TeamCoder's*💻 🚀\n\n" +
      "Este se encarga de la _administración_ asi como de responder a los _mensajes_ y a _comandos_\\.\n\n",
    { parse_mode: "MarkdownV2" }
  );
}

export async function help(ctx) {
  // string final
  let result = "    \\(Ninguno aún\\)";
  // api response
  let response = "";
  // array of commands
  let commArray = [];

  // make the api request
  try {
    response = await axios.get(
      process.env.API + "/chat/" + ctx.update.message.chat.id
    );
    commArray = response.data.chat.list;
  } catch (error) {
    response = "chat not found";
  }

  // make a list of the created commands
  if (commArray.length > 7) {
    result = commArray
      .map((item, i) => {
        // the seven first commands are skiped
        if (i < 7) return "";
        // spacing between command and (-)
        let sp =
          item.name.length > 12
            ? ""
            : spaceString[spaceString.length - item.name.length];
        // command structure
        return (
          `    *${i - 6}*\\. \\(${item.type}\\) */` +
          item.name +
          `* ${sp}\\- \`` +
          item.description +
          "`\n"
        );
      })
      .join("");
  }

  ctx.reply(
    "🚀 *Comandos* actuales:\n\n" +
      "   *1*\\. */help*   \\- Muestra la lista de comandos\\.\n" +
      "   *2*\\. */all*      \\- Menciona a todos los integrantes\\.\n" +
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

export async function all(ctx) {
  let response = ""; // api response
  let command = {}; // the "all" command

  // make the api request
  try {
    response = await axios.get(
      `${process.env.API}/command/${ctx.update.message.chat.id}/all`
    );
    command = response.response.data.command;
  } catch (error) {
    response = "command not found";
  }

  // if command not found
  if (response == "command not found") return;

  // if is empty
  if (command.command.trim().length < 1) return;

  ctx.reply(command.command, {
    reply_to_message_id: ctx.update.message.message_id,
  });
}

const spaceString = [
  "",
  " ",
  "   ",
  "     ",
  "       ",
  "         ",
  "           ",
  "              ",
  "                 ",
  "                    ",
  "                       ",
];
