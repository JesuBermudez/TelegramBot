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

  // no text or caption
  if (cmd === "/") ctx.react("🤨");

  if (cmd.length <= 1 && text.length <= 1) return;

  // bot gives an AI response
  if (!cmd) {
    chatai(ctx, bot, text);
    return;
  }

  // has caption command
  if (message.caption && handleCaptionCommand(ctx, bot, cmd)) return;

  // api request
  try {
    const response = await axios.get(
      `${process.env.BOT_COMMAND_API}/command/${chatId}${cmd}`,
    );

    command = response.data.command;
  } catch (error) {
    if (error.status === 404) {
      ctx.react("🤷‍♂️");
      return;
    }

    ctx.reply(
      error.response?.data?.error ||
        (error.response?.statusText &&
          `${error.response?.statusText} ${error.response?.status}`) ||
        error.message ||
        "Servidor no disponible",
      {
        reply_to_message_id: message.message_id,
      },
    );
    return;
  }

  // delete the main message
  try {
    await bot.telegram.deleteMessage(chatId, message.message_id);
  } catch (error) {}

  sendCreatedCommand(bot, ctx, command);
}
