import axios from "axios";

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

export async function add(ctx) {
  let response = ""; // api response
  const chatId = ctx.update.message.chat.id;
  const username = ctx.update.message.from.username;

  try {
    response = await axios.put(
      `${process.env.API}/command/${chatId}/all/` + `@${username}`
    );

    if (response.data.message == "username added") {
      ctx.reply("✨ *El usuario ha sido añadido\\!*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: ctx.update.message.message_id,
      });
    }
  } catch (error) {
    console.log(error);
    if (error.response.data.error == "username not added") {
      ctx.reply("⚠️ *Usuario ya existe\\.*", {
        parse_mode: "MarkdownV2",
        reply_to_message_id: message.message_id,
      });
    }
  }
}
