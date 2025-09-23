import axios from "axios";
import chatai from "../services/chatai.js";
import handleCaptionCommand from "../utils/handleCaptionCommand.js";
import handleMessageText from "../utils/handleMessageText.js";
import sendCreatedCommand from "../utils/sendCreatedCommand.js";

export default async function createdCommands(ctx, bot) {
  const message = ctx.update.message; // message object
  const { cmd, text } = handleMessageText(message); // command string and text
  const chatId = message.chat.id;
  let command = {}; // command from the api

  if (cmd.length <= 1 && text.length <= 1) return; // no text or caption

  // bot gives an AI response
  if (!cmd) {
    chatai(ctx, text);
    return;
  }

  // has caption command
  if (message.caption && handleCaptionCommand(ctx, bot, cmd)) return;

  // api request
  try {
    const response = await axios.get(
      `${process.env.API}/command/${chatId}/` + cmd.substring(1, cmd.length)
    );
    command = response.data.command;
  } catch (error) {
    ctx.reply(error.response?.data?.error || error.message, {
      reply_to_message_id: message.message_id,
    });
    return;
  }

  // delete the main message
  try {
    await bot.telegram.deleteMessage(chatId, message.message_id);
  } catch (error) {}

  sendCreatedCommand(bot, ctx, command);
}
