import axios from "axios";

export async function all(ctx, bot) {
  const message = ctx.update.message; // message object
  const chatId = message.chat.id;
  let response = ""; // api response
  let command = {}; // the "all" command

  // verify that the member isn't KENDRYS
  const chatMember = await bot.telegram.getChatMember(chatId, message.from.id);

  if (chatMember.user.username == "kendricita") return;

  // make the api request
  try {
    response = await axios.get(`${process.env.API}/command/${chatId}/all`);
    command = response.data.command;
  } catch (error) {
    response = "command not found";
  }

  // if command not found
  if (response == "command not found") return;

  // if is empty
  if (command.command.trim().length < 1) return;

  // if is replying to another message
  if (message.hasOwnProperty("reply_to_message")) {
    try {
      await bot.telegram.deleteMessage(chatId, message.message_id);
    } catch (error) {}

    ctx.reply(command.command, {
      reply_to_message_id: message.reply_to_message.message_id,
    });
  } else {
    ctx.reply(command.command, {
      reply_to_message_id: message.message_id,
    });
  }
}

export async function add(ctx) {
  const message = ctx.update.message; // message object
  const chatId = message.chat.id;
  const username = message.from.username;
  let response = ""; // api response

  try {
    response = await axios.put(
      `${process.env.API}/command/${chatId}/all/` + `@${username}`
    );

    if (response.data.message == "username added") {
      ctx.reply("✨ *El usuario ha sido añadido\\!*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: message.message_id,
      });
    }
  } catch (error) {
    if (error.response.status == 304) {
      ctx.reply("⚠️ *Usuario ya existe\\.*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: message.message_id,
      });
    }
    console.log(error.data.error);
  }
}
