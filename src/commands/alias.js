import axios from "axios";
import getCommandType from "../utils/getCommandType.js";

export default async function alias(ctx) {
  const message = ctx.update.message; // message object
  const payload = ctx.payload.trim().split(" "); // text after the command

  if (payload[0].length < 1) {
    // message hasn't a command name
    ctx.reply(
      "*Atención:* Por favor introduce el nombre del comando despues de /alias\nPor ejemplo: `/alias command`\n\n*\\(No te olvides de responder al mensaje que quieres que se mande al ejecutar el comando creado\\)*",
      { parse_mode: "MarkdownV2", reply_to_message_id: message.message_id }
    );
    return;
  }

  if (/^[a-zA-Z0-9]+$/.test(payload[0])) {
    ctx.reply(
      "*Atención:* El nombre del comando solo puede contener letras y números, nada de caracteres especiales",
      { parse_mode: "MarkdownV2", reply_to_message_id: message.message_id }
    );
    return;
  }

  if (!message.reply_to_message) {
    ctx.reply(
      "*Atención:* Por favor, no te olvides de responder al mensaje que quieres que se mande al ejecutar el comando creado",
      { parse_mode: "MarkdownV2", reply_to_message_id: message.message_id }
    );
    return;
  }

  // get type and command
  let command = getCommandType(message);

  // if not text or sticker
  if (command.type == "not available") return;

  if (!command.description) {
    command.description =
      payload.slice(1).join(" ") || `Created by @${message.from.username}`;
  }

  // add the command
  try {
    const response = await axios.post(
      process.env.API + "/command/" + message.chat.id,
      {
        ...command,
        name: payload[0],
        creator: message.from.username,
      }
    );

    if (response.data.message == "Command Created") {
      ctx.reply("✨ *El comando ha sido creado\\!*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: message.message_id,
      });
    }
  } catch (error) {
    // error handling
    if (error.response.data.error == "The command already exists") {
      ctx.reply("⚠️ *El comando esta reservado, intenta con otro nombre\\.*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: message.message_id,
      });
    }
  }
}
