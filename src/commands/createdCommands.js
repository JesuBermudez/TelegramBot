import axios from "axios";
import chatai from "../services/chatai.js";
import handleCaptionCommand from "../utils/handleCaptionCommand.js";
import handleMessageText from "../utils/handleMessageText.js";

export default async function createdCommands(ctx, bot) {
  const { commandString, text } = handleMessageText(ctx); // command string and text
  const message = ctx.update.message; // message object
  const chatId = message.chat.id;
  let response = {}; // api response
  let command = {}; // command from the api

  if (commandString.length <= 1) return; // no text or caption

  // bot gives an AI response
  if (!commandString.startsWith("/")) {
    chatai(ctx, `${commandString} ${text}`);
    return;
  }

  // has caption command
  if (message.caption && handleCaptionCommand(ctx, bot, commandString)) return;

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
        stickerCommand(bot, chatId, command, message);
        break;

      case "text":
        textCommand(ctx, command, message);
        break;
    }
  }
}

function textCommand(ctx, command, message) {
  ctx.reply(command.command, {
    reply_to_message_id: message.reply_to_message?.message_id,
  });
}

function stickerCommand(bot, chatId, command, message) {
  bot.telegram.sendSticker(chatId, command.command, {
    reply_to_message_id: message.reply_to_message?.message_id,
  });
}
