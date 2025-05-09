import axios from "axios";
import chatai from "../services/chatai.js";
import handleCaptionCommand from "../utils/handleCaptionCommand.js";
import handleMessageText from "../utils/handleMessageText.js";

export default async function createdCommands(ctx, bot) {
  const message = ctx.update.message; // message object
  const { cmd, text } = handleMessageText(message); // command string and text
  const chatId = message.chat.id;
  let response = {}; // api response
  let command = {}; // command from the api

  if (cmd.length <= 1 || text.length <= 1) {
    console.log("No command or text");
    return;
  } // no text or caption

  // bot gives an AI response
  if (!cmd) {
    console.log("ChatAI");
    chatai(ctx, text);
    return;
  }

  // has caption command
  if (message.caption && handleCaptionCommand(ctx, bot, cmd)) return;

  // api request
  try {
    response = await axios.get(
      `${process.env.API}/command/${chatId}/` + cmd.substring(1, cmd.length)
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
