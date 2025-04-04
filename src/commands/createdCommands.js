import axios from "axios";
import chatai from "../services/chatai.js";

export default async function createdCommands(ctx, bot) {
  // if there is no message text
  if (!ctx.update.message.text) return;

  const message = ctx.update.message; // message object
  const commandString = message.text.trim().split(" ")[0]; // only the command (string)
  const chatId = message.chat.id;
  let response = {}; // api response
  let command = {}; // command from the api

  // bot gives an AI response
  if (
    !commandString.startsWith("/") &&
    Math.floor(Math.random() * 100 + 1) <= 4
  ) {
    chatai(ctx);
    return;
  }

  // message doesn't have a valid command
  if (!commandString.length > 1) return;

  // api request
  try {
    response = await axios.get(
      `${process.env.API}/command/${chatId}/` +
        commandString.substring(1, commandString.length)
    );

    command = response.data.command;
  } catch (error) {
    response = "command not found";
  }

  // if found
  if (response != "command not found") {
    switch (command.type) {
      case "sticker":
        stickerCommand(
          ctx,
          bot,
          chatId,
          command,
          message.hasOwnProperty("reply_to_message")
        );
        break;

      default:
        textCommand(ctx, command, message.hasOwnProperty("reply_to_message"));
        break;
    }
  }
}

function textCommand(ctx, command, reply = false) {
  // checking if is replying to another message
  if (reply) {
    ctx.reply(command.command, {
      reply_to_message_id: ctx.update.message.reply_to_message.message_id,
    });
  } else {
    ctx.reply(command.command);
  }
}

function stickerCommand(ctx, bot, chatId, command, reply = false) {
  // checking if is replying to another message
  if (reply) {
    bot.telegram.sendSticker(chatId, command.command, {
      reply_to_message_id: ctx.update.message.reply_to_message.message_id,
    });
  } else {
    bot.telegram.sendSticker(chatId, command.command);
  }
}
