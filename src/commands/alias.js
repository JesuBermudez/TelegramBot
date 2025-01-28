import axios from "axios";

export default async function alias(ctx) {
  const message = ctx.update.message; // message object
  const payload = ctx.payload.trim().split(" "); // text after the command
  const chatId = message.chat.id;

  if (payload[0].length < 1) {
    // message hasn't a command name
    ctx.reply(
      "*Atención:* Por favor introduce el nombre del comando despues de /alias\nPor ejemplo: `/alias command`\n\n*\\(No te olvides de responder al mensaje que quieres que se mande al ejecutar el comando creado\\)*",
      { parse_mode: "MarkdownV2", reply_to_message_id: message.message_id }
    );
    return;
  }

  if (!message.hasOwnProperty("reply_to_message")) {
    // message isn't replying to another message
    ctx.reply(
      "*Atención:* Por favor, no te olvides de responder al mensaje que quieres que se mande al ejecutar el comando creado",
      { parse_mode: "MarkdownV2", reply_to_message_id: message.message_id }
    );
    return;
  }

  // get type and command
  const command = commandType(message);

  // if not text or sticker
  if (command.type == "not available") return;

  // add the command
  try {
    const response = await axios.post(process.env.API + "/command/" + chatId, {
      type: command.type,
      name: payload[0],
      command: command.command,
      description:
        payload.slice(1).join(" ") || `Created by @${message.from.username}`,
      creator: message.from.username,
    });

    if (response.data.message == "Command Created") {
      ctx.reply("✨ *El comando ha sido creado\\!*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: ctx.update.message.message_id,
      });
    }
  } catch (error) {
    // error handling
    if (error.response.data.error == "The command already exists") {
      ctx.reply("⚠️ *El comando esta reservado, intenta con otro nombre\\.*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: message.message_id,
      });
    } else {
      ctx.reply("⚠️ *Anda muerto el server\\.*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: message.message_id,
      });
    }
  }
}

function commandType(message) {
  if (message.reply_to_message.hasOwnProperty("text")) {
    return { type: "text", command: message.reply_to_message.text };
  } else if (message.reply_to_message.hasOwnProperty("sticker")) {
    return {
      type: "sticker",
      command: message.reply_to_message.sticker.file_id,
    };
  } else {
    return { type: "not available", command: "" };
  }
}
